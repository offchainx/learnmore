'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { formatDistanceToNow } from 'date-fns'
import { createComment, toggleLike } from '@/actions/community/post'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
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

export function PostDetailClient({ initialPost }: PostDetailClientProps) {
  const [post, setPost] = useState(initialPost)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [togglingLike, setTogglingLike] = useState(false)

  const createdAtText = useMemo(
    () => formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }),
    [post.createdAt]
  )

  async function handleLike() {
    if (togglingLike) return
    setTogglingLike(true)

    const optimisticLiked = !post.userLiked
    setPost((prev) => ({
      ...prev,
      userLiked: optimisticLiked,
      likeCount: optimisticLiked ? prev.likeCount + 1 : Math.max(0, prev.likeCount - 1),
    }))

    const result = await toggleLike(post.id)
    if (!result.success) {
      toast({ title: '操作失败', description: '点赞失败，请稍后重试', variant: 'destructive' })
      setPost((prev) => ({
        ...prev,
        userLiked: !optimisticLiked,
        likeCount: !optimisticLiked ? prev.likeCount + 1 : Math.max(0, prev.likeCount - 1),
      }))
    }

    setTogglingLike(false)
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim() || submitting) return

    setSubmitting(true)
    try {
      const result = await createComment({ postId: post.id, content: comment.trim() })
      if (!result.success || !result.comment) {
        toast({ title: '评论失败', description: result.error || '请稍后重试', variant: 'destructive' })
        return
      }

      setPost((prev) => ({ ...prev, comments: [...prev.comments, result.comment] }))
      setComment('')
      toast({ title: '评论成功', description: '你的评论已发布' })
    } catch (error) {
      console.error('Failed to create comment:', error)
      toast({ title: '评论失败', description: '请稍后重试', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-500">
        <Link href="/dashboard/community" className="hover:underline">
          社区
        </Link>
        {' / '}
        <span>{post.title}</span>
      </div>

      <Card className="p-6 md:p-8 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{post.title}</h1>
            <p className="text-sm text-slate-500 mt-2">
              {post.author.username || 'Anonymous'} · {createdAtText} · {post.category || 'General'}
            </p>
          </div>
          <Button variant={post.userLiked ? 'default' : 'outline'} onClick={handleLike} disabled={togglingLike}>
            {post.userLiked ? '已点赞' : '点赞'} ({post.likeCount})
          </Button>
        </div>

        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <article className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {post.content}
          </ReactMarkdown>
        </article>
      </Card>

      <Card className="p-6 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">评论 ({post.comments.length})</h2>

        <form onSubmit={handleCommentSubmit} className="space-y-3 mb-6">
          <textarea
            className="w-full min-h-[96px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            placeholder="写下你的观点或解题思路..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button type="submit" disabled={submitting || !comment.trim()}>
            {submitting ? '发送中...' : '发送评论'}
          </Button>
        </form>

        <div className="space-y-4">
          {post.comments.length === 0 ? (
            <p className="text-sm text-slate-500">还没有评论，来抢沙发吧。</p>
          ) : (
            post.comments.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-100 dark:border-slate-800 p-4">
                <div className="text-xs text-slate-500 mb-1">
                  {item.author.username || 'Anonymous'} · {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{item.content}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
