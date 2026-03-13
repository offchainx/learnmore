'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Bot,
  CircleCheck,
  Crown,
  Flame,
  Hash,
  Heart,
  ImageIcon,
  MessageSquare,
  Mic,
  Plus,
  Search,
  Send,
  Share2,
  Sparkles,
} from 'lucide-react'
import { useApp } from '@/providers'
import {
  createPost,
  toggleLike,
  PostWithAuthor,
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

interface CommunityViewProps {
  initialPosts?: PostWithAuthor[]
  initialTab?: 'latest' | 'popular' | 'unanswered'
}

type FeedPost = PostWithAuthor & {
  likeCount: number
  userLiked: boolean
  _count: {
    comments: number
    likes?: number
  }
}

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

    return {
      ...post,
      likeCount:
        typeof rawPost.likeCount === 'number'
          ? rawPost.likeCount
          : (rawPost._count?.likes ?? 0),
      userLiked: Boolean(rawPost.userLiked),
      _count: {
        comments: post._count.comments,
        likes: rawPost._count?.likes ?? 0,
      },
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

export function CommunityView({
  initialPosts = [],
  initialTab = 'latest',
}: CommunityViewProps) {
  const { t, lang } = useApp()
  const [activeTab, setActiveTab] = useState<
    'latest' | 'popular' | 'unanswered'
  >(initialTab)
  const [posts, setPosts] = useState<FeedPost[]>(() =>
    normalizePosts(initialPosts)
  )
  const [loading, setLoading] = useState(initialPosts.length === 0)
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const lastLoadedKeyRef = useRef<string>(
    initialPosts.length > 0 ? `${initialTab}:1:20` : ''
  )

  const copy = useMemo(() => {
    if (lang === 'zh') {
      return {
        badge: 'Study Circle',
        searchPlaceholder: '搜索帖子、标签或讨论主题',
        publish: '发布帖子',
        quickPostLabel: '快速发帖',
        quickPostHint:
          '把问题、思路或刚解开的题目发到社区里，方便同学继续接力。',
        photo: '图片',
        topic: '话题',
        aiSuggestion: 'AI 推荐：#错题求助',
        feedTitle: '讨论动态',
        feedSub: '最新讨论、热门回复和待解答提问都在这里收口。',
        loading: '正在加载社区动态...',
        postFailed: '加载失败，请稍后重试。',
        postSuccess: '帖子已发布',
        quickPostFallback: '新的社区提问',
        questionTag: '提问',
        solvedTag: '已解决',
        achievementTag: '成就',
        aiHint: '还没有同学回复，先向 AI 助手要一个提示。',
        noPosts: '当前筛选下还没有帖子，换个标签看看。',
        liveRoomsSub: '加入同频学习房，边自习边交流。',
        liveNow: '在线中',
        online: '在线',
        topContributorsSub: '最近解答最多、最愿意接力帮助别人的同学。',
        solvedCount: '已解答',
        viewLeaderboard: '查看排行榜',
        hotTopicsSub: '最近讨论最热的标签，点开可继续追踪。',
      }
    }

    if (lang === 'ms') {
      return {
        badge: 'Study Circle',
        searchPlaceholder: 'Cari siaran, tag atau topik',
        publish: 'Siarkan',
        quickPostLabel: 'Siaran pantas',
        quickPostHint:
          'Kongsi soalan, idea atau penemuan anda supaya komuniti boleh sambung membantu.',
        photo: 'Imej',
        topic: 'Topik',
        aiSuggestion: 'Cadangan AI: #soalan-silap',
        feedTitle: 'Aliran komuniti',
        feedSub:
          'Perbincangan terkini, balasan popular dan soalan belum dijawab dikumpulkan di sini.',
        loading: 'Memuatkan aliran komuniti...',
        postFailed: 'Gagal memuatkan siaran. Cuba lagi sebentar lagi.',
        postSuccess: 'Siaran berjaya diterbitkan',
        quickPostFallback: 'Soalan komuniti baharu',
        questionTag: 'Soalan',
        solvedTag: 'Selesai',
        achievementTag: 'Pencapaian',
        aiHint: 'Belum ada balasan. Cuba minta petunjuk daripada AI dahulu.',
        noPosts: 'Belum ada siaran untuk penapis ini.',
        liveRoomsSub: 'Sertai bilik belajar langsung dan bincang bersama.',
        liveNow: 'Sedang live',
        online: 'dalam talian',
        topContributorsSub:
          'Pelajar yang paling aktif menjawab dan membantu minggu ini.',
        solvedCount: 'diselesaikan',
        viewLeaderboard: 'Lihat carta',
        hotTopicsSub: 'Tag yang paling hangat dibincangkan sekarang.',
      }
    }

    return {
      badge: 'Study Circle',
      searchPlaceholder: 'Search posts, tags or discussion topics',
      publish: 'New Post',
      quickPostLabel: 'Quick post',
      quickPostHint:
        'Share a question, idea or solved problem so the community can keep the thread moving.',
      photo: 'Photo',
      topic: 'Topic',
      aiSuggestion: 'AI pick: #mistake-help',
      feedTitle: 'Community feed',
      feedSub:
        'Latest discussions, popular replies and unanswered questions in one stream.',
      loading: 'Loading community feed...',
      postFailed: 'Failed to load posts. Please try again later.',
      postSuccess: 'Post published',
      quickPostFallback: 'New community question',
      questionTag: 'Question',
      solvedTag: 'Solved',
      achievementTag: 'Achievement',
      aiHint: 'No replies yet. Ask AI for a quick hint first.',
      noPosts: 'No posts found for this filter.',
      liveRoomsSub: 'Join focused rooms and study together in real time.',
      liveNow: 'Live',
      online: 'online',
      topContributorsSub:
        'Students who answered the most and kept the discussion moving.',
      solvedCount: 'solved',
      viewLeaderboard: 'View leaderboard',
      hotTopicsSub: 'Topics getting the most traction right now.',
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
            ? '高效刷题房'
            : lang === 'ms'
              ? 'Bilik latihan fokus'
              : 'Focused Drill Room',
        topic:
          lang === 'zh'
            ? '练习冲刺'
            : lang === 'ms'
              ? 'Lonjakan latihan'
              : 'Practice sprint',
        users: 34,
        avatars: [5, 6, 7],
      },
      {
        name:
          lang === 'zh'
            ? '物理考前答疑'
            : lang === 'ms'
              ? 'Fizik sebelum peperiksaan'
              : 'Exam Prep Physics',
        topic:
          lang === 'zh'
            ? '力学与图像'
            : lang === 'ms'
              ? 'Mekanik & graf'
              : 'Mechanics & graphs',
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

  const fetchPosts = useCallback(
    async (tab: 'latest' | 'popular' | 'unanswered', force = false) => {
      const requestKey = `${tab}:1:20`
      if (!force && lastLoadedKeyRef.current === requestKey) {
        return
      }
      if (!force) {
        lastLoadedKeyRef.current = requestKey
      }

      setLoading(true)
      try {
        const response = await fetchWithTimeout(
          `/api/community/feed?tab=${encodeURIComponent(tab)}&page=1&limit=20`,
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
            : copy.postFailed,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    },
    [copy.postFailed, lang]
  )

  useEffect(() => {
    void fetchPosts(activeTab)
  }, [activeTab, fetchPosts])

  async function handleCreatePost() {
    if (!newPostContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const result = await createPost({
        title:
          newPostContent.split('\n')[0].substring(0, 100) ||
          copy.quickPostFallback,
        content: newPostContent,
        category: 'Question',
      })

      if (result.success) {
        setNewPostContent('')
        await fetchPosts(activeTab, true)
        toast({
          title:
            lang === 'zh'
              ? '发布成功'
              : lang === 'ms'
                ? 'Berjaya diterbitkan'
                : 'Published',
          description: copy.postSuccess,
        })
      } else {
        toast({
          title:
            lang === 'zh'
              ? '发布失败'
              : lang === 'ms'
                ? 'Gagal diterbitkan'
                : 'Publish failed',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title:
          lang === 'zh'
            ? '发布失败'
            : lang === 'ms'
              ? 'Gagal diterbitkan'
              : 'Publish failed',
        description: copy.postFailed,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLike(postId: string) {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post

        const optimisticLiked = !post.userLiked
        return {
          ...post,
          userLiked: optimisticLiked,
          likeCount: optimisticLiked
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
      await fetchPosts(activeTab, true)
    }
  }

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

    return null
  }

  return (
    <div className="animate-fade-in-up space-y-6 pb-12">
      <Card className="overflow-hidden rounded-[30px] border border-[#203964] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_52%),linear-gradient(180deg,_#07152d_0%,_#071121_100%)] p-6 text-white shadow-[0_20px_70px_rgba(3,10,28,0.25)]">
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
            <div className="relative min-w-0 sm:w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-100/40" />
              <input
                type="text"
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card className="rounded-[28px] border border-[#203964] bg-[#07152a] p-5 text-white shadow-[0_14px_40px_rgba(4,10,24,0.22)]">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-semibold text-slate-950">
                LM
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-3">
                  <div className="text-sm font-semibold text-white">
                    {copy.quickPostLabel}
                  </div>
                  <div className="text-blue-100/58 mt-1 text-[13px] leading-6">
                    {copy.quickPostHint}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={newPostContent}
                    onChange={(event) => setNewPostContent(event.target.value)}
                    placeholder={t.community.createPost}
                    className="border-white/8 min-h-[92px] w-full rounded-[22px] border bg-white/[0.04] px-4 py-3 pr-14 text-sm leading-6 text-white placeholder:text-blue-100/35 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                  />
                  {newPostContent.length > 0 ? (
                    <Button
                      size="sm"
                      onClick={handleCreatePost}
                      disabled={isSubmitting}
                      className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white p-0 text-slate-950 hover:bg-slate-100"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="border-white/8 text-blue-100/68 h-8 rounded-full border bg-white/[0.03] px-3 text-[12px] hover:bg-white/[0.08] hover:text-white"
                    >
                      <ImageIcon className="mr-1.5 h-3.5 w-3.5 text-emerald-300" />
                      {copy.photo}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="border-white/8 text-blue-100/68 h-8 rounded-full border bg-white/[0.03] px-3 text-[12px] hover:bg-white/[0.08] hover:text-white"
                    >
                      <Hash className="mr-1.5 h-3.5 w-3.5 text-sky-300" />
                      {copy.topic}
                    </Button>
                  </div>

                  <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-medium text-sky-100/80">
                    {copy.aiSuggestion}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[26px] border border-[#203964] bg-[#07152a] px-4 py-3 text-white shadow-[0_12px_36px_rgba(4,10,24,0.2)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-semibold text-white">
                  {copy.feedTitle}
                </div>
                <div className="text-blue-100/56 mt-1 text-[13px]">
                  {copy.feedSub}
                </div>
              </div>

              <div className="border-white/8 inline-flex rounded-full border bg-white/[0.04] p-1">
                {(['latest', 'popular', 'unanswered'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 text-[13px] font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-white text-slate-950 shadow-[0_8px_20px_rgba(255,255,255,0.12)]'
                        : 'text-blue-100/56 hover:text-white'
                    }`}
                  >
                    {t.community.tabs[tab]}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            {loading ? (
              <Card className="text-blue-100/56 rounded-[28px] border border-[#203964] bg-[#07152a] px-5 py-10 text-center text-sm">
                {copy.loading}
              </Card>
            ) : null}

            {!loading
              ? posts.map((post) => (
                  <Card
                    key={post.id}
                    className="hover:border-sky-400/24 rounded-[28px] border border-[#203964] bg-[#07152a] px-5 py-4 text-white shadow-[0_12px_36px_rgba(4,10,24,0.18)] transition-colors"
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
                            <span className="truncate text-[14px] font-semibold text-white">
                              {post.author.username || 'Anonymous'}
                            </span>
                            <span className="border-white/8 rounded-full border bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-blue-100/60">
                              {post.author.role}
                            </span>
                            {post.subject?.name ? (
                              <span className="text-sky-200/72 text-[11px]">
                                #{post.subject.name}
                              </span>
                            ) : null}
                          </div>
                          <div className="text-blue-100/42 mt-1 text-[12px]">
                            {formatRelativeTime(post.createdAt, lang)}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">{renderCategory(post)}</div>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/dashboard/community/${post.id}`}
                        className="block text-[18px] font-semibold leading-7 text-white hover:text-sky-200"
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

                    {post.category === 'Question' && !post.isSolved ? (
                      <div className="border-sky-400/18 mt-4 flex flex-col gap-3 rounded-[20px] border bg-sky-400/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sky-100/82 flex items-center gap-2 text-[12px]">
                          <Sparkles className="h-4 w-4 text-sky-300" />
                          <span>{copy.aiHint}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-full border-sky-300/20 bg-white/5 px-3 text-[12px] text-sky-100 hover:bg-white/10"
                        >
                          {t.community.askAI}
                        </Button>
                      </div>
                    ) : null}

                    {post.tags.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="border-white/8 text-blue-100/58 rounded-full border bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="border-white/8 text-blue-100/52 mt-4 flex items-center gap-5 border-t pt-3 text-[13px]">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`inline-flex items-center gap-2 transition-colors ${
                          post.userLiked ? 'text-rose-300' : 'hover:text-white'
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

                      <button className="ml-auto inline-flex items-center gap-2 hover:text-white">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))
              : null}

            {!loading && posts.length === 0 ? (
              <Card className="text-blue-100/56 rounded-[28px] border border-dashed border-[#203964] bg-[#07152a] px-5 py-12 text-center">
                <Bot className="mx-auto mb-4 h-10 w-10 opacity-40" />
                <div className="text-sm">{copy.noPosts}</div>
              </Card>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="rounded-[28px] border border-[#203964] bg-[#07152a] p-5 text-white shadow-[0_12px_36px_rgba(4,10,24,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-[15px] font-semibold text-white">
                  <Mic className="h-4 w-4 text-emerald-300" />
                  {t.community.liveRooms}
                </div>
                <div className="text-blue-100/56 mt-1 text-[12px] leading-6">
                  {copy.liveRoomsSub}
                </div>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-200">
                {copy.liveNow}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {rooms.map((room) => (
                <div
                  key={room.name}
                  className="border-white/8 flex items-center justify-between gap-3 rounded-[20px] border bg-white/[0.03] px-3.5 py-3"
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
                    className="h-8 rounded-full border-white/10 bg-white/5 px-3 text-[12px] text-blue-50 hover:bg-white/10"
                  >
                    {t.community.join}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[28px] border border-[#203964] bg-[#07152a] p-5 text-white shadow-[0_12px_36px_rgba(4,10,24,0.18)]">
            <div>
              <div className="flex items-center gap-2 text-[15px] font-semibold text-white">
                <Crown className="h-4 w-4 text-amber-300" />
                {t.community.topContributors}
              </div>
              <div className="text-blue-100/56 mt-1 text-[12px] leading-6">
                {copy.topContributorsSub}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {contributors.map((user, index) => (
                <div
                  key={user.name}
                  className="border-white/8 flex items-center gap-3 rounded-[20px] border bg-white/[0.03] px-3.5 py-3"
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
                      {user.solved} {copy.solvedCount} • {user.badge}
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

          <Card className="rounded-[28px] border border-[#203964] bg-[#07152a] p-5 text-white shadow-[0_12px_36px_rgba(4,10,24,0.18)]">
            <div>
              <div className="flex items-center gap-2 text-[15px] font-semibold text-white">
                <Flame className="h-4 w-4 text-orange-300" />
                {t.community.hotTopics}
              </div>
              <div className="text-blue-100/56 mt-1 text-[12px] leading-6">
                {copy.hotTopicsSub}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {topics.map((topic) => (
                <span
                  key={topic.tag}
                  className="border-white/8 text-blue-100/68 rounded-full border bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium"
                >
                  #{topic.tag}
                  <span className="text-blue-100/38 ml-1">{topic.count}</span>
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
