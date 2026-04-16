'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import PaginationAnt from '@/components/ui/pagination-ant'
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
  Loader2,
  Plus,
  Search,
  Share2,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { useApp } from '@/providers'
import {
  getCategories,
  PostWithAuthor,
  toggleBookmark,
  toggleLike,
} from '@/actions/community/post'
import { generateCommunityHint } from '@/actions/community/insights'
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
  initialPage?: number
  initialMetadata?: FeedMetadata
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
interface FeedMetadata {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

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

function buildCommunityFeedQuery(params: {
  page: number
  limit: number
  searchQuery: string
  sortMode: SortMode
  scopeFilter: ScopeFilter
  activeBoardId: string | 'all'
}) {
  const query = new URLSearchParams()
  query.set('page', String(params.page))
  query.set('limit', String(params.limit))
  query.set('sort', params.sortMode)

  const trimmedSearch = params.searchQuery.trim()
  if (trimmedSearch) {
    query.set('search', trimmedSearch)
  }

  if (params.scopeFilter === 'following') {
    query.set('scope', 'following')
  } else if (params.scopeFilter === 'by-date') {
    query.set('scope', 'by-date')
  }

  if (params.activeBoardId === 'unanswered') {
    query.set('tab', 'unanswered')
  } else if (
    params.activeBoardId !== 'all' &&
    params.activeBoardId !== 'following'
  ) {
    query.set('subjectId', params.activeBoardId)
  }

  return query.toString()
}

export function CommunityView({
  initialPosts = [],
  subjects = [],
  initialSearchQuery = '',
  initialSortMode = 'recent-posts',
  initialScopeFilter = 'all',
  initialBoardId = 'all',
  initialPage = 1,
  initialMetadata = {
    total: initialPosts.length,
    page: initialPage,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
}: CommunityViewProps) {
  const { t, lang } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<FeedPost[]>(() =>
    normalizePosts(initialPosts)
  )
  const [isHydrated, setIsHydrated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>(initialScopeFilter)
  const [sortMode, setSortMode] = useState<SortMode>(initialSortMode)
  const [activeBoardId, setActiveBoardId] = useState<string | 'all'>(
    initialBoardId
  )
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageMetadata, setPageMetadata] = useState<FeedMetadata>(initialMetadata)
  const [aiHintLoadingPostId, setAiHintLoadingPostId] = useState<string | null>(
    null
  )
  const [aiHints, setAiHints] = useState<Record<string, string>>({})
  const didMountRef = useRef(false)
  const lastLoadedKeyRef = useRef<string>(
    buildCommunityFeedQuery({
      page: initialPage,
      limit: initialMetadata.limit,
      searchQuery: initialSearchQuery,
      sortMode: initialSortMode,
      scopeFilter: initialScopeFilter,
      activeBoardId: initialBoardId,
    })
  )

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
        retryLoad: '重试',
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
        prevPage: '上一页',
        nextPage: '下一页',
        boardLabel: '板块',
        noteTag: '笔记',
        discussionTag: '讨论',
        questionTag: '提问',
        solvedTag: '已解决',
        achievementTag: '成就',
        privateTag: '仅自己可见',
        attachmentsTitle: '附件',
        aiHint: 'AI 助手',
        aiHintTitle: 'AI 提示',
        aiHintLoading: '生成提示中...',
        aiHintFailed: 'AI 提示生成失败',
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
        retryLoad: 'Cuba lagi',
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
        prevPage: 'Halaman sebelumnya',
        nextPage: 'Halaman seterusnya',
        boardLabel: 'Papan',
        noteTag: 'Nota',
        discussionTag: 'Perbincangan',
        questionTag: 'Soalan',
        solvedTag: 'Selesai',
        achievementTag: 'Pencapaian',
        privateTag: 'Hanya saya boleh lihat',
        attachmentsTitle: 'Lampiran',
        aiHint: 'AI',
        aiHintTitle: 'Cadangan AI',
        aiHintLoading: 'Menjana cadangan...',
        aiHintFailed: 'Gagal menjana cadangan AI',
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
      retryLoad: 'Retry',
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
      prevPage: 'Previous',
      nextPage: 'Next',
      boardLabel: 'Board',
      noteTag: 'Note',
      discussionTag: 'Discussion',
      questionTag: 'Question',
      solvedTag: 'Solved',
      achievementTag: 'Achievement',
      privateTag: 'Only visible to me',
      attachmentsTitle: 'Attachments',
      aiHint: 'AI',
      aiHintTitle: 'AI hint',
      aiHintLoading: 'Generating hint...',
      aiHintFailed: 'Failed to generate AI hint',
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

  const currentFeedQuery = useMemo(
    () =>
      buildCommunityFeedQuery({
        page: currentPage,
        limit: pageMetadata.limit,
        searchQuery,
        sortMode,
        scopeFilter,
        activeBoardId,
      }),
    [
      activeBoardId,
      currentPage,
      pageMetadata.limit,
      scopeFilter,
      searchQuery,
      sortMode,
    ]
  )

  const fetchPosts = useCallback(
    async (force = false) => {
      const requestKey = currentFeedQuery || 'feed'
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
        setPageMetadata(result.data.metadata as FeedMetadata)
        setLoadError(null)
        if (force) {
          lastLoadedKeyRef.current = requestKey
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
        if (!force) {
          lastLoadedKeyRef.current = ''
        }
        setLoadError(error instanceof Error ? error.message : 'load-failed')
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
    [currentFeedQuery, copy.loadFailed, lang]
  )

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    const nextUrl = `${pathname}?${currentFeedQuery}`
    if (searchParams.toString() !== currentFeedQuery) {
      router.replace(nextUrl, { scroll: false })
    }

    void fetchPosts()
  }, [currentFeedQuery, fetchPosts, pathname, router, searchParams])

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

  async function handleAiHint(post: FeedPost) {
    if (aiHintLoadingPostId === post.id || aiHints[post.id]) {
      return
    }

    setAiHintLoadingPostId(post.id)
    try {
      const result = await generateCommunityHint({
        title: post.title,
        content: post.content,
        category: post.category,
        subjectName: post.subject?.name || null,
        tags: post.tags,
      })

      if (!result.success || !result.hint) {
        toast({
          title:
            lang === 'zh'
              ? 'AI 提示生成失败'
              : lang === 'ms'
                ? 'Gagal menjana cadangan AI'
                : 'Failed to generate AI hint',
          description: result.error || copy.aiHintFailed,
          variant: 'destructive',
        })
        return
      }

      setAiHints((prev) => ({
        ...prev,
        [post.id]: result.hint,
      }))
    } catch (error) {
      console.error('Error generating community AI hint:', error)
      toast({
        title:
          lang === 'zh'
            ? 'AI 提示生成失败'
            : lang === 'ms'
              ? 'Gagal menjana cadangan AI'
              : 'Failed to generate AI hint',
        description: copy.aiHintFailed,
        variant: 'destructive',
      })
    } finally {
      setAiHintLoadingPostId(null)
    }
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  function handleScopeChange(nextScope: ScopeFilter) {
    setScopeFilter(nextScope)
    setCurrentPage(1)
  }

  function handleSortChange(nextSort: SortMode) {
    setSortMode(nextSort)
    setCurrentPage(1)
  }

  function handleBoardChange(nextBoardId: string | 'all') {
    setActiveBoardId(nextBoardId)
    setCurrentPage(1)
  }

  function handlePageChange(nextPage: number) {
    const boundedPage = Math.min(
      Math.max(1, nextPage),
      Math.max(1, pageMetadata.totalPages)
    )
    setCurrentPage(boundedPage)
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

  const contributors = useMemo(() => {
    const contributorMap = new Map<
      string,
      {
        name: string
        avatar: string | null
        solved: number
        rankScore: number
        postCount: number
        commentCount: number
      }
    >()

    posts.forEach((post) => {
      const key = post.author.id
      const current = contributorMap.get(key) || {
        name: post.author.username || post.author.handle || 'Anonymous',
        avatar: post.author.avatar,
        solved: 0,
        rankScore: 0,
        postCount: 0,
        commentCount: 0,
      }

      current.name = post.author.username || post.author.handle || 'Anonymous'
      current.avatar = post.author.avatar
      current.postCount += 1
      current.commentCount += post._count.comments
      current.rankScore += post.likeCount + post._count.comments * 2

      if (post.category === 'Question' && post.isSolved) {
        current.solved += 1
      }

      contributorMap.set(key, current)
    })

    return Array.from(contributorMap.values())
      .sort((a, b) => {
        if (b.rankScore !== a.rankScore) {
          return b.rankScore - a.rankScore
        }
        if (b.postCount !== a.postCount) {
          return b.postCount - a.postCount
        }
        return b.commentCount - a.commentCount
      })
      .slice(0, 3)
      .map((item, index) => ({
        rank: index + 1,
        name: item.name,
        avatar: item.avatar,
        solved: item.postCount + item.commentCount,
        badge:
          index === 0
            ? lang === 'zh'
              ? '活跃发起人'
              : lang === 'ms'
                ? 'Penyumbang utama'
                : 'Top contributor'
            : index === 1
              ? lang === 'zh'
                ? '高互动作者'
                : lang === 'ms'
                  ? 'Penulis aktif'
                  : 'Active author'
              : lang === 'zh'
                ? '答疑参与者'
                : lang === 'ms'
                  ? 'Pembantu aktif'
                  : 'Helpful responder',
      }))
  }, [lang, posts])

  const topics = useMemo(() => {
    const topicMap = new Map<string, number>()

    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        topicMap.set(tag, (topicMap.get(tag) || 0) + 1)
      })
    })

    return Array.from(topicMap.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1]
        }
        return a[0].localeCompare(b[0])
      })
      .slice(0, 5)
      .map(([tag, count]) => ({
        tag,
        count: count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`,
      }))
  }, [posts])

  const paginationSummary = useMemo(() => {
    const totalPages = Math.max(1, pageMetadata.totalPages)
    const total = Math.max(0, pageMetadata.total)
    const page = Math.min(Math.max(1, pageMetadata.page), totalPages)
    const start = total === 0 ? 0 : (page - 1) * pageMetadata.limit + 1
    const end = total === 0 ? 0 : Math.min(page * pageMetadata.limit, total)

    if (lang === 'zh') {
      return `第 ${page} 页 / 共 ${totalPages} 页 · ${start}-${end} 条 / 共 ${total} 条`
    }

    if (lang === 'ms') {
      return `Halaman ${page} / ${totalPages} · ${start}-${end} daripada ${total}`
    }

    return `Page ${page} / ${totalPages} · ${start}-${end} of ${total}`
  }, [lang, pageMetadata.limit, pageMetadata.page, pageMetadata.total, pageMetadata.totalPages])

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
                  onChange={(event) => handleSearchChange(event.target.value)}
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
                      onClick={() => handleScopeChange(item.key)}
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
                        handleSortChange(event.target.value as SortMode)
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

            {!loading && loadError ? (
              <Card
                className={`${surfaceClassName} rounded-[28px] px-5 py-10`}
              >
                <div className="mx-auto flex max-w-lg flex-col items-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
                    <TriangleAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary dark:text-text-primary">
                      {lang === 'zh'
                        ? '社区动态加载失败'
                        : lang === 'ms'
                          ? 'Gagal memuatkan komuniti'
                          : 'Failed to load community feed'}
                    </div>
                    <p className="mt-1 text-[13px] leading-6 text-text-secondary dark:text-text-secondary">
                      {copy.loadFailed}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-full px-4 text-sm"
                    onClick={() => void fetchPosts(true)}
                  >
                    {copy.retryLoad}
                  </Button>
                </div>
              </Card>
            ) : null}

            {!loading && !loadError && visiblePosts.length === 0 ? (
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
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                              {post.attachments.slice(0, 3).map(
                                (attachment, index) => (
                                  <Link
                                  key={attachment}
                                    href={`/dashboard/community/${post.id}`}
                                    aria-label={`${post.title} ${index + 1}`}
                                    className="group relative overflow-hidden rounded-2xl border border-borderTone bg-surface-subtle transition-colors hover:border-sky-300/60 dark:border-borderTone dark:bg-surface-subtle dark:hover:border-sky-400/40"
                                  >
                                    <img
                                      src={attachment}
                                      alt={post.title}
                                      className="h-28 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                                    />
                                    {index === 0 && post.attachments.length > 1 ? (
                                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-1.5 text-[11px] font-medium text-white">
                                        {lang === 'zh'
                                          ? '点击查看帖子'
                                          : lang === 'ms'
                                            ? 'Klik untuk buka siaran'
                                            : 'Open post'}
                                      </div>
                                    ) : null}
                                  </Link>
                                )
                              )}
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

                          <button
                            type="button"
                            onClick={() => handleAiHint(post)}
                            disabled={aiHintLoadingPostId === post.id}
                            className="ml-auto inline-flex items-center gap-2 text-[12px] text-text-tertiary transition-colors hover:text-text-primary disabled:cursor-wait disabled:opacity-60 dark:text-text-tertiary dark:hover:text-white"
                          >
                            {aiHintLoadingPostId === post.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5" />
                            )}
                            {aiHintLoadingPostId === post.id
                              ? copy.aiHintLoading
                              : copy.aiHint}
                          </button>
                        </div>

                        {aiHints[post.id] ? (
                          <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3 dark:border-sky-400/20 dark:bg-sky-400/10">
                            <div className="flex items-center gap-2 text-[12px] font-medium text-sky-700 dark:text-sky-100">
                              <Sparkles className="h-3.5 w-3.5" />
                              {copy.aiHintTitle}
                            </div>
                            <div className="mt-2 whitespace-pre-line text-[13px] leading-6 text-text-secondary dark:text-text-secondary">
                              {aiHints[post.id]}
                            </div>
                          </div>
                        ) : null}
                      </Card>
                    ))}
                  </div>
                ))
              : null}

            {!loading && !loadError && pageMetadata.totalPages > 1 ? (
              <Card className={`${surfaceClassName} rounded-[28px] px-5 py-4`}>
                <div className="flex flex-col gap-3 desktop:flex-row desktop:items-center desktop:justify-between">
                  <div className="text-[12px] text-text-tertiary dark:text-text-tertiary">
                    {paginationSummary}
                  </div>
                  <PaginationAnt
                    current={currentPage}
                    total={Math.max(1, pageMetadata.total)}
                    pageSize={pageMetadata.limit}
                    showSizeChanger={false}
                    showLessItems
                    onChange={(nextPage) => handlePageChange(nextPage)}
                  />
                </div>
              </Card>
            ) : null}
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
                              handleBoardChange(item.id as string | 'all')
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
                    onClick={() => handleSearchChange(topic.tag)}
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
