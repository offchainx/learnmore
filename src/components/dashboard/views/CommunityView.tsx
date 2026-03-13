'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
  Plus,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react'
import { useApp } from '@/providers'
import {
  getCategories,
  PostWithAuthor,
  toggleLike,
} from '@/actions/community/post'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'
import { toast } from '@/components/ui/use-toast'
import {
  fetchWithTimeout,
  isAbortLikeError,
} from '@/lib/http/fetch-with-timeout'

type SubjectOption = Awaited<ReturnType<typeof getCategories>>[number]

interface CommunityViewProps {
  initialPosts?: PostWithAuthor[]
  subjects: SubjectOption[]
}

type FeedPost = PostWithAuthor & {
  likeCount: number
  userLiked: boolean
  _count: {
    comments: number
    likes?: number
  }
  shareCount: number
  bookmarkCount: number
}

type ScopeFilter = 'all' | 'following' | 'by-date'
type SortMode = 'recent-replies' | 'recent-posts' | 'most-comments'

const surfaceClassName =
  'rounded-[28px] border border-[#24324D] bg-[linear-gradient(180deg,rgba(10,18,32,0.95),rgba(5,11,20,0.98))] text-white shadow-[0_18px_48px_rgba(2,8,23,0.28)]'

const insetCardClassName =
  'rounded-[22px] border border-white/8 bg-white/[0.03] text-white'

function normalizePosts(posts: PostWithAuthor[]): FeedPost[] {
  return posts.map((post) => {
    const rawPost = post as PostWithAuthor & {
      likeCount?: number
      userLiked?: boolean
      _count?: {
        comments: number
        likes?: number
      }
    }

    const likeCount =
      typeof rawPost.likeCount === 'number'
        ? rawPost.likeCount
        : (rawPost._count?.likes ?? 0)
    const commentCount = post._count.comments

    return {
      ...post,
      likeCount,
      userLiked: Boolean(rawPost.userLiked),
      _count: {
        comments: commentCount,
        likes: rawPost._count?.likes ?? 0,
      },
      shareCount: Math.max(0, Math.round((likeCount + commentCount) / 2)),
      bookmarkCount: Math.max(0, Math.round(likeCount * 0.6)),
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
  subjects,
}: CommunityViewProps) {
  const { t, lang } = useApp()
  const [posts, setPosts] = useState<FeedPost[]>(() =>
    normalizePosts(initialPosts)
  )
  const [loading, setLoading] = useState(initialPosts.length === 0)
  const [searchQuery, setSearchQuery] = useState('')
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all')
  const [sortMode, setSortMode] = useState<SortMode>('recent-posts')
  const [activeBoardId, setActiveBoardId] = useState<string | 'all'>('all')
  const lastLoadedKeyRef = useRef<string>(initialPosts.length > 0 ? 'feed' : '')

  const followedBoardIds = useMemo(
    () =>
      subjects.slice(0, Math.min(3, subjects.length)).map((item) => item.id),
    [subjects]
  )

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
        original: '独家原创',
        questionTag: '提问',
        solvedTag: '已解决',
        achievementTag: '成就',
        aiHint: 'AI 助手',
        shareCountNote: '收藏和分享暂按当前帖子互动热度展示。',
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
        original: 'Asal',
        questionTag: 'Soalan',
        solvedTag: 'Selesai',
        achievementTag: 'Pencapaian',
        aiHint: 'AI',
        shareCountNote:
          'Jumlah simpan dan kongsi kini dipaparkan sebagai ringkasan interaksi.',
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
      original: 'Original',
      questionTag: 'Question',
      solvedTag: 'Solved',
      achievementTag: 'Achievement',
      aiHint: 'AI',
      shareCountNote:
        'Bookmark and share counts are currently shown as interaction placeholders.',
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

  const fetchPosts = useCallback(
    async (force = false) => {
      const requestKey = 'feed'
      if (!force && lastLoadedKeyRef.current === requestKey) {
        return
      }
      if (!force) {
        lastLoadedKeyRef.current = requestKey
      }

      setLoading(true)
      try {
        const response = await fetchWithTimeout(
          '/api/community/feed?page=1&limit=20',
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
    [copy.loadFailed, lang]
  )

  useEffect(() => {
    void fetchPosts()
  }, [fetchPosts])

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
        post.subject?.name || '',
        post.tags.join(' '),
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
      const label = groupLabel(post.createdAt, lang)
      const bucket = groups.get(label) || []
      bucket.push(post)
      groups.set(label, bucket)
    })

    return Array.from(groups.entries()).map(([label, items]) => ({
      label,
      items,
    }))
  }, [lang, scopeFilter, visiblePosts])

  function renderCategory(post: FeedPost) {
    if (post.category === 'Question') {
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
            post.isSolved
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
              : 'border-sky-400/30 bg-sky-400/10 text-sky-100'
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
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-100">
          <Crown className="h-3.5 w-3.5" />
          {copy.achievementTag}
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-blue-100/60">
        {copy.original}
      </span>
    )
  }

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <Card
        className={`${surfaceClassName} overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_top,_rgba(41,98,190,0.12),_transparent_50%),linear-gradient(180deg,rgba(10,18,32,0.95),rgba(5,11,20,0.98))] p-6`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-blue-100/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {copy.badge}
            </div>
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-white">
                {t.community.title}
              </h1>
              <p className="text-blue-100/68 mt-2 max-w-2xl text-sm leading-6">
                {t.community.sub}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="placeholder:text-blue-100/38 h-11 w-full rounded-full border border-white/10 bg-white/[0.05] pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400/35"
              />
            </div>
            <Button
              asChild
              variant="glow"
              className="h-11 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 shadow-none hover:bg-slate-100"
            >
              <Link href="/dashboard/community/new">
                <Plus className="mr-2 h-4 w-4" />
                {copy.publish}
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(340px,1fr)]">
        <div className="space-y-4">
          <Card className={`${surfaceClassName} rounded-[26px] px-4 py-3`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: 'all' as ScopeFilter, label: copy.all },
                  { key: 'following' as ScopeFilter, label: copy.following },
                  { key: 'by-date' as ScopeFilter, label: copy.byDate },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setScopeFilter(item.key)}
                    className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                      scopeFilter === item.key
                        ? 'bg-white text-slate-950 shadow-[0_8px_20px_rgba(255,255,255,0.12)]'
                        : 'border-white/8 text-blue-100/58 border bg-white/[0.03] hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-blue-100/48 text-[12px]">
                  {copy.sort}
                </span>
                <div className="relative">
                  <select
                    value={sortMode}
                    onChange={(event) =>
                      setSortMode(event.target.value as SortMode)
                    }
                    className="h-10 rounded-full border border-white/10 bg-white/[0.03] px-4 pr-9 text-[13px] text-white focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                  >
                    <option value="recent-replies">{copy.recentReplies}</option>
                    <option value="recent-posts">{copy.recentPosts}</option>
                    <option value="most-comments">{copy.mostComments}</option>
                  </select>
                  <ChevronDown className="text-blue-100/46 pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                </div>
              </div>
            </div>
          </Card>

          <div className="text-blue-100/38 text-[11px]">
            {copy.shareCountNote}
          </div>

          {loading ? (
            <Card
              className={`${surfaceClassName} text-blue-100/56 rounded-[28px] px-5 py-10 text-center text-sm`}
            >
              {copy.loading}
            </Card>
          ) : null}

          {!loading && visiblePosts.length === 0 ? (
            <Card className="text-blue-100/56 rounded-[28px] border border-dashed border-[#24324D] bg-[linear-gradient(180deg,rgba(10,18,32,0.92),rgba(5,11,20,0.96))] px-5 py-12 text-center shadow-[0_18px_48px_rgba(2,8,23,0.22)]">
              <Bot className="mx-auto mb-4 h-10 w-10 opacity-40" />
              <div className="text-sm">
                {scopeFilter === 'following'
                  ? copy.noFollowingPosts
                  : copy.noPosts}
              </div>
            </Card>
          ) : null}

          {!loading
            ? groupedPosts.map((group) => (
                <div key={group.label || 'all'} className="space-y-3">
                  {group.label ? (
                    <div className="text-blue-100/52 px-1 text-[12px] font-medium">
                      {group.label}
                    </div>
                  ) : null}

                  {group.items.map((post) => (
                    <Card
                      key={post.id}
                      className={`${surfaceClassName} hover:border-sky-400/24 rounded-[28px] px-5 py-4 transition-colors`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={
                              post.author.avatar ||
                              `https://i.pravatar.cc/150?u=${post.authorId}`
                            }
                            alt={post.author.username || 'User'}
                            className="h-11 w-11 rounded-2xl border border-white/10 object-cover"
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="truncate text-[15px] font-semibold text-white">
                                {post.author.username || 'Anonymous'}
                              </span>
                              {renderCategory(post)}
                            </div>
                            <div className="text-blue-100/46 mt-1 flex flex-wrap items-center gap-2 text-[12px]">
                              <span>
                                {copy.boardLabel}：
                                {post.subject?.name || copy.boardAll}
                              </span>
                              <span>•</span>
                              <span>
                                {formatRelativeTime(post.createdAt, lang)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-blue-100/42 shrink-0 text-[12px]">
                          {formatRelativeTime(post.createdAt, lang)}
                        </div>
                      </div>

                      <div className="mt-4">
                        <Link
                          href={`/dashboard/community/${post.id}`}
                          className="block text-[22px] font-semibold leading-8 text-white hover:text-sky-200"
                        >
                          {post.title}
                        </Link>
                        <div className="text-blue-100/72 prose-p:text-blue-100/72 prose-li:text-blue-100/72 prose prose-sm mt-2 max-w-none text-[14px] leading-7 dark:prose-invert prose-headings:text-white prose-strong:text-white prose-code:text-sky-200">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {post.content}
                          </ReactMarkdown>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-[11px] font-medium text-sky-100">
                          {post.subject?.name || copy.boardAll}
                        </span>
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="border-white/8 text-blue-100/58 rounded-full border bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="border-white/8 text-blue-100/52 mt-4 flex flex-wrap items-center gap-5 border-t pt-3 text-[13px]">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`inline-flex items-center gap-2 transition-colors ${
                            post.userLiked
                              ? 'text-rose-300'
                              : 'hover:text-white'
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 ${post.userLiked ? 'fill-current' : ''}`}
                          />
                          {post.likeCount}
                        </button>

                        <Link
                          href={`/dashboard/community/${post.id}`}
                          className="inline-flex items-center gap-2 hover:text-white"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {post._count.comments}
                        </Link>

                        <button className="inline-flex items-center gap-2 hover:text-white">
                          <Bookmark className="h-4 w-4" />
                          {post.bookmarkCount}
                        </button>

                        <button className="inline-flex items-center gap-2 hover:text-white">
                          <Share2 className="h-4 w-4" />
                          {post.shareCount}
                        </button>

                        <button className="text-blue-100/42 ml-auto inline-flex items-center gap-2 text-[12px] hover:text-white">
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

        <div className="space-y-4">
          <Card className={`${surfaceClassName} p-5`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[15px] font-semibold text-white">
                  <Mic className="h-4 w-4 text-emerald-300" />
                  {copy.roomsTitle}
                </div>
                <div className="text-blue-100/56 mt-1 text-[12px] leading-6">
                  {copy.roomsSub}
                </div>
              </div>
              <span className="bg-emerald-400/12 rounded-full border border-emerald-400/30 px-2.5 py-1 text-[10px] font-medium text-emerald-200">
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
                    <div className="truncate text-[14px] font-semibold text-white">
                      {room.name}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-blue-100/50">
                      <div className="flex -space-x-2">
                        {room.avatars.map((avatar, index) => (
                          <img
                            key={`${room.name}-${index}`}
                            src={`https://i.pravatar.cc/150?img=${avatar + 10}`}
                            alt="User"
                            className="h-5 w-5 rounded-full border border-[#07152a] object-cover"
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
                    className="h-9 rounded-full border-white/10 bg-white/5 px-4 text-[12px] text-blue-50 hover:bg-white/10"
                  >
                    {t.community.join}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className={`${surfaceClassName} p-5`}>
            <div>
              <div className="flex items-center gap-2 text-[15px] font-semibold text-white">
                <Hash className="h-4 w-4 text-sky-300" />
                {copy.boardsTitle}
              </div>
              <div className="text-blue-100/56 mt-1 text-[12px] leading-6">
                {copy.boardsSub}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {boardGroups.map((group) => (
                <div key={group.title}>
                  <div className="text-blue-100/48 mb-2 text-[12px] font-medium">
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
                              ? 'bg-sky-400/12 border-sky-400/30 text-sky-100'
                              : 'border-white/8 bg-white/[0.03] text-blue-100/60 hover:bg-white/[0.05] hover:text-white'
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
            <div>
              <div className="flex items-center gap-2 text-[15px] font-semibold text-white">
                <Crown className="h-4 w-4 text-amber-300" />
                {copy.contributorsTitle}
              </div>
              <div className="text-blue-100/56 mt-1 text-[12px] leading-6">
                {copy.contributorsSub}
              </div>
            </div>

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
                          ? 'bg-slate-300/16 text-slate-100'
                          : 'bg-orange-300/16 text-orange-100'
                    }`}
                  >
                    {user.rank}
                  </div>
                  <img
                    src={`https://i.pravatar.cc/150?img=${index + 20}`}
                    alt={user.name}
                    className="h-9 w-9 rounded-2xl border border-white/10 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-white">
                      {user.name}
                    </div>
                    <div className="mt-1 truncate text-[11px] text-blue-100/50">
                      {user.solved} • {user.badge}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              asChild
              variant="outline"
              className="mt-4 h-9 w-full rounded-full border-white/10 bg-white/5 text-sm text-blue-50 hover:bg-white/10"
            >
              <Link href="/dashboard/leaderboard">{copy.viewLeaderboard}</Link>
            </Button>
          </Card>

          <Card className={`${surfaceClassName} p-5`}>
            <div>
              <div className="flex items-center gap-2 text-[15px] font-semibold text-white">
                <Flame className="h-4 w-4 text-orange-300" />
                {copy.hotTopicsTitle}
              </div>
              <div className="text-blue-100/56 mt-1 text-[12px] leading-6">
                {copy.hotTopicsSub}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {topics.map((topic) => (
                <button
                  key={topic.tag}
                  onClick={() => setSearchQuery(topic.tag)}
                  className="border-white/8 text-blue-100/68 rounded-full border bg-white/[0.03] px-3 py-1.5 text-[12px] font-medium hover:bg-white/[0.05] hover:text-white"
                >
                  #{topic.tag}
                  <span className="text-blue-100/38 ml-1">{topic.count}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
