'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Bookmark,
  Bot,
  ChevronDown,
  CircleCheck,
  Crown,
  Flame,
  Hash,
  Heart,
  MessageSquare,
  Mic,
  Paperclip,
  Plus,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react'
import { useApp } from '@/providers'
import {
  getCategories,
  PostWithAuthor,
  toggleBookmark,
  toggleLike,
} from '@/actions/community/post'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'
import { PageEmptyState } from '@/components/shared/PageEmptyState'
import { toast } from '@/components/ui/use-toast'
import { PageHeroTitle } from '@/components/shared/PageHeroTitle'
import {
  fetchWithTimeout,
  isAbortLikeError,
} from '@/lib/http/fetch-with-timeout'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import {
  pageCardTitleClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'
import {
  pageBadgeMutedClass,
  pageHeroShellClass,
  pageInputClass,
  pageInsetClass,
  pagePanelClass,
  pagePillActiveClass,
  pagePillInactiveClass,
  pageSegmentedButtonClass,
  pageSegmentedControlClass,
  pageShellFrameClass,
} from '@/components/shared/pageSurfaces'
import {
  pageGridGapClass,
  pageSectionGapClass,
  pageSectionGapCompactClass,
} from '@/components/shared/pageSpacing'

type SubjectOption = Awaited<ReturnType<typeof getCategories>>[number]

interface CommunityViewProps {
  initialPosts?: PostWithAuthor[]
  subjects?: SubjectOption[]
  initialSearchQuery?: string
  initialSortMode?: SortMode
  initialScopeFilter?: ScopeFilter
  initialBoardId?: string | 'all'
}

type FeedPost = PostWithAuthor & {
  likeCount: number
  userLiked: boolean
  userBookmarked: boolean
  _count: {
    comments: number
    likes?: number
    bookmarks?: number
  }
  bookmarkCount: number
}

type ScopeFilter = 'all' | 'following' | 'by-date'
type SortMode = 'recent-replies' | 'recent-posts' | 'most-comments'

const surfaceClassName = pagePanelClass

const insetCardClassName = pageInsetClass

function normalizePosts(posts: PostWithAuthor[]): FeedPost[] {
  return posts.map((post) => {
    const rawPost = post as PostWithAuthor & {
      likeCount?: number
      userLiked?: boolean
      userBookmarked?: boolean
      bookmarkCount?: number
      _count?: {
        comments: number
        likes?: number
        bookmarks?: number
      }
      bookmarks?: Array<{
        id: string
        userId: string
        postId: string
        createdAt: Date
      }>
    }

    const likeCount =
      typeof rawPost.likeCount === 'number'
        ? rawPost.likeCount
        : (rawPost._count?.likes ?? 0)
    const commentCount = post._count.comments
    const bookmarkCount =
      typeof rawPost.bookmarkCount === 'number'
        ? rawPost.bookmarkCount
        : (rawPost._count?.bookmarks ?? rawPost.bookmarks?.length ?? 0)

    return {
      ...post,
      likeCount,
      userLiked: Boolean(rawPost.userLiked),
      userBookmarked: Boolean(
        rawPost.userBookmarked ?? (rawPost.bookmarks?.length ?? 0) > 0
      ),
      _count: {
        comments: commentCount,
        likes: rawPost._count?.likes ?? 0,
        bookmarks: rawPost._count?.bookmarks ?? rawPost.bookmarks?.length ?? 0,
      },
      bookmarkCount,
    }
  })
}

function formatRelativeTime(
  dateValue: Date | string,
  lang: 'en' | 'zh' | 'ms'
) {
  const timestamp = new Date(dateValue).getTime()
  const diffMs = Date.now() - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day

  if (diffMs < hour) {
    const count = Math.max(1, Math.floor(diffMs / minute))
    if (lang === 'zh') return `${count} 分钟前`
    if (lang === 'ms') return `${count} minit lalu`
    return `${count}m ago`
  }

  if (diffMs < day) {
    const count = Math.max(1, Math.floor(diffMs / hour))
    if (lang === 'zh') return `${count} 小时前`
    if (lang === 'ms') return `${count} jam lalu`
    return `${count}h ago`
  }

  if (diffMs < week) {
    const count = Math.max(1, Math.floor(diffMs / day))
    if (lang === 'zh') return `${count} 天前`
    if (lang === 'ms') return `${count} hari lalu`
    return `${count}d ago`
  }

  if (diffMs < month) {
    const count = Math.max(1, Math.floor(diffMs / week))
    if (lang === 'zh') return `${count} 周前`
    if (lang === 'ms') return `${count} minggu lalu`
    return `${count}w ago`
  }

  const count = Math.max(1, Math.floor(diffMs / month))
  if (lang === 'zh') return `${count} 个月前`
  if (lang === 'ms') return `${count} bulan lalu`
  return `${count}mo ago`
}

function formatStableDate(
  dateValue: Date | string,
  lang: 'en' | 'zh' | 'ms'
) {
  const locale = lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms-MY' : 'en-MY'

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(dateValue))
}

function groupLabel(dateValue: Date | string, lang: 'en' | 'zh' | 'ms') {
  const timestamp = new Date(dateValue).getTime()
  const diffMs = Date.now() - timestamp
  const day = 24 * 60 * 60 * 1000
  if (diffMs < day) {
    if (lang === 'zh') return '今天'
    if (lang === 'ms') return 'Hari ini'
    return 'Today'
  }
  if (diffMs < 2 * day) {
    if (lang === 'zh') return '昨天'
    if (lang === 'ms') return 'Semalam'
    return 'Yesterday'
  }
  if (diffMs < 7 * day) {
    if (lang === 'zh') return '本周'
    if (lang === 'ms') return 'Minggu ini'
    return 'This Week'
  }
  if (lang === 'zh') return '更早'
  if (lang === 'ms') return 'Terdahulu'
  return 'Earlier'
}

function comparePosts(a: FeedPost, b: FeedPost, sortMode: SortMode) {
  const aCreated = new Date(a.createdAt).getTime()
  const bCreated = new Date(b.createdAt).getTime()

  if (sortMode === 'most-comments') {
    if (b._count.comments !== a._count.comments) {
      return b._count.comments - a._count.comments
    }
    return bCreated - aCreated
  }

  if (sortMode === 'recent-replies') {
    if (b._count.comments !== a._count.comments) {
      return b._count.comments - a._count.comments
    }
    return bCreated - aCreated
  }

  return bCreated - aCreated
}

export function CommunityView({
  initialPosts = [],
  subjects = [],
  initialSearchQuery = '',
  initialSortMode = 'recent-posts',
  initialScopeFilter = 'all',
  initialBoardId = 'all',
}: CommunityViewProps) {
  const { t, lang } = useApp()
  const [posts, setPosts] = useState<FeedPost[]>(() =>
    normalizePosts(initialPosts)
  )
  const [isHydrated, setIsHydrated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>(initialScopeFilter)
  const [sortMode, setSortMode] = useState<SortMode>(initialSortMode)
  const [activeBoardId, setActiveBoardId] = useState<string | 'all'>(
    initialBoardId
  )
  const lastLoadedKeyRef = useRef<string>(initialPosts.length > 0 ? 'feed' : '')

  const followedBoardIds = useMemo(
    () =>
      subjects.slice(0, Math.min(3, subjects.length)).map((item) => item.id),
    [subjects]
  )

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const copy = useMemo(() => {
    if (lang === 'zh') {
      return {
        badge: 'Community Hub',
        searchPlaceholder: '搜索帖子、板块或标签',
        publish: '发布帖子',
        all: '所有',
        following: '已关注',
        byDate: '按日期查看',
        sort: '排序方式',
        recentReplies: '最近回复',
        recentPosts: '最近发帖',
        mostComments: '最多评论',
        loadFailed: '加载失败，请稍后重试。',
        loading: '正在加载社区动态...',
        noPosts: '当前筛选下还没有帖子。',
        noFollowingPosts: '你关注的板块里还没有新帖子。',
        roomsTitle: '实时自习室',
        roomsSub: '在线学习房，点击即可加入同步讨论。',
        liveNow: '在线中',
        online: '在线',
        boardsTitle: '全部内容',
        boardsSub: '按板块切换帖子流，快速查看对应内容。',
        boardGroupA: '公共版块',
        boardGroupB: '课程专区',
        boardAll: '全部内容',
        boardFollowing: '已关注板块',
        boardUnanswered: '待解答',
        contributorsTitle: '活跃贡献者',
        contributorsSub: '最近发帖和回答最活跃的同学。',
        hotTopicsTitle: '热门话题',
        hotTopicsSub: '继续追踪最近最热的标签。',
        viewLeaderboard: '查看排行榜',
        share: '分享',
        comments: '评论',
        bookmarks: '收藏',
        boardLabel: '板块',
        noteTag: '笔记',
        discussionTag: '讨论',
        questionTag: '提问',
        solvedTag: '已解决',
        achievementTag: '成就',
        privateTag: '仅自己可见',
        attachmentsTitle: '附件',
        aiHint: 'AI 助手',
      }
    }

    if (lang === 'ms') {
      return {
        badge: 'Community Hub',
        searchPlaceholder: 'Cari siaran, papan atau tag',
        publish: 'Siarkan',
        all: 'Semua',
        following: 'Diikuti',
        byDate: 'Ikut tarikh',
        sort: 'Susun',
        recentReplies: 'Balasan terkini',
        recentPosts: 'Siaran terkini',
        mostComments: 'Komen terbanyak',
        loadFailed: 'Gagal memuatkan siaran.',
        loading: 'Memuatkan komuniti...',
        noPosts: 'Belum ada siaran untuk penapis ini.',
        noFollowingPosts:
          'Belum ada siaran baharu dalam papan yang anda ikuti.',
        roomsTitle: 'Bilik belajar langsung',
        roomsSub: 'Sertai bilik belajar serentak dan berbincang bersama.',
        liveNow: 'Sedang live',
        online: 'dalam talian',
        boardsTitle: 'Semua kandungan',
        boardsSub:
          'Tukar aliran mengikut papan untuk melihat kandungan yang berkaitan.',
        boardGroupA: 'Papan awam',
        boardGroupB: 'Zon kursus',
        boardAll: 'Semua kandungan',
        boardFollowing: 'Papan diikuti',
        boardUnanswered: 'Belum dijawab',
        contributorsTitle: 'Penyumbang aktif',
        contributorsSub:
          'Pelajar paling aktif memuat naik dan menjawab baru-baru ini.',
        hotTopicsTitle: 'Topik hangat',
        hotTopicsSub: 'Jejak tag yang sedang mendapat perhatian.',
        viewLeaderboard: 'Lihat carta',
        share: 'Kongsi',
        comments: 'Komen',
        bookmarks: 'Simpan',
        boardLabel: 'Papan',
        noteTag: 'Nota',
        discussionTag: 'Perbincangan',
        questionTag: 'Soalan',
        solvedTag: 'Selesai',
        achievementTag: 'Pencapaian',
        privateTag: 'Hanya saya boleh lihat',
        attachmentsTitle: 'Lampiran',
        aiHint: 'AI',
      }
    }

    return {
      badge: 'Community Hub',
      searchPlaceholder: 'Search posts, boards or tags',
      publish: 'New Post',
      all: 'All',
      following: 'Following',
      byDate: 'By date',
      sort: 'Sort',
      recentReplies: 'Recent replies',
      recentPosts: 'Recent posts',
      mostComments: 'Most comments',
      loadFailed: 'Failed to load posts.',
      loading: 'Loading community feed...',
      noPosts: 'No posts found for this filter.',
      noFollowingPosts: 'No new posts in the boards you follow yet.',
      roomsTitle: 'Live study rooms',
      roomsSub: 'Join an active room and discuss while studying together.',
      liveNow: 'Live',
      online: 'online',
      boardsTitle: 'All content',
      boardsSub: 'Switch by board to view the matching stream quickly.',
      boardGroupA: 'Public boards',
      boardGroupB: 'Course boards',
      boardAll: 'All content',
      boardFollowing: 'Following',
      boardUnanswered: 'Unanswered',
      contributorsTitle: 'Active contributors',
      contributorsSub: 'Students who post and answer the most recently.',
      hotTopicsTitle: 'Hot topics',
      hotTopicsSub: 'Track the tags getting the most traction.',
      viewLeaderboard: 'View leaderboard',
      share: 'Share',
      comments: 'Comments',
      bookmarks: 'Bookmarks',
      boardLabel: 'Board',
      noteTag: 'Note',
      discussionTag: 'Discussion',
      questionTag: 'Question',
      solvedTag: 'Solved',
      achievementTag: 'Achievement',
      privateTag: 'Only visible to me',
      attachmentsTitle: 'Attachments',
      aiHint: 'AI',
    }
  }, [lang])

  const rooms = useMemo(
    () => [
      {
        name:
          lang === 'zh'
            ? '深夜数学自习'
            : lang === 'ms'
              ? 'Belajar Matematik Malam'
              : 'Late Night Math',
        topic:
          lang === 'zh'
            ? '函数与导数'
            : lang === 'ms'
              ? 'Fungsi & kalkulus'
              : 'Functions & calculus',
        users: 12,
        avatars: [1, 2, 3, 4],
      },
      {
        name:
          lang === 'zh'
            ? '刷题冲刺房'
            : lang === 'ms'
              ? 'Bilik latihan fokus'
              : 'Focused Drill Room',
        topic:
          lang === 'zh'
            ? '模拟练习'
            : lang === 'ms'
              ? 'Latihan simulasi'
              : 'Mock practice',
        users: 34,
        avatars: [5, 6, 7],
      },
      {
        name:
          lang === 'zh'
            ? '物理答疑台'
            : lang === 'ms'
              ? 'Sudut soal jawab fizik'
              : 'Physics Q&A Room',
        topic:
          lang === 'zh'
            ? '力学图像'
            : lang === 'ms'
              ? 'Graf mekanik'
              : 'Mechanics graphs',
        users: 8,
        avatars: [8, 9],
      },
    ],
    [lang]
  )

  const contributors = useMemo(
    () => [
      {
        name: 'Michael Z.',
        solved: 142,
        rank: 1,
        badge:
          lang === 'zh'
            ? '数学接力王'
            : lang === 'ms'
              ? 'Pakar Matematik'
              : 'Math Wizard',
      },
      {
        name: 'Sarah L.',
        solved: 98,
        rank: 2,
        badge:
          lang === 'zh'
            ? '物理解题手'
            : lang === 'ms'
              ? 'Pakar Fizik'
              : 'Physics Pro',
      },
      {
        name: 'Jason K.',
        solved: 85,
        rank: 3,
        badge:
          lang === 'zh'
            ? '高频帮手'
            : lang === 'ms'
              ? 'Pembantu Aktif'
              : 'Helper',
      },
    ],
    [lang]
  )

  const topics = useMemo(
    () => [
      { tag: 'MidtermPrep', count: '2.4k' },
      { tag: 'Calculus', count: '1.1k' },
      { tag: 'StudyTips', count: '856' },
      { tag: 'ScienceFair', count: '542' },
      { tag: 'HomeworkHelp', count: '300' },
    ],
    []
  )

  const boardGroups = useMemo(() => {
    const firstChunk = subjects.slice(0, Math.ceil(subjects.length / 2))
    const secondChunk = subjects.slice(Math.ceil(subjects.length / 2))

    return [
      {
        title: copy.boardGroupA,
        items: [
          { id: 'all', name: copy.boardAll },
          { id: 'following', name: copy.boardFollowing },
          { id: 'unanswered', name: copy.boardUnanswered },
        ],
      },
      {
        title: copy.boardGroupB,
        items: [...firstChunk, ...secondChunk].map((item) => ({
          id: item.id,
          name: item.name,
        })),
      },
    ]
  }, [
    copy.boardAll,
    copy.boardFollowing,
    copy.boardGroupA,
    copy.boardGroupB,
    copy.boardUnanswered,
    subjects,
  ])

  const buildFeedQuery = useCallback(() => {
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('limit', '20')
    params.set('sort', sortMode)

    const trimmedSearch = searchQuery.trim()
    if (trimmedSearch) {
      params.set('search', trimmedSearch)
    }

    if (scopeFilter === 'following') {
      params.set('scope', 'following')
    } else if (scopeFilter === 'by-date') {
      params.set('scope', 'by-date')
    }

    if (activeBoardId === 'unanswered') {
      params.set('tab', 'unanswered')
    } else if (
      activeBoardId !== 'all' &&
      activeBoardId !== 'following'
    ) {
      params.set('subjectId', activeBoardId)
    }

    return params.toString()
  }, [activeBoardId, scopeFilter, searchQuery, sortMode])

  const fetchPosts = useCallback(
    async (force = false) => {
      const requestKey = buildFeedQuery() || 'feed'
      if (!force && lastLoadedKeyRef.current === requestKey) {
        return
      }
      if (!force) {
        lastLoadedKeyRef.current = requestKey
      }

      setLoading(true)
      try {
        const response = await fetchWithTimeout(
          `/api/community/feed?${requestKey}`,
          {
            timeoutMs: 8000,
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to load community feed: ${response.status}`)
        }

        const result = await response.json()
        if (!result.success || !result.data?.posts) {
          throw new Error(result.error || 'Invalid community feed response')
        }

        setPosts(normalizePosts(result.data.posts as PostWithAuthor[]))
        if (force) {
          lastLoadedKeyRef.current = requestKey
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
        if (!force) {
          lastLoadedKeyRef.current = ''
        }
        toast({
          title:
            lang === 'zh'
              ? '加载失败'
              : lang === 'ms'
                ? 'Gagal dimuatkan'
                : 'Load failed',
          description: isAbortLikeError(error)
            ? lang === 'zh'
              ? '请求超时，请稍后重试。'
              : lang === 'ms'
                ? 'Permintaan tamat masa. Cuba lagi sebentar lagi.'
                : 'Request timed out. Please try again.'
            : copy.loadFailed,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    },
    [buildFeedQuery, copy.loadFailed, lang]
  )

  async function handleLike(postId: string) {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post
        const nextLiked = !post.userLiked
        return {
          ...post,
          userLiked: nextLiked,
          likeCount: nextLiked
            ? post.likeCount + 1
            : Math.max(0, post.likeCount - 1),
        }
      })
    )

    const result = await toggleLike(postId)
    if (!result.success) {
      toast({
        title:
          lang === 'zh'
            ? '操作失败'
            : lang === 'ms'
              ? 'Tindakan gagal'
              : 'Action failed',
        description:
          lang === 'zh'
            ? '点赞失败，请稍后重试。'
            : lang === 'ms'
              ? 'Gagal menyukai siaran.'
              : 'Failed to like the post.',
        variant: 'destructive',
      })
      await fetchPosts(true)
    }
  }

  async function handleBookmark(postId: string) {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post
        const nextBookmarked = !post.userBookmarked
        return {
          ...post,
          userBookmarked: nextBookmarked,
          bookmarkCount: nextBookmarked
            ? post.bookmarkCount + 1
            : Math.max(0, post.bookmarkCount - 1),
        }
      })
    )

    const result = await toggleBookmark(postId)
    if (!result.success) {
      toast({
        title:
          lang === 'zh'
            ? '操作失败'
            : lang === 'ms'
              ? 'Tindakan gagal'
              : 'Action failed',
        description:
          lang === 'zh'
            ? '收藏失败，请稍后重试。'
            : lang === 'ms'
              ? 'Gagal menyimpan siaran.'
              : 'Failed to bookmark the post.',
        variant: 'destructive',
      })
      await fetchPosts(true)
    }
  }

  async function handleShare(postId: string) {
    const shareUrl = `${window.location.origin}/dashboard/community/${postId}`

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
      } else {
        const fallback = document.createElement('textarea')
        fallback.value = shareUrl
        fallback.setAttribute('readonly', 'true')
        fallback.style.position = 'fixed'
        fallback.style.opacity = '0'
        document.body.appendChild(fallback)
        fallback.select()
        document.execCommand('copy')
        document.body.removeChild(fallback)
      }

      toast({
        title:
          lang === 'zh'
            ? '已复制分享链接'
            : lang === 'ms'
              ? 'Pautan perkongsian disalin'
              : 'Share link copied',
      })
    } catch (error) {
      console.error('Error copying share link:', error)
      toast({
        title:
          lang === 'zh'
            ? '复制失败'
            : lang === 'ms'
              ? 'Gagal menyalin'
              : 'Copy failed',
        description:
          lang === 'zh'
            ? '请稍后重试。'
            : lang === 'ms'
              ? 'Sila cuba lagi kemudian.'
              : 'Please try again.',
        variant: 'destructive',
      })
    }
  }

  const visiblePosts = useMemo(() => {
    const loweredQuery = searchQuery.trim().toLowerCase()

    const filtered = posts.filter((post) => {
      if (
        scopeFilter === 'following' &&
        !followedBoardIds.includes(post.subjectId || '')
      ) {
        return false
      }

      if (
        activeBoardId === 'following' &&
        !followedBoardIds.includes(post.subjectId || '')
      ) {
        return false
      }

      if (activeBoardId === 'unanswered' && post.isSolved) {
        return false
      }

      if (
        activeBoardId !== 'all' &&
        activeBoardId !== 'following' &&
        activeBoardId !== 'unanswered' &&
        post.subjectId !== activeBoardId
      ) {
        return false
      }

      if (!loweredQuery) return true

      const haystack = [
        post.title,
        post.content,
        post.author.username || '',
        post.author.handle || '',
        post.subject?.name || '',
        post.tags.join(' '),
        post.mentionedHandles.join(' '),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(loweredQuery)
    })

    return [...filtered].sort((a, b) => comparePosts(a, b, sortMode))
  }, [
    activeBoardId,
    followedBoardIds,
    posts,
    scopeFilter,
    searchQuery,
    sortMode,
  ])

  const groupedPosts = useMemo(() => {
    if (scopeFilter !== 'by-date') {
      return [{ label: '', items: visiblePosts }]
    }

    const groups = new Map<string, FeedPost[]>()
    visiblePosts.forEach((post) => {
      const label = isHydrated
        ? groupLabel(post.createdAt, lang)
        : formatStableDate(post.createdAt, lang)
      const bucket = groups.get(label) || []
      bucket.push(post)
      groups.set(label, bucket)
    })

    return Array.from(groups.entries()).map(([label, items]) => ({
      label,
      items,
    }))
  }, [isHydrated, lang, scopeFilter, visiblePosts])

  function renderCategory(post: FeedPost) {
    if (post.category === 'Question') {
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
            post.isSolved
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200'
              : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-100'
          }`}
        >
          {post.isSolved ? (
            <CircleCheck className="h-3.5 w-3.5" />
          ) : (
            <Bot className="h-3.5 w-3.5" />
          )}
          {post.isSolved ? copy.solvedTag : copy.questionTag}
        </span>
      )
    }

    if (post.category === 'Achievement') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
          <Crown className="h-3.5 w-3.5" />
          {copy.achievementTag}
        </span>
      )
    }

    if (post.category === 'Note') {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-borderTone dark:bg-surface-subtle dark:text-text-tertiary">
          {copy.noteTag}
        </span>
      )
    }

    if (post.category === 'Discussion') {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-borderTone dark:bg-surface-subtle dark:text-text-tertiary">
          {copy.discussionTag}
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] dark:border-borderTone dark:bg-surface-subtle dark:text-text-tertiary">
        {copy.noteTag}
      </span>
    )
  }

  return (
    <div className="animate-fade-in-up pb-12">
      <div className={`${pageSectionGapClass} ${pageShellFrameClass} sm:p-2.5`}>
        <PageHeroShell
          className={`${surfaceClassName} ${pageHeroShellClass}`}
          title={
            <PageHeroTitle title={t.community.title} capsuleLabel={copy.badge} />
          }
          subtitle={t.community.sub}
          titleClassName="font-semibold"
          subtitleClassName="mt-2 max-w-2xl text-sm leading-6 text-text-secondary dark:text-text-secondary"
          actions={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 sm:w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary dark:text-text-tertiary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className={`${pageInputClass} pl-10 pr-4`}
                />
              </div>
              <Link
                href="/dashboard/community/new"
                className={`${buttonVariants({
                  variant: 'primary',
                  size: 'default',
                })} h-11 rounded-full px-5 text-sm font-semibold shadow-none`}
              >
                <Plus className="mr-2 h-4 w-4" />
                {copy.publish}
              </Link>
            </div>
          }
        />

        <div
          className={`grid grid-cols-1 desktop:grid-cols-[minmax(0,3fr)_minmax(340px,1fr)] ${pageGridGapClass}`}
        >
          <div className={pageSectionGapCompactClass}>
            <Card className={`${surfaceClassName} rounded-[26px] px-4 py-3`}>
              <div className="flex flex-col gap-3 desktop:flex-row desktop:items-center desktop:justify-between">
                <div
                  className={`flex flex-wrap items-center gap-2 ${pageSegmentedControlClass}`}
                >
                  {[
                    { key: 'all' as ScopeFilter, label: copy.all },
                    { key: 'following' as ScopeFilter, label: copy.following },
                    { key: 'by-date' as ScopeFilter, label: copy.byDate },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setScopeFilter(item.key)}
                      className={`${pageSegmentedButtonClass} rounded-full text-[13px] ${
                        scopeFilter === item.key
                          ? pagePillActiveClass
                          : pagePillInactiveClass
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-text-tertiary dark:text-text-tertiary">
                    {copy.sort}
                  </span>
                  <div className="relative">
                    <select
                      value={sortMode}
                      onChange={(event) =>
                        setSortMode(event.target.value as SortMode)
                      }
                      className="h-10 rounded-full border border-borderTone bg-surface px-4 pr-9 text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/15 dark:border-borderTone dark:bg-surface-subtle dark:text-white dark:focus:ring-sky-400/30"
                    >
                      <option value="recent-replies">
                        {copy.recentReplies}
                      </option>
                      <option value="recent-posts">{copy.recentPosts}</option>
                      <option value="most-comments">{copy.mostComments}</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary dark:text-text-tertiary" />
                  </div>
                </div>
              </div>
            </Card>

            {loading ? (
              <Card
                className={`${surfaceClassName} rounded-[28px] px-5 py-10 text-center text-sm text-text-secondary dark:text-text-secondary`}
              >
                {copy.loading}
              </Card>
            ) : null}

            {!loading && visiblePosts.length === 0 ? (
              <Card className="rounded-[28px]">
                <PageEmptyState
                  icon={Bot}
                  title={
                    scopeFilter === 'following'
                      ? copy.noFollowingPosts
                      : copy.noPosts
                  }
                  className="px-5 py-12"
                  iconClassName="opacity-50"
                />
              </Card>
            ) : null}

            {!loading
              ? groupedPosts.map((group) => (
                  <div key={group.label || 'all'} className="space-y-3">
                    {group.label ? (
                      <div className="px-1 text-[12px] font-medium text-text-tertiary dark:text-text-tertiary">
                        {group.label}
                      </div>
                    ) : null}

                    {group.items.map((post) => (
                      <Card
                        key={post.id}
                        className={`${surfaceClassName} dark:hover:border-sky-400/24 rounded-[28px] px-5 py-4 transition-colors hover:border-blue-300/70`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <img
                              src={
                                post.author.avatar ||
                                `https://i.pravatar.cc/150?u=${post.authorId}`
                              }
                              alt={post.author.username || 'User'}
                              className="h-11 w-11 rounded-2xl border border-borderTone object-cover dark:border-borderTone"
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                {post.author.handle ? (
                                  <Link
                                    href={`/u/${post.author.handle}`}
                                    className={`truncate hover:text-sky-600 dark:hover:text-sky-200 ${pageCardTitleClass}`}
                                  >
                                    {post.author.username || `@${post.author.handle}`}
                                  </Link>
                                ) : (
                                  <span
                                    className={`truncate ${pageCardTitleClass}`}
                                  >
                                    {post.author.username || 'Anonymous'}
                                  </span>
                                )}
                                {renderCategory(post)}
                                {post.isPrivate ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-text-secondary dark:border-white/10 dark:bg-white/[0.05] dark:text-text-secondary">
                                    {copy.privateTag}
                                  </span>
                                ) : null}
                              </div>
                              <div
                                className={`mt-1 flex flex-wrap items-center gap-2 text-text-tertiary dark:text-text-tertiary ${pageMetaTextClass}`}
                              >
                                <span>
                                  {copy.boardLabel}：
                                  {post.subject?.name || copy.boardAll}
                                </span>
                                <span>•</span>
                                <span suppressHydrationWarning>
                                  {isHydrated
                                    ? formatRelativeTime(post.createdAt, lang)
                                    : formatStableDate(post.createdAt, lang)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`shrink-0 text-text-tertiary dark:text-text-tertiary ${pageMetaTextClass}`}
                          >
                            <span suppressHydrationWarning>
                              {isHydrated
                                ? formatRelativeTime(post.createdAt, lang)
                                : formatStableDate(post.createdAt, lang)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Link
                            href={`/dashboard/community/${post.id}`}
                            className="block text-[21px] font-semibold leading-8 text-text-primary hover:text-sky-600 dark:text-text-primary dark:hover:text-sky-200"
                          >
                            {post.title}
                          </Link>
                          <div className="prose prose-sm mt-2 max-w-none text-[14px] leading-7 text-text-secondary dark:prose-invert prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-code:text-sky-600 prose-li:text-text-secondary dark:text-text-secondary dark:prose-headings:text-text-primary dark:prose-p:text-text-secondary dark:prose-strong:text-text-primary dark:prose-code:text-sky-200 dark:prose-li:text-text-secondary">
                            <ReactMarkdown
                              remarkPlugins={[remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                            >
                              {post.content}
                            </ReactMarkdown>
                          </div>
                        </div>

                        {post.mentionedHandles.length > 0 ? (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {post.mentionedHandles.map((handle) => (
                              <Link
                                key={handle}
                                href={`/u/${handle}`}
                                className="text-[12px] text-text-tertiary hover:text-sky-600 dark:text-text-tertiary dark:hover:text-sky-200"
                              >
                                @{handle}
                              </Link>
                            ))}
                          </div>
                        ) : null}

                        {post.attachments.length > 0 ? (
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-[12px] font-medium text-text-secondary dark:text-text-secondary">
                              <Paperclip className="h-3.5 w-3.5" />
                              {copy.attachmentsTitle}（{post.attachments.length}）
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {post.attachments.slice(0, 2).map((attachment) => (
                                <a
                                  key={attachment}
                                  href={attachment}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="overflow-hidden rounded-2xl border border-borderTone bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle"
                                >
                                  <img
                                    src={attachment}
                                    alt={post.title}
                                    className="h-28 w-full object-cover"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
                            {post.subject?.name || copy.boardAll}
                          </span>
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-borderTone bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-borderTone pt-3 text-[13px] text-text-secondary dark:border-borderTone dark:text-text-secondary">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`inline-flex items-center gap-2 transition-colors ${
                              post.userLiked
                                ? 'text-rose-300'
                                : 'hover:text-text-primary dark:hover:text-white'
                            }`}
                          >
                            <Heart
                              className={`h-4 w-4 ${post.userLiked ? 'fill-current' : ''}`}
                            />
                            {post.likeCount}
                          </button>

                          <Link
                            href={`/dashboard/community/${post.id}`}
                            className="inline-flex items-center gap-2 hover:text-text-primary dark:hover:text-white"
                          >
                            <MessageSquare className="h-4 w-4" />
                            {post._count.comments}
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleBookmark(post.id)}
                            aria-label={copy.bookmarks}
                            className={`inline-flex items-center gap-2 transition-colors ${
                              post.userBookmarked
                                ? 'text-amber-300'
                                : 'hover:text-text-primary dark:hover:text-white'
                            }`}
                          >
                            <Bookmark
                              className={`h-4 w-4 ${
                                post.userBookmarked ? 'fill-current' : ''
                              }`}
                            />
                            {post.bookmarkCount}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShare(post.id)}
                            aria-label={copy.share}
                            className="inline-flex items-center gap-2 hover:text-text-primary dark:hover:text-white"
                          >
                            <Share2 className="h-4 w-4" />
                            {copy.share}
                          </button>

                          <button className="ml-auto inline-flex items-center gap-2 text-[12px] text-text-tertiary hover:text-text-primary dark:text-text-tertiary dark:hover:text-white">
                            <Sparkles className="h-3.5 w-3.5" />
                            {copy.aiHint}
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ))
              : null}
          </div>

          <div className={pageSectionGapCompactClass}>
            <Card className={`${surfaceClassName} p-5`}>
              <div className="flex items-start justify-between gap-3">
                <SectionBlockHeader
                  title={
                    <span
                      className={`flex items-center gap-2 ${pageCardTitleClass}`}
                    >
                      <Mic className="h-4 w-4 text-emerald-300" />
                      {copy.roomsTitle}
                    </span>
                  }
                  description={copy.roomsSub}
                  className="flex-1"
                />
                <span className="dark:bg-emerald-400/12 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 dark:border-emerald-400/30 dark:text-emerald-200">
                  {copy.liveNow}
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {rooms.map((room) => (
                  <div
                    key={room.name}
                    className={`${insetCardClassName} flex items-center justify-between gap-3 px-3.5 py-3`}
                  >
                    <div className="min-w-0">
                      <div className={`truncate ${pageCardTitleClass}`}>
                        {room.name}
                      </div>
                      <div
                        className={`mt-1 flex items-center gap-2 text-text-secondary dark:text-text-secondary ${pageMetaTextClass}`}
                      >
                        <div className="flex -space-x-2">
                          {room.avatars.map((avatar, index) => (
                            <img
                              key={`${room.name}-${index}`}
                              src={`https://i.pravatar.cc/150?img=${avatar + 10}`}
                              alt="User"
                              className="h-5 w-5 rounded-full border border-borderTone object-cover dark:border-borderTone"
                            />
                          ))}
                        </div>
                        <span>
                          {room.users} {copy.online}
                        </span>
                        <span className="text-blue-200/32">•</span>
                        <span>{room.topic}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 rounded-full px-4 text-[12px]"
                    >
                      {t.community.join}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={`${surfaceClassName} p-5`}>
              <SectionBlockHeader
                title={
                  <span
                    className={`flex items-center gap-2 ${pageCardTitleClass}`}
                  >
                    <Hash className="h-4 w-4 text-sky-300" />
                    {copy.boardsTitle}
                  </span>
                }
                description={copy.boardsSub}
              />

              <div className="mt-4 space-y-4">
                {boardGroups.map((group) => (
                  <div key={group.title}>
                    <div className="mb-2 text-[12px] font-medium text-text-tertiary dark:text-text-tertiary">
                      {group.title}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {group.items.map((item) => {
                        const isActive =
                          (item.id === 'all' && activeBoardId === 'all') ||
                          (item.id === 'following' &&
                            activeBoardId === 'following') ||
                          (item.id === 'unanswered' &&
                            activeBoardId === 'unanswered') ||
                          activeBoardId === item.id

                        return (
                          <button
                            key={item.id}
                            onClick={() =>
                              setActiveBoardId(item.id as string | 'all')
                            }
                            className={`min-h-11 rounded-2xl border px-3 py-2 text-left text-[12px] font-medium transition-colors ${
                              isActive
                                ? 'dark:bg-sky-400/12 border-blue-200 bg-surface-selected text-sky-700 dark:border-sky-400/30 dark:text-sky-100'
                                : 'border-borderTone bg-surface text-text-secondary hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary dark:hover:bg-surface-selected dark:hover:text-white'
                            }`}
                          >
                            {item.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={`${surfaceClassName} p-5`}>
              <SectionBlockHeader
                title={
                  <span
                    className={`flex items-center gap-2 ${pageCardTitleClass}`}
                  >
                    <Crown className="h-4 w-4 text-amber-300" />
                    {copy.contributorsTitle}
                  </span>
                }
                description={copy.contributorsSub}
              />

              <div className="mt-4 space-y-3">
                {contributors.map((user, index) => (
                  <div
                    key={user.name}
                    className={`${insetCardClassName} flex items-center gap-3 px-3.5 py-3`}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-semibold ${
                        index === 0
                          ? 'bg-amber-300/18 text-amber-100'
                          : index === 1
                            ? 'dark:bg-slate-300/16 bg-slate-200 text-slate-700 dark:text-slate-100'
                            : 'bg-orange-300/16 text-orange-100'
                      }`}
                    >
                      {user.rank}
                    </div>
                    <img
                      src={`https://i.pravatar.cc/150?img=${index + 20}`}
                      alt={user.name}
                      className="h-9 w-9 rounded-2xl border border-borderTone object-cover dark:border-borderTone"
                    />
                    <div className="min-w-0 flex-1">
                      <div className={`truncate ${pageCardTitleClass}`}>
                        {user.name}
                      </div>
                      <div
                        className={`mt-1 truncate text-text-secondary dark:text-text-secondary ${pageMetaTextClass}`}
                      >
                        {user.solved} • {user.badge}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/dashboard/leaderboard"
                className={`${buttonVariants({
                  variant: 'outline',
                  size: 'default',
                })} mt-4 h-9 w-full rounded-full text-sm`}
              >
                {copy.viewLeaderboard}
              </Link>
            </Card>

            <Card className={`${surfaceClassName} p-5`}>
              <SectionBlockHeader
                title={
                  <span
                    className={`flex items-center gap-2 ${pageCardTitleClass}`}
                  >
                    <Flame className="h-4 w-4 text-orange-300" />
                    {copy.hotTopicsTitle}
                  </span>
                }
                description={copy.hotTopicsSub}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic.tag}
                    onClick={() => setSearchQuery(topic.tag)}
                    className="rounded-full border border-borderTone bg-surface px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary dark:hover:bg-surface-selected dark:hover:text-white"
                  >
                    #{topic.tag}
                    <span className="ml-1 text-text-tertiary dark:text-text-tertiary">
                      {topic.count}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
