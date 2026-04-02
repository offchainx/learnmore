'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/actions/community/post'
import { uploadImage } from '@/actions/storage'
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
  const [postType, setPostType] = useState<
    'Question' | 'Note' | 'Achievement' | 'Discussion'
  >('Note')
  const [isPrivate, setIsPrivate] = useState(false)
  const [mentionInput, setMentionInput] = useState('')
  const [showMentionInput, setShowMentionInput] = useState(false)
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const attachmentInputRef = useRef<HTMLInputElement | null>(null)
  const mentionInputRef = useRef<HTMLInputElement | null>(null)

  const copy = useMemo(() => {
    if (lang === 'zh') {
      return {
        title: '发帖子',
        sub: '按论坛发布结构整理标题、板块、标签和正文，方便社区快速浏览和检索。',
        postTypeLabel: '帖子类型',
        postTypeHint: '选择帖子类型，帮助社区正确展示状态与筛选方式。',
        questionType: '提问帖',
        noteType: '笔记帖',
        achievementType: '成就分享',
        discussionType: '讨论帖',
        articleTitle: '文章标题',
        articlePlaceholder: '请输入文章标题',
        boardLabel: '论坛板块',
        boardPlaceholder: '请选择论坛板块',
        tagLabel: '帖子标签',
        tagPlaceholder: '用逗号分隔，例如：代数, 函数, 求助',
        privateLabel: '仅自己可见',
        privateHint: '开启后帖子仅对你自己可见。',
        bodyLabel: '帖子内容',
        bodyHint:
          '先写清上下文和问题，再补充公式、步骤、附件或提及用户。格式工具已集成到编辑器工具栏。',
        bodyPlaceholder: '请输入您要发表的内容...',
        addAttachment: '+ 添加附件',
        mentionUser: '+ 添加提及用户',
        mentionHint: '输入账号标识，多个 handle 用逗号分隔，例如：@alice, @bob。正文里的 @handle 也会自动识别。',
        attachmentHint: '支持图片附件，选择后会在发布时一并上传。',
        note: '帖子类型、板块、标签、可见性、正文、附件和提及用户都会真实提交。',
        submit: '发布帖子',
        submitting: '发布中...',
        cancel: '取消',
        validateTitle: '内容不完整',
        validateDesc: '请填写帖子类型、标题、板块和正文',
        success: '发布成功',
        successDesc: '帖子已发布',
        duplicate: '重复提交已忽略',
        duplicateDesc: '系统复用了你刚刚发布的帖子',
        failed: '发布失败',
        retry: '请稍后重试',
      }
    }

    if (lang === 'ms') {
      return {
        title: 'Tulis siaran',
        sub: 'Susun tajuk, papan, tag dan kandungan supaya komuniti boleh membaca dengan cepat.',
        postTypeLabel: 'Jenis siaran',
        postTypeHint: 'Pilih jenis siaran supaya komuniti memaparkan status dengan betul.',
        questionType: 'Soalan',
        noteType: 'Nota',
        achievementType: 'Pencapaian',
        discussionType: 'Perbincangan',
        articleTitle: 'Tajuk',
        articlePlaceholder: 'Masukkan tajuk siaran',
        boardLabel: 'Papan forum',
        boardPlaceholder: 'Pilih papan forum',
        tagLabel: 'Tag siaran',
        tagPlaceholder:
          'Pisahkan dengan koma, contoh: algebra, fungsi, bantuan',
        privateLabel: 'Hanya saya boleh lihat',
        privateHint: 'Apabila dihidupkan, siaran hanya boleh dilihat oleh anda.',
        bodyLabel: 'Kandungan siaran',
        bodyHint:
          'Tulis konteks dan masalah dahulu, kemudian tambah formula, langkah, lampiran atau sebutan pengguna. Alat format kini berada di bar alat penyunting.',
        bodyPlaceholder: 'Masukkan kandungan yang ingin anda siarkan...',
        addAttachment: '+ Tambah lampiran',
        mentionUser: '+ Tambah sebutan',
        mentionHint: 'Masukkan handle, asingkan dengan koma, contohnya: @alice, @bob. @handle dalam kandungan juga akan dikesan.',
        attachmentHint: 'Lampiran imej disokong dan akan dimuat naik semasa penerbitan.',
        note: 'Jenis siaran, papan, tag, keterlihatan, kandungan, lampiran dan sebutan pengguna semuanya dihantar secara sebenar.',
        submit: 'Terbitkan siaran',
        submitting: 'Sedang diterbitkan...',
        cancel: 'Batal',
        validateTitle: 'Maklumat tidak lengkap',
        validateDesc: 'Sila isi jenis siaran, tajuk, papan dan kandungan',
        success: 'Berjaya diterbitkan',
        successDesc: 'Siaran telah diterbitkan',
        duplicate: 'Penghantaran berulang diabaikan',
        duplicateDesc: 'Siaran yang baru dihantar telah digunakan semula',
        failed: 'Gagal diterbitkan',
        retry: 'Cuba lagi sebentar lagi',
      }
    }

    return {
      title: 'Create post',
      sub: 'Use a forum-style composer so the community can scan title, board, tags and body quickly.',
      postTypeLabel: 'Post type',
      postTypeHint: 'Pick a type so the community can surface the right state and filters.',
      questionType: 'Question',
      noteType: 'Note',
      achievementType: 'Achievement',
      discussionType: 'Discussion',
      articleTitle: 'Title',
      articlePlaceholder: 'Enter post title',
      boardLabel: 'Forum board',
      boardPlaceholder: 'Choose a board',
      tagLabel: 'Post tags',
      tagPlaceholder: 'Comma separated, e.g. algebra, functions, help',
      privateLabel: 'Only visible to me',
      privateHint: 'When enabled, only you can see this post.',
      bodyLabel: 'Post body',
      bodyHint:
        'Write the context first, then add formulas, steps, attachments or user mentions. Formatting tools now live in the editor toolbar.',
      bodyPlaceholder: 'Enter the content you want to publish...',
      addAttachment: '+ Add attachment',
      mentionUser: '+ Mention user',
      mentionHint:
        'Enter handles separated by commas, for example: @alice, @bob. @handle in the post body is also detected automatically.',
      attachmentHint: 'Image attachments are supported and upload on publish.',
      note: 'Post type, board, tags, visibility, body, attachments and mentions all submit for real.',
      submit: 'Publish post',
      submitting: 'Publishing...',
      cancel: 'Cancel',
      validateTitle: 'Missing content',
      validateDesc: 'Please fill post type, title, board and body',
      success: 'Published',
      successDesc: 'Your post is now live',
      duplicate: 'Duplicate submission ignored',
      duplicateDesc: 'We reused your most recent post',
      failed: 'Publish failed',
      retry: 'Please try again later',
    }
  }, [lang])

  const insertMarkdown = (before: string, after = before, placeholder = '') => {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart ?? content.length
    const end = el.selectionEnd ?? content.length
    const selected = content.slice(start, end)
    const text = selected || placeholder
    const nextValue = `${content.slice(0, start)}${before}${text}${after}${content.slice(end)}`

    setContent(nextValue)

    requestAnimationFrame(() => {
      el.focus()
      const cursorStart = start + before.length
      const cursorEnd = cursorStart + text.length
      el.setSelectionRange(cursorStart, cursorEnd)
    })
  }

  const handleAttachmentFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const incoming = Array.from(files).filter((file) =>
      file.type.startsWith('image/'),
    )

    if (incoming.length === 0) {
      toast({
        title: lang === 'zh' ? '附件格式不支持' : lang === 'ms' ? 'Format lampiran tidak disokong' : 'Unsupported attachment format',
        description:
          lang === 'zh'
            ? '目前仅支持图片附件。'
            : lang === 'ms'
              ? 'Buat masa ini hanya lampiran imej disokong.'
              : 'Only image attachments are supported right now.',
        variant: 'destructive',
      })
      return
    }

    setAttachmentFiles((prev) => {
      const seen = new Set(
        prev.map((file) => `${file.name}:${file.size}:${file.lastModified}`),
      )
      const next = [...prev]

      incoming.forEach((file) => {
        const key = `${file.name}:${file.size}:${file.lastModified}`
        if (!seen.has(key)) {
          seen.add(key)
          next.push(file)
        }
      })

      return next
    })
  }

  const handleAttachmentPickerClick = () => {
    attachmentInputRef.current?.click()
  }

  const handleMentionToggle = () => {
    const next = !showMentionInput
    setShowMentionInput(next)
    if (next) {
      requestAnimationFrame(() => {
        mentionInputRef.current?.focus()
      })
    }
  }

  const removeAttachment = (file: File) => {
    setAttachmentFiles((prev) =>
      prev.filter(
        (item) =>
          !(
            item.name === file.name &&
            item.size === file.size &&
            item.lastModified === file.lastModified
          ),
      ),
    )
  }

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

      const parsedMentions = mentionInput
        .split(',')
        .map((handle) => handle.trim().replace(/^@+/, ''))
        .filter(Boolean)

      const attachmentUrls: string[] = []
      for (const file of attachmentFiles) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadResult = await uploadImage(formData)
        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || 'Failed to upload attachment.')
        }
        attachmentUrls.push(uploadResult.url)
      }

      const result = await createPost({
        title: title.trim(),
        content: content.trim(),
        category: postType,
        subjectId,
        tags: parsedTags,
        isPrivate,
        attachmentUrls,
        mentionedHandles: parsedMentions,
      })

      if (!result.success || !result.post) {
        toast({
          title: copy.failed,
          description: result.error || copy.retry,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: result.deduped ? copy.duplicate : copy.success,
        description: result.deduped ? copy.duplicateDesc : copy.successDesc,
      })
      setTitle('')
      setContent('')
      setSubjectId('')
      setTags('')
      setPostType('Note')
      setIsPrivate(false)
      setMentionInput('')
      setShowMentionInput(false)
      setAttachmentFiles([])
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
              <div className="mb-4">
                <div className="text-[15px] font-medium text-white">
                  {copy.postTypeLabel}
                </div>
                <div className="text-blue-100/48 mt-1 text-[12px] leading-6">
                  {copy.postTypeHint}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    ['Question', copy.questionType],
                    ['Note', copy.noteType],
                    ['Achievement', copy.achievementType],
                    ['Discussion', copy.discussionType],
                  ] as const
                ).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPostType(type)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      postType === type
                        ? 'bg-sky-400/14 border-sky-400/30 text-sky-100'
                        : 'text-blue-100/58 border-white/10 bg-white/[0.03] hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

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
          </div>

          <div className={fieldCardClassName}>
            <div className="mb-3">
              <div className="text-[15px] font-medium text-white">
                {copy.bodyLabel}
              </div>
              <div className="text-blue-100/48 mt-1 text-[12px] leading-6">
                {copy.bodyHint}
              </div>
            </div>
            <div className="border-white/8 rounded-[24px] border bg-white/[0.03]">
              <div className="border-white/8 flex flex-col gap-3 border-b px-4 py-3 desktop:flex-row desktop:items-center desktop:justify-between">
                <div className="text-blue-100/46 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertMarkdown('# ', '', '标题')}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm hover:bg-white/[0.08]"
                  >
                    H
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertMarkdown('**', '**', '粗体')}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm font-semibold hover:bg-white/[0.08]"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertMarkdown('*', '*', '斜体')}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm italic hover:bg-white/[0.08]"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertMarkdown('> ', '', '引用内容')}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm hover:bg-white/[0.08]"
                  >
                    ⟷
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertMarkdown('- ', '', '列表项')}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm hover:bg-white/[0.08]"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertMarkdown('1. ', '', '列表项')}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm hover:bg-white/[0.08]"
                  >
                    1. List
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertMarkdown('`', '`', '代码')}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm hover:bg-white/[0.08]"
                  >
                    []
                  </button>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertMarkdown('```\n', '\n```', '代码块')}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm hover:bg-white/[0.08]"
                  >
                    &lt;/&gt;
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAttachmentPickerClick}
                    className="h-9 rounded-full border-white/10 bg-white/5 px-4 text-sm text-blue-50 hover:bg-white/10"
                  >
                    {copy.addAttachment}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleMentionToggle}
                    className="h-9 rounded-full border-white/10 bg-white/5 px-4 text-sm text-blue-50 hover:bg-white/10"
                  >
                    {copy.mentionUser}
                  </Button>
                </div>
              </div>
              {showMentionInput ? (
                <div className="border-white/8 border-b px-4 py-3">
                  <div className="mb-2 text-[12px] leading-5 text-blue-100/48">
                    {copy.mentionHint}
                  </div>
                  <input
                    ref={mentionInputRef}
                    value={mentionInput}
                    onChange={(event) => setMentionInput(event.target.value)}
                    placeholder="alice, bob"
                    className="border-white/8 placeholder:text-blue-100/34 h-11 w-full rounded-2xl border bg-white/[0.04] px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                  />
                </div>
              ) : null}
              {attachmentFiles.length > 0 ? (
                <div className="border-white/8 border-b px-4 py-3">
                  <div className="mb-2 text-[12px] leading-5 text-blue-100/48">
                    {copy.attachmentHint}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {attachmentFiles.map((file) => (
                      <span
                        key={`${file.name}:${file.size}:${file.lastModified}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[12px] text-blue-50"
                      >
                        <span className="max-w-[220px] truncate">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(file)}
                          className="text-blue-100/48 hover:text-white"
                          aria-label={`remove ${file.name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              <input
                ref={attachmentInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  handleAttachmentFiles(event.target.files)
                  event.target.value = ''
                }}
              />
              <textarea
                ref={textareaRef}
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
