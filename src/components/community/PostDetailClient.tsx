'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import {
  ArrowLeft,
  CircleCheck,
  Heart,
  MessageSquare,
  Paperclip,
} from 'lucide-react'
import {
  createComment,
  setPostSolved,
  toggleLike,
} from '@/actions/community/post'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { useApp } from '@/providers'
import 'katex/dist/katex.min.css'

interface AuthorInfo {
  id: string
  username: string | null
  handle: string | null
  avatar: string | null
  role: string
}

interface CommentItem {
  id: string
  content: string
  createdAt: Date | string
  author: AuthorInfo
}

interface PostDetailData {
  id: string
  title: string
  content: string
  category: string | null
  tags: string[]
  attachments: string[]
  mentionedHandles: string[]
  isPrivate: boolean
  createdAt: Date | string
  author: AuthorInfo
  comments: CommentItem[]
  likeCount: number
  userLiked: boolean
  isSolved: boolean
}

interface PostDetailClientProps {
  initialPost: PostDetailData
  currentUserId: string
  currentUserRole: 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN'
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

export function PostDetailClient({
  initialPost,
  currentUserId,
  currentUserRole,
}: PostDetailClientProps) {
  const { lang } = useApp()
  const [post, setPost] = useState(initialPost)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [togglingLike, setTogglingLike] = useState(false)
  const [togglingSolved, setTogglingSolved] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const canToggleSolved =
    post.category === 'Question' &&
    (currentUserId === post.author.id ||
      currentUserRole === 'ADMIN' ||
      currentUserRole === 'TEACHER')

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const copy = useMemo(() => {
    if (lang === 'zh') {
      return {
        back: '返回社区',
        threadLabel: 'Discussion Thread',
        commentTitle: '评论',
        commentPlaceholder: '写下你的观点、补充思路或解题路径...',
        commentEmpty: '还没有评论，来写下第一条回复。',
        commentSubmit: '发送评论',
        commentSubmitting: '发送中...',
        commentSuccess: '评论成功',
        commentSuccessDesc: '你的评论已发布',
        commentDuplicate: '重复提交已忽略',
        commentDuplicateDesc: '系统复用了你刚刚发送的评论',
        commentFailed: '评论失败',
        retryLater: '请稍后重试',
        likeFailed: '点赞失败',
        like: '点赞',
        liked: '已点赞',
        solvedTag: '已解决',
        unsolvedTag: '待解决',
        privateTag: '仅自己可见',
        markSolved: '标记已解决',
        markUnsolved: '取消已解决',
        solvedSuccess: '状态已更新',
        solvedSuccessDesc: '已标记为已解决',
        unsolvedSuccess: '状态已更新',
        unsolvedSuccessDesc: '已恢复为待解决',
        solvedFailed: '状态更新失败',
        attachmentsTitle: '附件',
        mentionsTitle: '提及用户',
      }
    }

    if (lang === 'ms') {
      return {
        back: 'Kembali ke komuniti',
        threadLabel: 'Discussion Thread',
        commentTitle: 'Komen',
        commentPlaceholder:
          'Tulis pandangan, langkah penyelesaian atau tambahan idea anda...',
        commentEmpty: 'Belum ada komen. Jadilah orang pertama membalas.',
        commentSubmit: 'Hantar komen',
        commentSubmitting: 'Menghantar...',
        commentSuccess: 'Komen berjaya dihantar',
        commentSuccessDesc: 'Komen anda kini dipaparkan',
        commentDuplicate: 'Penghantaran berulang diabaikan',
        commentDuplicateDesc: 'Komen yang baru dihantar telah digunakan semula',
        commentFailed: 'Komen gagal dihantar',
        retryLater: 'Cuba lagi sebentar lagi',
        likeFailed: 'Suka gagal dikemas kini',
        like: 'Suka',
        liked: 'Disukai',
        solvedTag: 'Selesai',
        unsolvedTag: 'Belum selesai',
        privateTag: 'Hanya saya boleh lihat',
        markSolved: 'Tanda selesai',
        markUnsolved: 'Batal tanda selesai',
        solvedSuccess: 'Status dikemas kini',
        solvedSuccessDesc: 'Ditandakan sebagai selesai',
        unsolvedSuccess: 'Status dikemas kini',
        unsolvedSuccessDesc: 'Dipulihkan sebagai belum selesai',
        solvedFailed: 'Gagal mengemas kini status',
        attachmentsTitle: 'Lampiran',
        mentionsTitle: 'Pengguna disebut',
      }
    }

    return {
      back: 'Back to community',
      threadLabel: 'Discussion Thread',
      commentTitle: 'Comments',
      commentPlaceholder: 'Write your take, extra working or solution path...',
      commentEmpty: 'No comments yet. Be the first to reply.',
      commentSubmit: 'Send comment',
      commentSubmitting: 'Sending...',
      commentSuccess: 'Comment posted',
      commentSuccessDesc: 'Your comment is now live',
      commentDuplicate: 'Duplicate comment ignored',
      commentDuplicateDesc: 'We reused your most recent comment',
      commentFailed: 'Comment failed',
      retryLater: 'Please try again later',
      likeFailed: 'Like failed',
      like: 'Like',
      liked: 'Liked',
      solvedTag: 'Solved',
      unsolvedTag: 'Unsolved',
      privateTag: 'Only visible to me',
      markSolved: 'Mark solved',
      markUnsolved: 'Mark unsolved',
      solvedSuccess: 'Status updated',
      solvedSuccessDesc: 'Marked as solved',
      unsolvedSuccess: 'Status updated',
      unsolvedSuccessDesc: 'Restored as unsolved',
      solvedFailed: 'Failed to update status',
      attachmentsTitle: 'Attachments',
      mentionsTitle: 'Mentioned users',
    }
  }, [lang])

  const categoryLabel = useMemo(() => {
    const category = post.category || 'General'
    if (lang === 'zh') {
      if (category === 'Question') return '提问'
      if (category === 'Note') return '笔记'
      if (category === 'Achievement') return '成就'
      if (category === 'Discussion') return '讨论'
      return category
    }

    if (lang === 'ms') {
      if (category === 'Question') return 'Soalan'
      if (category === 'Note') return 'Nota'
      if (category === 'Achievement') return 'Pencapaian'
      if (category === 'Discussion') return 'Perbincangan'
      return category
    }

    if (category === 'Question') return 'Question'
    if (category === 'Note') return 'Note'
    if (category === 'Achievement') return 'Achievement'
    if (category === 'Discussion') return 'Discussion'
    return category
  }, [lang, post.category])

  async function handleLike() {
    if (togglingLike) return
    setTogglingLike(true)

    const optimisticLiked = !post.userLiked
    setPost((prev) => ({
      ...prev,
      userLiked: optimisticLiked,
      likeCount: optimisticLiked
        ? prev.likeCount + 1
        : Math.max(0, prev.likeCount - 1),
    }))

    const result = await toggleLike(post.id)
    if (!result.success) {
      toast({
        title: copy.likeFailed,
        description: copy.retryLater,
        variant: 'destructive',
      })
      setPost((prev) => ({
        ...prev,
        userLiked: !optimisticLiked,
        likeCount: !optimisticLiked
          ? prev.likeCount + 1
          : Math.max(0, prev.likeCount - 1),
      }))
    }

    setTogglingLike(false)
  }

  async function handleToggleSolved() {
    if (togglingSolved) return

    const nextSolved = !post.isSolved
    setTogglingSolved(true)
    try {
      const result = await setPostSolved({
        postId: post.id,
        solved: nextSolved,
      })

      if (!result.success) {
        toast({
          title: copy.solvedFailed,
          description: result.error || copy.retryLater,
          variant: 'destructive',
        })
        return
      }

      setPost((prev) => ({
        ...prev,
        isSolved: Boolean(result.solved),
      }))
      toast({
        title: result.solved ? copy.solvedSuccess : copy.unsolvedSuccess,
        description: result.solved
          ? copy.solvedSuccessDesc
          : copy.unsolvedSuccessDesc,
      })
    } catch (error) {
      console.error('Failed to toggle solved state:', error)
      toast({
        title: copy.solvedFailed,
        description: copy.retryLater,
        variant: 'destructive',
      })
    } finally {
      setTogglingSolved(false)
    }
  }

  async function handleCommentSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!comment.trim() || submitting) return

    setSubmitting(true)
    try {
      const result = await createComment({
        postId: post.id,
        content: comment.trim(),
      })
      if (!result.success || !result.comment) {
        toast({
          title: copy.commentFailed,
          description: result.error || copy.retryLater,
          variant: 'destructive',
        })
        return
      }

      if (!result.deduped) {
        setPost((prev) => ({
          ...prev,
          comments: [...prev.comments, result.comment],
        }))
      }
      setComment('')
      toast({
        title: result.deduped ? copy.commentDuplicate : copy.commentSuccess,
        description: result.deduped
          ? copy.commentDuplicateDesc
          : copy.commentSuccessDesc,
      })
    } catch (error) {
      console.error('Failed to create comment:', error)
      toast({
        title: copy.commentFailed,
        description: copy.retryLater,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[30px] border border-[#203964] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.14),_transparent_52%),linear-gradient(180deg,_#07152d_0%,_#071121_100%)] p-6 text-white shadow-[0_20px_70px_rgba(3,10,28,0.25)]">
        <Link
          href="/dashboard/community"
          className="text-blue-100/72 inline-flex items-center gap-2 text-[13px] font-medium hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.back}
        </Link>

        <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-blue-100/80">
          {copy.threadLabel}
        </div>

        <div className="mt-4 flex flex-col gap-4 desktop:flex-row desktop:items-start desktop:justify-between">
          <div className="min-w-0">
            <h1 className="text-[28px] font-semibold tracking-tight text-white">
              {post.title}
            </h1>
            <div className="text-blue-100/56 mt-3 flex flex-wrap items-center gap-2 text-[13px]">
              {post.author.handle ? (
                <Link href={`/u/${post.author.handle}`} className="hover:text-white">
                  {post.author.username || `@${post.author.handle}`}
                </Link>
              ) : (
                <span>{post.author.username || 'Anonymous'}</span>
              )}
              <span>•</span>
              <span suppressHydrationWarning>
                {isHydrated
                  ? formatRelativeTime(post.createdAt, lang)
                  : formatStableDate(post.createdAt, lang)}
              </span>
              <span>•</span>
              <span>{categoryLabel}</span>
              {post.isPrivate ? (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-blue-100/80">
                    {copy.privateTag}
                  </span>
                </>
              ) : null}
              {post.category === 'Question' ? (
                <>
                  <span>•</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                      post.isSolved
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200'
                        : 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-100'
                    }`}
                  >
                    <CircleCheck className="h-3.5 w-3.5" />
                    {post.isSolved ? copy.solvedTag : copy.unsolvedTag}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canToggleSolved ? (
              <Button
                variant="outline"
                onClick={handleToggleSolved}
                disabled={togglingSolved}
                className={`h-10 rounded-full border px-4 text-sm ${
                  post.isSolved
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15'
                    : 'border-white/10 bg-white/5 text-blue-50 hover:bg-white/10'
                }`}
              >
                <CircleCheck className="mr-2 h-4 w-4" />
                {post.isSolved ? copy.markUnsolved : copy.markSolved}
              </Button>
            ) : null}

            <Button
              variant="outline"
              onClick={handleLike}
              disabled={togglingLike}
              className="h-10 rounded-full border-white/10 bg-white/5 px-4 text-sm text-blue-50 hover:bg-white/10"
            >
              <Heart
                className={`mr-2 h-4 w-4 ${post.userLiked ? 'fill-current' : ''}`}
              />
              {post.userLiked ? copy.liked : copy.like}
              <span className="text-blue-100/58 ml-2">({post.likeCount})</span>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-[30px] border border-[#203964] bg-[#07152a] p-6 text-white shadow-[0_14px_40px_rgba(4,10,24,0.22)]">
        {post.tags.length > 0 ? (
          <div className="mb-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="border-white/8 rounded-full border bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-blue-100/60"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        {post.mentionedHandles.length > 0 ? (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-blue-100/48 text-[12px]">
              {copy.mentionsTitle}：
            </span>
            {post.mentionedHandles.map((handle) => (
              <Link
                href={`/u/${handle}`}
                key={handle}
                className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100"
              >
                @{handle}
              </Link>
            ))}
          </div>
        ) : null}

        <article className="text-blue-100/72 prose-p:text-blue-100/72 prose-li:text-blue-100/72 prose prose-sm max-w-none text-[14px] leading-7 dark:prose-invert prose-headings:text-white prose-strong:text-white prose-code:text-sky-200">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {post.attachments.length > 0 ? (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-[13px] font-medium text-white">
              <Paperclip className="h-4 w-4 text-sky-300" />
              {copy.attachmentsTitle}
              <span className="text-blue-100/48">({post.attachments.length})</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {post.attachments.map((attachment) => (
                <a
                  key={attachment}
                  href={attachment}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-[20px] border border-white/8 bg-white/[0.03] transition-colors hover:border-sky-400/30"
                >
                  <img
                    src={attachment}
                    alt={post.title}
                    className="h-44 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="rounded-[30px] border border-[#203964] bg-[#07152a] p-6 text-white shadow-[0_14px_40px_rgba(4,10,24,0.22)]">
        <div className="mb-4 flex items-center gap-2 text-[18px] font-semibold text-white">
          <MessageSquare className="h-4 w-4 text-sky-300" />
          {copy.commentTitle}
          <span className="text-blue-100/44">({post.comments.length})</span>
        </div>

        <form onSubmit={handleCommentSubmit} className="mb-6 space-y-3">
          <textarea
            className="border-white/8 placeholder:text-blue-100/34 min-h-[112px] w-full rounded-[24px] border bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white focus:outline-none focus:ring-2 focus:ring-sky-400/30"
            placeholder={copy.commentPlaceholder}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <Button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="h-11 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 hover:bg-slate-100"
          >
            {submitting ? copy.commentSubmitting : copy.commentSubmit}
          </Button>
        </form>

        <div className="space-y-3">
          {post.comments.length === 0 ? (
            <div className="text-blue-100/56 rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-sm">
              {copy.commentEmpty}
            </div>
          ) : (
            post.comments.map((item) => (
              <div
                key={item.id}
                className="border-white/8 rounded-[22px] border bg-white/[0.03] px-4 py-4"
              >
                <div className="text-blue-100/48 mb-2 text-[12px]">
                  {item.author.handle ? (
                    <Link href={`/u/${item.author.handle}`} className="hover:text-white">
                      {item.author.username || `@${item.author.handle}`}
                    </Link>
                  ) : (
                    item.author.username || 'Anonymous'
                  )}{' '}
                  ·{' '}
                  <span suppressHydrationWarning>
                    {isHydrated
                      ? formatRelativeTime(item.createdAt, lang)
                      : formatStableDate(item.createdAt, lang)}
                  </span>
                </div>
                <p className="text-blue-100/78 whitespace-pre-wrap text-sm leading-7">
                  {item.content}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
