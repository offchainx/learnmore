'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { ArrowLeft, Heart, MessageSquare } from 'lucide-react'
import { createComment, toggleLike } from '@/actions/community/post'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { useApp } from '@/providers'
import 'katex/dist/katex.min.css'

interface AuthorInfo {
  id: string
  username: string | null
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
  createdAt: Date | string
  author: AuthorInfo
  comments: CommentItem[]
  likeCount: number
  userLiked: boolean
}

interface PostDetailClientProps {
  initialPost: PostDetailData
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

export function PostDetailClient({ initialPost }: PostDetailClientProps) {
  const { lang } = useApp()
  const [post, setPost] = useState(initialPost)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [togglingLike, setTogglingLike] = useState(false)

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
        commentFailed: '评论失败',
        retryLater: '请稍后重试',
        like: '点赞',
        liked: '已点赞',
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
        commentFailed: 'Komen gagal dihantar',
        retryLater: 'Cuba lagi sebentar lagi',
        like: 'Suka',
        liked: 'Disukai',
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
      commentFailed: 'Comment failed',
      retryLater: 'Please try again later',
      like: 'Like',
      liked: 'Liked',
    }
  }, [lang])

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
        title: copy.commentFailed,
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

      setPost((prev) => ({
        ...prev,
        comments: [...prev.comments, result.comment],
      }))
      setComment('')
      toast({
        title: copy.commentSuccess,
        description: copy.commentSuccessDesc,
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
              <span>{post.author.username || 'Anonymous'}</span>
              <span>•</span>
              <span>{formatRelativeTime(post.createdAt, lang)}</span>
              <span>•</span>
              <span>{post.category || 'General'}</span>
            </div>
          </div>

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

        <article className="text-blue-100/72 prose-p:text-blue-100/72 prose-li:text-blue-100/72 prose prose-sm max-w-none text-[14px] leading-7 dark:prose-invert prose-headings:text-white prose-strong:text-white prose-code:text-sky-200">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {post.content}
          </ReactMarkdown>
        </article>
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
                  {item.author.username || 'Anonymous'} ·{' '}
                  {formatRelativeTime(item.createdAt, lang)}
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
