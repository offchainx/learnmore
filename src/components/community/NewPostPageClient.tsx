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

const surfaceClassName =
  'rounded-[28px] border border-[#24324D] bg-[linear-gradient(180deg,rgba(10,18,32,0.95),rgba(5,11,20,0.98))] text-white shadow-[0_18px_48px_rgba(2,8,23,0.28)]'

const fieldCardClassName =
  'rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-white'

export function NewPostPageClient({ subjects }: NewPostPageClientProps) {
  const router = useRouter()
  const { lang } = useApp()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [tags, setTags] = useState('')
  const [isOriginal, setIsOriginal] = useState(true)
  const [isPrivate, setIsPrivate] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const copy = useMemo(() => {
    if (lang === 'zh') {
      return {
        title: '发帖子',
        sub: '按论坛发布结构整理标题、板块、标签和正文，方便社区快速浏览和检索。',
        articleTitle: '文章标题',
        articlePlaceholder: '请输入文章标题',
        boardLabel: '论坛板块',
        boardPlaceholder: '请选择论坛板块',
        tagLabel: '帖子标签',
        tagPlaceholder: '用逗号分隔，例如：代数, 函数, 求助',
        attachmentLabel: '附件列表',
        attachmentHint: '本轮先保留上传入口样式，附件功能后续接入。',
        mentionLabel: '提及用户',
        mentionHint: '本轮先保留提及入口样式，不改现有业务。',
        originalLabel: '是否原创且独家',
        originalHint: '只有原创内容才有机会获得更高质量曝光。',
        privateLabel: '仅自己可见',
        privateHint: '打开后帖子仅自己可见，适合先保存草稿。',
        bodyLabel: '帖子内容',
        bodyPlaceholder: '请输入您要发表的内容...',
        addAttachment: '+ 添加附件',
        mentionUser: '+ 添加提及用户',
        note: '目前板块、标签和正文会真实提交；附件、提及用户与更多论坛字段先保留样式入口。',
        submit: '发布帖子',
        submitting: '发布中...',
        cancel: '取消',
        validateTitle: '内容不完整',
        validateDesc: '请填写标题、板块和正文',
        success: '发布成功',
        successDesc: '帖子已发布',
        failed: '发布失败',
        retry: '请稍后重试',
      }
    }

    if (lang === 'ms') {
      return {
        title: 'Tulis siaran',
        sub: 'Susun tajuk, papan, tag dan kandungan supaya komuniti boleh membaca dengan cepat.',
        articleTitle: 'Tajuk',
        articlePlaceholder: 'Masukkan tajuk siaran',
        boardLabel: 'Papan forum',
        boardPlaceholder: 'Pilih papan forum',
        tagLabel: 'Tag siaran',
        tagPlaceholder:
          'Pisahkan dengan koma, contoh: algebra, fungsi, bantuan',
        attachmentLabel: 'Lampiran',
        attachmentHint:
          'Gaya muat naik disediakan dahulu. Fungsi sebenar akan disambung kemudian.',
        mentionLabel: 'Sebut pengguna',
        mentionHint: 'Pintu masuk gaya sahaja untuk pusingan ini.',
        originalLabel: 'Asal dan eksklusif',
        originalHint:
          'Kandungan asli lebih mudah mendapat pendedahan berkualiti.',
        privateLabel: 'Hanya saya boleh lihat',
        privateHint: 'Hidupkan untuk simpan sebagai draf peribadi.',
        bodyLabel: 'Kandungan siaran',
        bodyPlaceholder: 'Masukkan kandungan yang ingin anda siarkan...',
        addAttachment: '+ Tambah lampiran',
        mentionUser: '+ Tambah sebutan',
        note: 'Buat masa ini papan, tag dan kandungan akan dihantar secara sebenar; lampiran dan sebutan masih UI sahaja.',
        submit: 'Terbitkan siaran',
        submitting: 'Sedang diterbitkan...',
        cancel: 'Batal',
        validateTitle: 'Maklumat tidak lengkap',
        validateDesc: 'Sila isi tajuk, papan dan kandungan',
        success: 'Berjaya diterbitkan',
        successDesc: 'Siaran telah diterbitkan',
        failed: 'Gagal diterbitkan',
        retry: 'Cuba lagi sebentar lagi',
      }
    }

    return {
      title: 'Create post',
      sub: 'Use a forum-style composer so the community can scan title, board, tags and body quickly.',
      articleTitle: 'Title',
      articlePlaceholder: 'Enter post title',
      boardLabel: 'Forum board',
      boardPlaceholder: 'Choose a board',
      tagLabel: 'Post tags',
      tagPlaceholder: 'Comma separated, e.g. algebra, functions, help',
      attachmentLabel: 'Attachments',
      attachmentHint: 'Upload entry is kept as a styled placeholder for now.',
      mentionLabel: 'Mention users',
      mentionHint: 'Mention entry is UI-only in this pass.',
      originalLabel: 'Original and exclusive',
      originalHint: 'Original posts are more likely to get featured.',
      privateLabel: 'Only visible to me',
      privateHint: 'Turn on to keep this as a private draft.',
      bodyLabel: 'Post body',
      bodyPlaceholder: 'Enter the content you want to publish...',
      addAttachment: '+ Add attachment',
      mentionUser: '+ Mention user',
      note: 'Board, tags and body submit for real; attachment and mention rows are kept as UI entry points only.',
      submit: 'Publish post',
      submitting: 'Publishing...',
      cancel: 'Cancel',
      validateTitle: 'Missing content',
      validateDesc: 'Please fill title, board and body',
      success: 'Published',
      successDesc: 'Your post is now live',
      failed: 'Publish failed',
      retry: 'Please try again later',
    }
  }, [lang])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !content.trim() || !subjectId) {
      toast({
        title: copy.validateTitle,
        description: copy.validateDesc,
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
        category: isOriginal ? 'Note' : 'Question',
        subjectId,
        tags: parsedTags,
      })

      if (!result.success || !result.post) {
        toast({
          title: copy.failed,
          description: result.error || copy.retry,
          variant: 'destructive',
        })
        return
      }

      toast({ title: copy.success, description: copy.successDesc })
      router.push(`/dashboard/community/${result.post.id}`)
      router.refresh()
    } catch (error) {
      console.error('Failed to create post:', error)
      toast({
        title: copy.failed,
        description: copy.retry,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card
        className={`${surfaceClassName} overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_top,_rgba(41,98,190,0.12),_transparent_50%),linear-gradient(180deg,rgba(10,18,32,0.95),rgba(5,11,20,0.98))] p-6`}
      >
        <h1 className="text-[28px] font-semibold tracking-tight text-white">
          {copy.title}
        </h1>
        <p className="text-blue-100/64 mt-2 max-w-3xl text-sm leading-6">
          {copy.sub}
        </p>
      </Card>

      <Card className={`${surfaceClassName} rounded-[30px] p-6`}>
        <div className="border-sky-400/18 text-sky-100/82 mb-6 rounded-[22px] border bg-sky-400/10 px-4 py-3 text-[13px] leading-6">
          {copy.note}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 desktop:grid-cols-2">
            <div className={`${fieldCardClassName} desktop:col-span-2`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[15px] font-medium text-white">
                    {copy.articleTitle}
                  </div>
                  <div className="text-blue-100/48 mt-1 text-[12px] leading-6">
                    {copy.sub}
                  </div>
                </div>
              </div>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={copy.articlePlaceholder}
                className="border-white/8 placeholder:text-blue-100/34 h-12 w-full rounded-2xl border bg-white/[0.04] px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400/30"
              />
            </div>

            <div className={fieldCardClassName}>
              <div className="mb-3">
                <div className="text-[15px] font-medium text-white">
                  {copy.boardLabel}
                </div>
                <div className="text-blue-100/48 mt-1 text-[12px] leading-6">
                  选择发布板块，帮助同学快速定位内容。
                </div>
              </div>
              <select
                value={subjectId}
                onChange={(event) => setSubjectId(event.target.value)}
                className="border-white/8 h-12 w-full rounded-2xl border bg-white/[0.04] px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400/30"
              >
                <option value="">{copy.boardPlaceholder}</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={fieldCardClassName}>
              <div className="mb-3">
                <div className="text-[15px] font-medium text-white">
                  {copy.tagLabel}
                </div>
                <div className="text-blue-100/48 mt-1 text-[12px] leading-6">
                  使用简洁标签增强检索和聚合展示。
                </div>
              </div>
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder={copy.tagPlaceholder}
                className="border-white/8 placeholder:text-blue-100/34 h-12 w-full rounded-2xl border bg-white/[0.04] px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400/30"
              />
            </div>

            <div className={fieldCardClassName}>
              <div className="mb-4">
                <div className="text-[15px] font-medium text-white">
                  {copy.originalLabel}
                </div>
                <div className="text-blue-100/48 mt-1 text-[12px] leading-6">
                  {copy.originalHint}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOriginal(true)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isOriginal
                      ? 'bg-sky-400/14 border-sky-400/30 text-sky-100'
                      : 'text-blue-100/58 border-white/10 bg-white/[0.03] hover:text-white'
                  }`}
                >
                  是
                </button>
                <button
                  type="button"
                  onClick={() => setIsOriginal(false)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    !isOriginal
                      ? 'bg-sky-400/14 border-sky-400/30 text-sky-100'
                      : 'text-blue-100/58 border-white/10 bg-white/[0.03] hover:text-white'
                  }`}
                >
                  否
                </button>
              </div>
            </div>

            <div className={fieldCardClassName}>
              <div className="mb-4">
                <div className="text-[15px] font-medium text-white">
                  {copy.privateLabel}
                </div>
                <div className="text-blue-100/48 mt-1 text-[12px] leading-6">
                  {copy.privateHint}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivate((prev) => !prev)}
                className={`relative inline-flex h-9 w-16 items-center rounded-full border transition-colors ${
                  isPrivate
                    ? 'border-sky-400/40 bg-sky-400/20'
                    : 'border-white/10 bg-white/[0.04]'
                }`}
              >
                <span
                  className={`absolute h-7 w-7 rounded-full bg-white transition-transform ${
                    isPrivate ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className={fieldCardClassName}>
              <div className="mb-4">
                <div className="text-[15px] font-medium text-white">
                  {copy.attachmentLabel}
                </div>
                <div className="text-blue-100/48 mt-1 text-[12px] leading-6">
                  {copy.attachmentHint}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full border-white/10 bg-white/5 px-5 text-sm text-blue-50 hover:bg-white/10"
              >
                {copy.addAttachment}
              </Button>
            </div>

            <div className={fieldCardClassName}>
              <div className="mb-4">
                <div className="text-[15px] font-medium text-white">
                  {copy.mentionLabel}
                </div>
                <div className="text-blue-100/48 mt-1 text-[12px] leading-6">
                  {copy.mentionHint}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full border-white/10 bg-white/5 px-5 text-sm text-blue-50 hover:bg-white/10"
              >
                {copy.mentionUser}
              </Button>
            </div>
          </div>

          <div className={fieldCardClassName}>
            <div className="mb-3">
              <div className="text-[15px] font-medium text-white">
                {copy.bodyLabel}
              </div>
              <div className="text-blue-100/48 mt-1 text-[12px] leading-6">
                先写清上下文和问题，再补充公式、步骤或附件说明。
              </div>
            </div>
            <div className="border-white/8 rounded-[24px] border bg-white/[0.03]">
              <div className="border-white/8 text-blue-100/46 flex flex-wrap items-center gap-3 border-b px-4 py-3">
                <span className="text-sm font-semibold">H</span>
                <span className="text-sm font-semibold">B</span>
                <span className="text-sm italic">I</span>
                <span className="text-sm">⟷</span>
                <span className="text-sm">• List</span>
                <span className="text-sm">1. List</span>
                <span className="text-sm">[]</span>
                <span className="text-sm">&lt;/&gt;</span>
              </div>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={copy.bodyPlaceholder}
                className="placeholder:text-blue-100/34 min-h-[320px] w-full rounded-b-[24px] bg-transparent px-4 py-4 text-sm leading-7 text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
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
