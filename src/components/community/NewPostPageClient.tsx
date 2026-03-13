'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/actions/community/post'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { useApp } from '@/providers'

interface SubjectOption {
  id: string
  name: string
}

interface NewPostPageClientProps {
  subjects: SubjectOption[]
}

export function NewPostPageClient({ subjects }: NewPostPageClientProps) {
  const router = useRouter()
  const { lang } = useApp()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<'Question' | 'Note' | 'Achievement'>(
    'Question'
  )
  const [subjectId, setSubjectId] = useState('')
  const [tags, setTags] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const copy = useMemo(() => {
    if (lang === 'zh') {
      return {
        eyebrow: 'Community Studio',
        title: '发布新帖子',
        sub: '把问题、笔记或新解开的题目整理成一条高质量帖子，方便社区继续接力。',
        contentErrorTitle: '内容不完整',
        contentErrorDesc: '请填写标题和正文',
        submitFailed: '发布失败',
        retryLater: '请稍后重试',
        submitSuccess: '发布成功',
        submitSuccessDesc: '帖子已发布',
        titleLabel: '标题',
        titlePlaceholder: '例如：二次函数这道题为什么不能用配方法？',
        categoryLabel: '分类',
        subjectLabel: '科目（可选）',
        subjectPlaceholder: '未指定',
        tagsLabel: '标签（可选）',
        tagsPlaceholder: '代数, 公式, 求助',
        contentLabel: '正文',
        contentPlaceholder: '请清晰描述问题背景、你的思路和卡住的地方。',
        submit: '发布帖子',
        submitting: '发布中...',
        cancel: '取消',
        note: '支持 Markdown 语法，标签和分类会用于社区检索与推荐。',
        question: '提问',
        noteOption: '笔记',
        achievement: '成就',
      }
    }

    if (lang === 'ms') {
      return {
        eyebrow: 'Community Studio',
        title: 'Cipta siaran baharu',
        sub: 'Susun soalan, nota atau pencapaian anda supaya komuniti boleh terus membantu.',
        contentErrorTitle: 'Maklumat tidak lengkap',
        contentErrorDesc: 'Sila isi tajuk dan kandungan',
        submitFailed: 'Gagal diterbitkan',
        retryLater: 'Cuba lagi sebentar lagi',
        submitSuccess: 'Berjaya diterbitkan',
        submitSuccessDesc: 'Siaran telah diterbitkan',
        titleLabel: 'Tajuk',
        titlePlaceholder:
          'Contoh: Mengapa soalan fungsi ini tidak boleh guna kaedah tertentu?',
        categoryLabel: 'Kategori',
        subjectLabel: 'Subjek (pilihan)',
        subjectPlaceholder: 'Tidak ditetapkan',
        tagsLabel: 'Tag (pilihan)',
        tagsPlaceholder: 'algebra, formula, bantuan',
        contentLabel: 'Kandungan',
        contentPlaceholder:
          'Terangkan konteks, idea anda dan bahagian yang anda masih tersekat.',
        submit: 'Terbitkan siaran',
        submitting: 'Sedang diterbitkan...',
        cancel: 'Batal',
        note: 'Markdown disokong. Tag dan kategori digunakan untuk carian dan cadangan.',
        question: 'Soalan',
        noteOption: 'Nota',
        achievement: 'Pencapaian',
      }
    }

    return {
      eyebrow: 'Community Studio',
      title: 'Create a new post',
      sub: 'Package your question, note or solved idea into a clear post so the community can continue the thread.',
      contentErrorTitle: 'Missing content',
      contentErrorDesc: 'Please add a title and body',
      submitFailed: 'Publish failed',
      retryLater: 'Please try again later',
      submitSuccess: 'Post published',
      submitSuccessDesc: 'Your post is now live',
      titleLabel: 'Title',
      titlePlaceholder:
        'Example: Why does this quadratic question fail with factorisation?',
      categoryLabel: 'Category',
      subjectLabel: 'Subject (optional)',
      subjectPlaceholder: 'Not selected',
      tagsLabel: 'Tags (optional)',
      tagsPlaceholder: 'algebra, formula, help',
      contentLabel: 'Body',
      contentPlaceholder:
        'Describe the context, your thinking and exactly where you got stuck.',
      submit: 'Publish post',
      submitting: 'Publishing...',
      cancel: 'Cancel',
      note: 'Markdown is supported. Tags and categories help search and recommendation.',
      question: 'Question',
      noteOption: 'Note',
      achievement: 'Achievement',
    }
  }, [lang])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !content.trim()) {
      toast({
        title: copy.contentErrorTitle,
        description: copy.contentErrorDesc,
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const parsedTags = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

      const result = await createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        subjectId: subjectId || undefined,
        tags: parsedTags,
      })

      if (!result.success || !result.post) {
        toast({
          title: copy.submitFailed,
          description: result.error || copy.retryLater,
          variant: 'destructive',
        })
        return
      }

      toast({ title: copy.submitSuccess, description: copy.submitSuccessDesc })
      router.push(`/dashboard/community/${result.post.id}`)
      router.refresh()
    } catch (error) {
      console.error('Failed to create post:', error)
      toast({
        title: copy.submitFailed,
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
        <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-blue-100/80">
          {copy.eyebrow}
        </div>
        <h1 className="mt-4 text-[28px] font-semibold tracking-tight text-white">
          {copy.title}
        </h1>
        <p className="text-blue-100/64 mt-2 max-w-2xl text-sm leading-6">
          {copy.sub}
        </p>
      </Card>

      <Card className="rounded-[30px] border border-[#203964] bg-[#07152a] p-6 text-white shadow-[0_14px_40px_rgba(4,10,24,0.22)]">
        <div className="border-sky-400/18 text-sky-100/82 mb-6 rounded-[22px] border bg-sky-400/10 px-4 py-3 text-[13px] leading-6">
          {copy.note}
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-blue-100/82 text-sm font-medium">
              {copy.titleLabel}
            </label>
            <input
              className="border-white/8 placeholder:text-blue-100/34 mt-2 h-11 w-full rounded-2xl border bg-white/[0.04] px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400/30"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={copy.titlePlaceholder}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-blue-100/82 text-sm font-medium">
                {copy.categoryLabel}
              </label>
              <select
                className="border-white/8 mt-2 h-11 w-full rounded-2xl border bg-white/[0.04] px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value as 'Question' | 'Note' | 'Achievement'
                  )
                }
              >
                <option value="Question">{copy.question}</option>
                <option value="Note">{copy.noteOption}</option>
                <option value="Achievement">{copy.achievement}</option>
              </select>
            </div>

            <div>
              <label className="text-blue-100/82 text-sm font-medium">
                {copy.subjectLabel}
              </label>
              <select
                className="border-white/8 mt-2 h-11 w-full rounded-2xl border bg-white/[0.04] px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
              >
                <option value="">{copy.subjectPlaceholder}</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-blue-100/82 text-sm font-medium">
                {copy.tagsLabel}
              </label>
              <input
                className="border-white/8 placeholder:text-blue-100/34 mt-2 h-11 w-full rounded-2xl border bg-white/[0.04] px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder={copy.tagsPlaceholder}
              />
            </div>
          </div>

          <div>
            <label className="text-blue-100/82 text-sm font-medium">
              {copy.contentLabel}
            </label>
            <textarea
              className="border-white/8 placeholder:text-blue-100/34 mt-2 min-h-[280px] w-full rounded-[24px] border bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white focus:outline-none focus:ring-2 focus:ring-sky-400/30"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={copy.contentPlaceholder}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 hover:bg-slate-100"
            >
              {submitting ? copy.submitting : copy.submit}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full border-white/10 bg-white/5 px-5 text-sm text-blue-50 hover:bg-white/10"
              onClick={() => router.push('/dashboard/community')}
            >
              {copy.cancel}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
