'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/actions/community/post'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

interface SubjectOption {
  id: string
  name: string
}

interface NewPostPageClientProps {
  subjects: SubjectOption[]
}

export function NewPostPageClient({ subjects }: NewPostPageClientProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<'Question' | 'Note' | 'Achievement'>('Question')
  const [subjectId, setSubjectId] = useState('')
  const [tags, setTags] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast({ title: '内容不完整', description: '请填写标题和正文', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const result = await createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        subjectId: subjectId || undefined,
        tags: parsedTags,
      })

      if (!result.success || !result.post) {
        toast({ title: '发布失败', description: result.error || '请稍后重试', variant: 'destructive' })
        return
      }

      toast({ title: '发布成功', description: '帖子已发布' })
      router.push(`/dashboard/community/${result.post.id}`)
      router.refresh()
    } catch (error) {
      console.error('Failed to create post:', error)
      toast({ title: '发布失败', description: '请稍后重试', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-6 md:p-8 border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900">
      <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">发布新帖子</h2>
      <p className="text-sm text-slate-500 mb-6">支持 Markdown 语法。分类和标签将用于检索与推荐。</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">标题</label>
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：二次函数这道题为什么不能用配方法？"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">分类</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as 'Question' | 'Note' | 'Achievement')}
            >
              <option value="Question">Question</option>
              <option value="Note">Note</option>
              <option value="Achievement">Achievement</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">科目（可选）</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">未指定</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">标签（可选）</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="代数, 公式, 求助"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">正文</label>
          <textarea
            className="mt-1 w-full min-h-[240px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="请清晰描述问题背景、你的思路、卡住的地方。"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? '发布中...' : '发布帖子'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard/community')}>
            取消
          </Button>
        </div>
      </form>
    </Card>
  )
}
