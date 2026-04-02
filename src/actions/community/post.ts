'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getCurrentUser } from '@/actions/user/auth'
import {
  triggerCommunityMentionNotification,
  triggerSocialReplyNotification,
} from '../notification/triggers'
import { awardBadgeIfEligible } from '@/actions/gamification/achievements'
import { revalidateTag } from 'next/cache'
import { runAfterTask } from '@/lib/server/run-after-task'
import {
  extractMentionHandlesFromText,
  normalizeHandle,
  uniqueHandles,
} from '@/lib/users/handle'
import { resolveUsersByHandles } from '@/lib/users/handle-server'

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: {
    author: {
      select: {
        id: true
        username: true
        handle: true
        avatar: true
        role: true
      }
    }
    _count: {
      select: {
        comments: true
        likes: true
        bookmarks: true
      }
    }
    subject: {
      select: {
        id: true
        name: true
        icon: true
      }
    }
  }
}> & {
  bookmarks?: Array<{
    id: string
    userId: string
    postId: string
    createdAt: Date
  }>
}

export type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: {
    author: {
      select: {
        id: true
        username: true
        handle: true
        avatar: true
        role: true
      }
    }
  }
}>

export type PostWithAuthorAndComments = Prisma.PostGetPayload<{
  include: {
    author: {
      select: {
        id: true
        username: true
        handle: true
        avatar: true
        role: true
      }
    }
    subject: {
      select: {
        id: true
        name: true
        icon: true
      }
    }
    comments: {
      include: {
        author: {
          select: {
            id: true
            username: true
            handle: true
            avatar: true
            role: true
          }
        }
      }
      orderBy: {
        createdAt: 'asc'
      }
    }
  }
}> & {
  bookmarks?: Array<{
    id: string
    userId: string
    postId: string
    createdAt: Date
  }>
}

interface GetPostsParams {
  subjectId?: string
  category?: string
  unanswered?: boolean
  page?: number
  limit?: number
  search?: string
  sort?: 'recent-posts' | 'recent-replies' | 'most-comments'
  viewerUserId?: string
  viewerRole?: string
}

const COMMUNITY_DEDUP_WINDOW_MS = 2 * 60 * 1000

function normalizeCommunityText(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function normalizeCommunityTags(tags: string[]): string {
  return tags
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .sort()
    .join('|')
}

function normalizeCommunityHandles(handles: string[]): string {
  return handles
    .map((handle) => normalizeHandle(handle))
    .filter(Boolean)
    .sort()
    .join('|')
}

function buildActorName(user: { handle?: string | null; username?: string | null }) {
  if (user.handle) return `@${user.handle}`
  return user.username || '有人'
}

function isSamePostSignature(
  post: {
    title: string
    content: string
    category: string | null
    subjectId: string | null
    tags: string[]
    isPrivate: boolean
    mentionedHandles: string[]
  },
  signature: {
    title: string
    content: string
    category: string
    subjectId?: string
    tags: string[]
    isPrivate: boolean
    mentionedHandles: string[]
  },
) {
  return (
    normalizeCommunityText(post.title) ===
      normalizeCommunityText(signature.title) &&
    normalizeCommunityText(post.content) ===
      normalizeCommunityText(signature.content) &&
    (post.category ?? '') === signature.category &&
    (post.subjectId ?? '') === (signature.subjectId ?? '') &&
    post.isPrivate === signature.isPrivate &&
    normalizeCommunityTags(post.tags) === normalizeCommunityTags(signature.tags) &&
    normalizeCommunityHandles(post.mentionedHandles) ===
      normalizeCommunityHandles(signature.mentionedHandles)
  )
}

function canViewPrivatePost(
  post: {
    authorId: string
    isPrivate: boolean
  },
  user?: {
    id: string
    role?: string | null
  } | null,
) {
  if (!post.isPrivate) return true
  if (!user) return false
  return (
    post.authorId === user.id ||
    user.role === 'ADMIN' ||
    user.role === 'TEACHER'
  )
}

function isSameCommentSignature(
  comment: {
    content: string
    postId: string
  },
  signature: {
    content: string
    postId: string
  },
) {
  return (
    comment.postId === signature.postId &&
    normalizeCommunityText(comment.content) ===
      normalizeCommunityText(signature.content)
  )
}

function buildPostOrderBy(sort: GetPostsParams['sort']) {
  if (sort === 'recent-replies' || sort === 'most-comments') {
    return [{ comments: { _count: 'desc' as const } }, { createdAt: 'desc' as const }]
  }

  return [{ createdAt: 'desc' as const }]
}

export async function getPosts({
  subjectId,
  category,
  unanswered,
  page = 1,
  limit = 10,
  search,
  sort = 'recent-posts',
  viewerUserId,
  viewerRole,
}: GetPostsParams = {}) {
  const skip = (page - 1) * limit
  const currentUser =
    viewerUserId || viewerRole ? { id: viewerUserId || '', role: viewerRole } : await getCurrentUser()
  const canViewPrivate = Boolean(
    currentUser &&
      (currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER'),
  )

  const where: Prisma.PostWhereInput = {}

  if (subjectId) where.subjectId = subjectId
  if (category) where.category = category
  if (unanswered) {
    where.isSolved = false
    where.category = 'Question'
  }

  const filters: Prisma.PostWhereInput[] = []

  if (currentUser && !canViewPrivate) {
    filters.push({
      OR: [{ isPrivate: false }, { authorId: currentUser.id }],
    })
  } else if (!currentUser) {
    filters.push({ isPrivate: false })
  }

  if (search) {
    filters.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ],
    })
  }

  if (filters.length === 1) {
    Object.assign(where, filters[0])
  } else if (filters.length > 1) {
    where.AND = filters
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            handle: true,
            avatar: true,
            role: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            bookmarks: true,
          },
        },
        bookmarks: currentUser
          ? {
              where: {
                userId: currentUser.id,
              },
              select: {
                id: true,
                userId: true,
                postId: true,
                createdAt: true,
              },
            }
          : false,
        subject: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: buildPostOrderBy(sort),
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ])

  return {
    posts,
    metadata: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  }
}

export async function getCategories() {
  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      name: true,
      icon: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: {
      order: 'asc',
    },
  })
  
  return subjects
}

export async function createPost({
  title,
  content,
  category,
  subjectId,
  tags = [],
  isPrivate = false,
  attachmentUrls = [],
  mentionedHandles = [],
}: { 
  title: string; 
  content: string; 
  category: string;
  subjectId?: string;
  tags?: string[];
  isPrivate?: boolean;
  attachmentUrls?: string[];
  mentionedHandles?: string[];
}) {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: 'User not authenticated.' }
  }

  try {
    const resolvedMentionHandles = uniqueHandles([
      ...mentionedHandles,
      ...extractMentionHandlesFromText(content),
    ])

    const signature = {
      title,
      content,
      category,
      subjectId,
      tags,
      isPrivate,
      mentionedHandles: resolvedMentionHandles,
    }
    const dedupWindowStart = new Date(Date.now() - COMMUNITY_DEDUP_WINDOW_MS)
    const recentPosts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        createdAt: {
          gte: dedupWindowStart,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    const duplicatedPost = recentPosts.find((post) =>
      isSamePostSignature(post, signature),
    )

    if (duplicatedPost) {
      return { success: true, post: duplicatedPost, deduped: true }
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        category,
        authorId: user.id,
        subjectId,
        tags,
        isPrivate,
        attachments: attachmentUrls,
        mentionedHandles: resolvedMentionHandles,
        mentionedUserIds: [],
      },
    })
    await awardBadgeIfEligible(user.id, 'COMMUNITY')
    revalidateTag('community-feed', 'quick')
    revalidateTag('community-categories', 'quick')
    revalidateTag(`achievement-overview:${user.id}`, 'quick')
    revalidateTag(`user-badges:${user.id}`, 'quick')

    if (resolvedMentionHandles.length > 0) {
      const mentionedUsers = await resolveUsersByHandles(resolvedMentionHandles)

      const mentionTargets = mentionedUsers.filter(
        (mentionedUser) =>
          mentionedUser.id !== user.id && !isPrivate && Boolean(mentionedUser.id),
      )

      if (mentionedUsers.length > 0) {
        await prisma.post.update({
          where: { id: newPost.id },
          data: {
            mentionedUserIds: mentionedUsers.map((mentionedUser) => mentionedUser.id),
          },
        })
      }

      if (mentionTargets.length > 0) {
        await Promise.all(
          mentionTargets.map((mentionedUser) =>
            triggerCommunityMentionNotification(
              mentionedUser.id,
              buildActorName(user),
              newPost.id,
              newPost.title,
              newPost.content,
            ),
          ),
        )
      }
    }

    return { success: true, post: newPost, deduped: false }
  } catch (error: unknown) {
    console.error('Error creating post:', error)
    let message = 'Failed to create post.'
    if (error instanceof Error) {
      message = error.message
    }
    return { success: false, error: message }
  }
}

export async function getPostById(postId: string) {
  const user = await getCurrentUser()
  
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            handle: true,
            avatar: true,
            role: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                handle: true,
                avatar: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        likes: user ? {
          where: { userId: user.id }
        } : false,
        bookmarks: user ? {
          where: { userId: user.id },
          select: {
            id: true,
            userId: true,
            postId: true,
            createdAt: true,
          },
        } : false,
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          }
        }
      },
    })
    
    if (!post) return null

    if (!canViewPrivatePost(post, user)) {
      return null
    }

    // Flatten userLiked for easier client use
    return {
      ...post,
      userLiked: post.likes ? post.likes.length > 0 : false,
      userBookmarked: post.bookmarks ? post.bookmarks.length > 0 : false,
      likeCount: post._count.likes,
      bookmarkCount: post._count.bookmarks,
    }
  } catch (error: unknown) {
    console.error('Error fetching post by ID:', error)
    return null
  }
}

export async function createComment({
  postId,
  content,
}: { postId: string; content: string }) {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: 'User not authenticated.' }
  }

  try {
    const signature = {
      postId,
      content,
    }
    const dedupWindowStart = new Date(Date.now() - COMMUNITY_DEDUP_WINDOW_MS)
    const recentComments = await prisma.comment.findMany({
      where: {
        postId,
        authorId: user.id,
        createdAt: {
          gte: dedupWindowStart,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            handle: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    const duplicatedComment = recentComments.find((comment) =>
      isSameCommentSignature(comment, signature),
    )

    if (duplicatedComment) {
      return { success: true, comment: duplicatedComment, deduped: true }
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true, isPrivate: true }
    })

    if (!post || !canViewPrivatePost(post, user)) {
      return { success: false, error: 'Unauthorized' }
    }

    const newComment = await prisma.comment.create({
      data: {
        postId,
        authorId: user.id,
        content,
        mentionedHandles: uniqueHandles(extractMentionHandlesFromText(content)),
        mentionedUserIds: [],
      },
      include: { // Include author for immediate display in client
        author: {
          select: {
            id: true,
            username: true,
            handle: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    if (newComment.mentionedHandles.length > 0 && !post.isPrivate) {
      const mentionedUsers = await resolveUsersByHandles(newComment.mentionedHandles)
      const mentionTargets = mentionedUsers.filter((mentionedUser) => mentionedUser.id !== user.id)

      if (mentionedUsers.length > 0) {
        await prisma.comment.update({
          where: { id: newComment.id },
          data: {
            mentionedUserIds: mentionedUsers.map((mentionedUser) => mentionedUser.id),
          },
        })
      }

      if (mentionTargets.length > 0) {
        await Promise.all(
          mentionTargets.map((mentionedUser) =>
            triggerCommunityMentionNotification(
              mentionedUser.id,
              buildActorName(user),
              postId,
              post.title,
              content,
            ),
          ),
        )
      }
    }

    if (post && post.authorId !== user.id) {
      await triggerSocialReplyNotification(
        post.authorId,
        buildActorName(user),
        postId,
        post.title,
        content
      )
    }

    runAfterTask(async () => {
      await awardBadgeIfEligible(user.id, 'COMMUNITY')
      revalidateTag('community-feed', 'quick')
      revalidateTag('community-categories', 'quick')
      revalidateTag(`achievement-overview:${user.id}`, 'quick')
      revalidateTag(`user-badges:${user.id}`, 'quick')
    }, 'community-comment-side-effects')

    return { success: true, comment: newComment, deduped: false }
  } catch (error: unknown) {
    console.error('Error creating comment:', error)
    let errorMessage = 'Failed to create comment.'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function toggleLike(postId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: 'User not authenticated.' }
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
        isPrivate: true,
      },
    })

    if (!post || !canViewPrivatePost(post, user)) {
      return { success: false, error: 'Unauthorized' }
    }

    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.postLike.delete({
          where: { id: existingLike.id },
        }),
        prisma.post.update({
          where: { id: postId },
          data: {
            likeCount: { decrement: 1 },
          },
        }),
      ])
      revalidateTag('community-feed', 'quick')
      revalidateTag('community-categories', 'quick')
      return { success: true, liked: false }
    } else {
      // Like
      await prisma.$transaction([
        prisma.postLike.create({
          data: {
            userId: user.id,
            postId: postId,
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: {
            likeCount: { increment: 1 },
          },
        }),
      ])
      revalidateTag('community-feed', 'quick')
      revalidateTag('community-categories', 'quick')
      return { success: true, liked: true }
    }
  } catch (error: unknown) {
    console.error('Error toggling like:', error);
    let errorMessage = 'Failed to toggle like.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function setPostSolved({
  postId,
  solved,
}: {
  postId: string
  solved: boolean
}) {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: 'User not authenticated.' }
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        category: true,
        isSolved: true,
        isPrivate: true,
      },
    })

    if (!post) {
      return { success: false, error: 'Post not found.' }
    }

    if (!canViewPrivatePost(post, user)) {
      return { success: false, error: 'Unauthorized' }
    }

    if (post.category !== 'Question') {
      return {
        success: false,
        error: 'Only question posts can be marked as solved.',
      }
    }

    const canModerate = user.role === 'ADMIN' || user.role === 'TEACHER'
    const isOwner = post.authorId === user.id
    if (!canModerate && !isOwner) {
      return { success: false, error: 'Unauthorized' }
    }

    if (post.isSolved === solved) {
      return {
        success: true,
        solved: post.isSolved,
        deduped: true,
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        isSolved: solved,
      },
      select: {
        id: true,
        isSolved: true,
      },
    })

    revalidateTag('community-feed', 'quick')
    revalidateTag('community-categories', 'quick')

    return {
      success: true,
      solved: updatedPost.isSolved,
      deduped: false,
    }
  } catch (error: unknown) {
    console.error('Error setting post solved state:', error)
    let errorMessage = 'Failed to update solved state.'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}

export async function toggleBookmark(postId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: 'User not authenticated.' }
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
        isPrivate: true,
      },
    })

    if (!post || !canViewPrivatePost(post, user)) {
      return { success: false, error: 'Unauthorized' }
    }

    const existingBookmark = await prisma.postBookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId,
        },
      },
    })

    if (existingBookmark) {
      await prisma.postBookmark.delete({
        where: { id: existingBookmark.id },
      })
      revalidateTag('community-feed', 'quick')
      revalidateTag('community-categories', 'quick')
      return { success: true, bookmarked: false }
    }

    await prisma.postBookmark.create({
      data: {
        userId: user.id,
        postId,
      },
    })
    revalidateTag('community-feed', 'quick')
    revalidateTag('community-categories', 'quick')
    return { success: true, bookmarked: true }
  } catch (error: unknown) {
    console.error('Error toggling bookmark:', error)
    let errorMessage = 'Failed to toggle bookmark.'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return { success: false, error: errorMessage }
  }
}
