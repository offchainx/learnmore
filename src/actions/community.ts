'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { getCurrentUser } from '@/actions/auth'

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: {
    author: {
      select: {
        id: true
        username: true
        avatar: true
        role: true
      }
    }
    _count: {
      select: {
        comments: true
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
}>

export type CommentWithAuthor = Prisma.CommentGetPayload<{
  include: {
    author: {
      select: {
        id: true
        username: true
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
}>

interface GetPostsParams {
  subjectId?: string
  category?: string
  unanswered?: boolean
  page?: number
  limit?: number
  search?: string
}

export async function getPosts({
  subjectId,
  category,
  unanswered,
  page = 1,
  limit = 10,
  search,
}: GetPostsParams = {}) {
  const skip = (page - 1) * limit

  const where: Prisma.PostWhereInput = {
    ...(subjectId ? { subjectId } : {}),
    ...(category ? { category } : {}),
    ...(unanswered ? { isSolved: false, category: 'Question' } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
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
}: { 
  title: string; 
  content: string; 
  category: string;
  subjectId?: string;
  tags?: string[];
}) {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: 'User not authenticated.' }
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        category,
        authorId: user.id,
        subjectId,
        tags,
      },
    })
    return { success: true, post: newPost }
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
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
    })
    
    if (!post) return null

    // Flatten userLiked for easier client use
    return {
      ...post,
      userLiked: post.likes ? post.likes.length > 0 : false,
      likeCount: post._count.likes
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
    const newComment = await prisma.comment.create({
      data: {
        postId,
        authorId: user.id,
        content,
      },
      include: { // Include author for immediate display in client
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
          },
        },
      },
    })
    return { success: true, comment: newComment }
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
