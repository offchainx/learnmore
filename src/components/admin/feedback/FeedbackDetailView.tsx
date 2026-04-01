'use client'

import React, { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  StickyNote,
} from 'lucide-react'
import { replyToFeedback, updateFeedbackStatus } from '@/actions/support/ticket'
import { FeedbackStatus } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

export type FeedbackTimelineEvent = {
  id: string
  eventType: 'SUBMITTED' | 'STATUS_CHANGED' | 'REPLIED' | 'CLOSED'
  fromStatus: FeedbackStatus | null
  toStatus: FeedbackStatus | null
  message: string | null
  createdAt: string | Date
  actor?: {
    username?: string | null
    email?: string | null
    role?: string | null
  } | null
}

export type FeedbackDetailData = {
  id: string
  title: string
  content: string
  email: string | null
  category: string
  status: FeedbackStatus
  sourceType?: string | null
  sourcePath?: string | null
  attachments: string[]
  adminReply?: string | null
  createdAt: string | Date
  updatedAt: string | Date
  repliedAt?: string | Date | null
  userId?: string | null
  user?: {
    username?: string | null
    email?: string | null
    avatar?: string | null
    role?: string | null
  } | null
  responder?: {
    username?: string | null
    email?: string | null
    role?: string | null
  } | null
  events: FeedbackTimelineEvent[]
}

type ComposerMode = 'PUBLIC_REPLY' | 'INTERNAL_NOTE'

type TemplateOption = {
  id: string
  label: string
  mode: ComposerMode
  content: string
}

const statusMeta: Record<
  FeedbackStatus,
  {
    label: string
    badgeClass: string
    dotClass: string
    description: string
  }
> = {
  PENDING: {
    label: '待处理',
    badgeClass:
      'border-amber-500/25 bg-amber-500/10 text-amber-300 dark:text-amber-300',
    dotClass: 'bg-amber-400',
    description: '等待管理员开始处理',
  },
  IN_PROGRESS: {
    label: '处理中',
    badgeClass:
      'border-sky-500/25 bg-sky-500/10 text-sky-300 dark:text-sky-300',
    dotClass: 'bg-sky-400',
    description: '已进入处理流程',
  },
  RESOLVED: {
    label: '已解决',
    badgeClass:
      'border-emerald-500/25 bg-emerald-500/10 text-emerald-300 dark:text-emerald-300',
    dotClass: 'bg-emerald-400',
    description: '问题已处理完成',
  },
  REJECTED: {
    label: '已拒绝',
    badgeClass:
      'border-rose-500/25 bg-rose-500/10 text-rose-300 dark:text-rose-300',
    dotClass: 'bg-rose-400',
    description: '反馈已被驳回',
  },
  CLOSED: {
    label: '已关闭',
    badgeClass:
      'border-slate-500/25 bg-slate-500/10 text-slate-300 dark:text-slate-300',
    dotClass: 'bg-slate-400',
    description: '工单已关闭归档',
  },
}

const templates: TemplateOption[] = [
  {
    id: 'public-investigating',
    label: 'Public · Investigating',
    mode: 'PUBLIC_REPLY',
    content:
      'Thanks for reporting this. We have started reviewing the issue and will update you once the investigation is complete.',
  },
  {
    id: 'public-resolved',
    label: 'Public · Resolved',
    mode: 'PUBLIC_REPLY',
    content:
      'Thanks for your patience. We have completed the review and applied the required follow-up on our side. Please let us know if you still see the issue.',
  },
  {
    id: 'internal-triage',
    label: 'Internal · Triage Note',
    mode: 'INTERNAL_NOTE',
    content:
      'Initial triage completed. Need owner confirmation, impact verification, and next release window alignment.',
  },
  {
    id: 'internal-followup',
    label: 'Internal · Follow-up',
    mode: 'INTERNAL_NOTE',
    content:
      'Waiting for cross-team confirmation before closing. Keep monitoring related reports and user follow-up signals.',
  },
]

function asDate(value: string | Date | null | undefined) {
  if (!value) {
    return null
  }

  return value instanceof Date ? value : new Date(value)
}

function formatDateTime(value: string | Date | null | undefined) {
  const date = asDate(value)
  if (!date) return 'N/A'
  return format(date, 'yyyy-MM-dd HH:mm')
}

function getEventTitle(event: FeedbackTimelineEvent) {
  switch (event.eventType) {
    case 'SUBMITTED':
      return '用户提交反馈'
    case 'STATUS_CHANGED':
      return event.fromStatus && event.toStatus
        ? `状态变更：${statusMeta[event.fromStatus].label} -> ${statusMeta[event.toStatus].label}`
        : '状态已更新'
    case 'REPLIED':
      if (event.fromStatus && event.toStatus && event.fromStatus !== event.toStatus) {
        return `已回复并更新为${statusMeta[event.toStatus].label}`
      }
      return '已发送回复'
    case 'CLOSED':
      return event.fromStatus && event.toStatus
        ? `已关闭：${statusMeta[event.fromStatus].label} -> ${statusMeta[event.toStatus].label}`
        : '已关闭工单'
    default:
      return '反馈事件'
  }
}

function getEventAccent(event: FeedbackTimelineEvent) {
  switch (event.eventType) {
    case 'SUBMITTED':
      return 'border-violet-500/30 bg-violet-500/10 text-violet-200'
    case 'STATUS_CHANGED':
      return 'border-sky-500/30 bg-sky-500/10 text-sky-200'
    case 'REPLIED':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
    case 'CLOSED':
      return 'border-slate-500/30 bg-slate-500/10 text-slate-200'
    default:
      return 'border-borderTone bg-surface-subtle text-text-primary'
  }
}

function getActorLabel(event: FeedbackTimelineEvent, data: FeedbackDetailData) {
  if (event.actor?.username) return event.actor.username
  if (event.actor?.email) return event.actor.email
  if (event.eventType === 'SUBMITTED') {
    return data.user?.username || data.email || '匿名用户'
  }
  return '系统管理员'
}

function getComposerCopy(mode: ComposerMode) {
  if (mode === 'INTERNAL_NOTE') {
    return {
      label: 'Internal Note',
      placeholder: 'Type an internal note (only visible to admins)...',
      buttonLabel: 'Add Note',
      helper: '内部备注仅用于管理员协作，但仍会按本轮约定携带 Next Status 并推进工单状态。',
    }
  }

  return {
    label: 'Public Reply',
    placeholder: 'Type a public reply...',
    buttonLabel: 'Send Reply',
    helper: '公开回复会用于通知用户，并按当前选择的 Next Status 同步更新工单状态。',
  }
}

export function FeedbackDetailView({
  initialData,
  embedded = false,
  onRefresh,
  onAfterSubmit,
}: {
  initialData: FeedbackDetailData
  embedded?: boolean
  onRefresh?: () => void
  onAfterSubmit?: () => void
}) {
  const [reply, setReply] = useState('')
  const [status, setStatus] = useState<FeedbackStatus>(initialData.status)
  const [mode, setMode] = useState<ComposerMode>('PUBLIC_REPLY')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('none')
  const [isReplying, setIsReplying] = useState(false)
  const [isRefreshing, startRefresh] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setStatus(initialData.status)
    setReply('')
    setSelectedTemplateId('none')
  }, [initialData.id, initialData.status])

  const currentStatusMeta = statusMeta[initialData.status]
  const composerCopy = getComposerCopy(mode)
  const submitterName =
    initialData.user?.username || initialData.email || '匿名用户'
  const submitterEmail =
    initialData.user?.email || initialData.email || '未提供邮箱'
  const submitterRole = initialData.user?.role || 'GUEST'
  const sourceLabel = initialData.sourceType?.trim() || '未记录'
  const sourcePath = initialData.sourcePath?.trim() || ''
  const ticketShortId = initialData.id.slice(0, 8).toUpperCase()

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
      return
    }

    startRefresh(() => {
      router.refresh()
    })
  }

  const handleReply = async () => {
    if (!reply.trim()) {
      toast({
        title: `${composerCopy.label} 内容不能为空`,
        description:
          mode === 'INTERNAL_NOTE'
            ? '请输入要记录给管理员团队的内部备注。'
            : '请输入要发送给用户的回复内容。',
        variant: 'destructive',
      })
      return
    }

    setIsReplying(true)

    const result =
      mode === 'INTERNAL_NOTE'
        ? await updateFeedbackStatus(initialData.id, status, reply)
        : await replyToFeedback(initialData.id, reply, status)

    if (result.success) {
      toast({
        title: mode === 'INTERNAL_NOTE' ? '内部备注已记录' : '回复已发送',
        description:
          mode === 'INTERNAL_NOTE'
            ? `内部备注已写入时间线，工单状态同步更新为“${statusMeta[status].label}”。`
            : `用户将收到回复，工单状态同步更新为“${statusMeta[status].label}”。`,
      })
      setReply('')
      setSelectedTemplateId('none')
      onAfterSubmit?.()
      handleRefresh()
    } else {
      toast({
        title: mode === 'INTERNAL_NOTE' ? '记录失败' : '发送失败',
        description:
          (result.error as string) ||
          (mode === 'INTERNAL_NOTE'
            ? '内部备注写入过程中出现错误。'
            : '回复发送过程中出现错误。'),
        variant: 'destructive',
      })
    }

    setIsReplying(false)
  }

  const applyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)

    if (templateId === 'none') {
      return
    }

    const template = templates.find((item) => item.id === templateId)
    if (!template) return

    setMode(template.mode)
    setReply(template.content)
  }

  return (
    <div className={embedded ? 'w-full space-y-4' : 'mx-auto max-w-5xl space-y-5'}>
      <section className="rounded-[26px] border border-[#24324D] bg-[#0F172A]/80 px-5 py-5 shadow-[0_14px_36px_rgba(2,8,23,0.24)] sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#274066] bg-[#10203C] px-3 py-1 text-xs font-medium text-[#D6E7FF]">
                <Sparkles className="h-3.5 w-3.5 text-[#60A5FA]" />
                反馈处理
              </div>
              <Badge className={`${currentStatusMeta.badgeClass} border font-medium`}>
                {currentStatusMeta.label}
              </Badge>
              <Badge
                variant="secondary"
                className="border-[#24324D] bg-[#151F36] text-[#C8D4E7]"
              >
                {initialData.category}
              </Badge>
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#7F94B3]">
                <span className="truncate">Feedback / #{ticketShortId}</span>
                <span className="text-[#31415F]">•</span>
                <span className="truncate">{formatDateTime(initialData.createdAt)}</span>
              </div>
              <h1 className="truncate text-[26px] font-semibold tracking-tight text-[#E6EDF7] sm:text-[30px]">
                {initialData.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-10 rounded-full border-[#24324D] bg-[#151F36] px-4 text-[#E6EDF7] hover:bg-[#1A2744] hover:text-[#E6EDF7]"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              刷新
            </Button>
            {!embedded ? (
              <Link
                href="/admin/feedback"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[#24324D] bg-[#151F36] px-4 text-sm text-[#E6EDF7] transition-colors hover:bg-[#1A2744]"
              >
                <ArrowLeft className="h-4 w-4" />
                返回列表
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#24324D] pt-4 text-[13px] text-[#8FA4C2]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#24324D] bg-[#101A30] px-3 py-1.5">
            <span className="font-mono text-[#D6E7FF]">{`#${ticketShortId}`}</span>
            <span className="text-[#556B8A]">{initialData.id}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#24324D] bg-[#101A30] px-3 py-1.5">
            <span className="text-[#556B8A]">提交者</span>
            <span className="font-medium text-[#E6EDF7]">{submitterName}</span>
            <span className="text-[#556B8A]">· {submitterEmail}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#24324D] bg-[#101A30] px-3 py-1.5">
            <span className="text-[#556B8A]">身份</span>
            <span className="font-medium text-[#E6EDF7]">{submitterRole}</span>
          </span>
        </div>

        {(initialData.sourceType || initialData.sourcePath) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-[#24324D] bg-[#0B1220] px-4 py-3 text-xs text-[#8FA4C2]">
            <span className="inline-flex items-center rounded-full border border-[#24324D] bg-[#101A30] px-2.5 py-1 font-medium text-[#D6E7FF]">
              来源
            </span>
            <span className="font-medium text-[#E6EDF7]">{sourceLabel}</span>
            {sourcePath ? (
              <span className="text-[#556B8A]">· {sourcePath}</span>
            ) : null}
          </div>
        )}
      </section>

      <Card className="border-borderTone bg-surface-subtle dark:border-slate-800 dark:bg-slate-900/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-text-primary dark:text-white">
            <AlertCircle className="h-5 w-5 text-violet-400" />
            处理时间线
          </CardTitle>
          <CardDescription className="text-sm text-text-tertiary dark:text-slate-400">
            记录每一次状态变化、回复与关闭动作，避免只保留当前态。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialData.events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-borderTone bg-surface px-4 py-6 text-sm text-text-tertiary dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-400">
              暂无处理历史，发送回复后会自动写入时间线。
            </div>
          ) : (
            <div className="space-y-3">
              {initialData.events.map((event, index) => {
                const accent = getEventAccent(event)
                const timelineDotClass = accent.includes('violet')
                  ? 'bg-violet-400'
                  : accent.includes('sky')
                    ? 'bg-sky-400'
                    : accent.includes('emerald')
                      ? 'bg-emerald-400'
                      : 'bg-slate-400'
                const transitionLabel =
                  event.fromStatus && event.toStatus
                    ? `${statusMeta[event.fromStatus].label} → ${statusMeta[event.toStatus].label}`
                    : event.toStatus
                      ? statusMeta[event.toStatus].label
                      : null

                return (
                  <div key={event.id} className="grid grid-cols-[22px_minmax(0,1fr)] gap-4">
                    <div className="relative flex justify-center">
                      {index < initialData.events.length - 1 ? (
                        <div className="absolute left-1/2 top-5 h-[calc(100%+12px)] w-px -translate-x-1/2 bg-borderTone dark:bg-slate-800" />
                      ) : null}
                      <div className="relative mt-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-[#24324D] bg-[#0B1220] shadow-[0_0_0_4px_rgba(8,16,29,0.8)]">
                        <div className={`h-2.5 w-2.5 rounded-full ${timelineDotClass}`} />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#24324D] bg-[#0F172A]/80 px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[15px] font-semibold leading-6 text-[#E6EDF7]">
                            {getEventTitle(event)}
                          </p>
                          <span className="text-[13px] text-[#6F86A8]">
                            {getActorLabel(event, initialData)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {transitionLabel ? (
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-black/10 px-2.5 py-1 text-[11px] font-medium text-white/80">
                              {transitionLabel}
                            </span>
                          ) : null}
                          <span className="text-[13px] text-[#6F86A8]">
                            {formatDateTime(event.createdAt)}
                          </span>
                        </div>
                      </div>

                      {event.message ? (
                        <div className="mt-3 rounded-xl border border-white/10 bg-black/10 px-3 py-3 text-[14px] leading-6 text-[#DCE7F5]">
                          {event.message}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-borderTone bg-surface-subtle dark:border-slate-800 dark:bg-slate-900/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-text-primary dark:text-white">
            {mode === 'INTERNAL_NOTE' ? (
              <StickyNote className="h-5 w-5 text-amber-400" />
            ) : (
              <Send className="h-5 w-5 text-sky-400" />
            )}
            处理工作台
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-[24px] border border-[#24324D] bg-[#0B1220] px-4 py-4 shadow-[0_12px_30px_rgba(2,8,23,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[#6F86A8]">
                Composer Mode
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[#24324D] bg-[#101A30] px-2.5 py-1 text-[11px] text-[#8FA4C2]">
                  ⌘ Enter
                </span>
                <Button
                  onClick={handleReply}
                  disabled={isReplying}
                  className="h-11 rounded-2xl bg-blue-600 px-5 text-white hover:bg-blue-500"
                >
                  {isReplying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : mode === 'INTERNAL_NOTE' ? (
                    <StickyNote className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {composerCopy.buttonLabel}
                </Button>
              </div>
            </div>

            <Textarea
              placeholder={composerCopy.placeholder}
              className="mt-4 min-h-[320px] border-0 bg-transparent p-0 text-[14px] leading-7 text-[#E6EDF7] placeholder:text-[#6F86A8] focus-visible:ring-0"
              value={reply}
              onChange={(event) => setReply(event.target.value)}
            />

            <div className="mt-4 border-t border-[#24324D] pt-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="inline-flex rounded-2xl border border-[#24324D] bg-[#101A30] p-1">
                  {([
                    ['PUBLIC_REPLY', 'Public Reply'],
                    ['INTERNAL_NOTE', 'Internal Note'],
                  ] as const).map(([value, label]) => {
                    const active = mode === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMode(value)}
                        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                          active
                            ? 'bg-[#2D5BFF] text-white shadow-[0_10px_25px_rgba(37,99,235,0.24)]'
                            : 'text-[#7F94B3] hover:text-[#E6EDF7]'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6F86A8]">
                      NEXT STATUS:
                    </span>
                    <Select
                      value={status}
                      onValueChange={(value: FeedbackStatus) => setStatus(value)}
                    >
                      <SelectTrigger className="h-10 min-w-[130px] rounded-xl border-[#24324D] bg-[#101A30] text-[#E6EDF7]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-[#24324D] bg-[#0B1220] text-[#E6EDF7]">
                        <SelectItem value="PENDING">待处理</SelectItem>
                        <SelectItem value="IN_PROGRESS">处理中</SelectItem>
                        <SelectItem value="RESOLVED">已解决</SelectItem>
                        <SelectItem value="REJECTED">已拒绝</SelectItem>
                        <SelectItem value="CLOSED">已关闭</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="h-8 w-px bg-[#24324D]" />

                  <Select value={selectedTemplateId} onValueChange={applyTemplate}>
                    <SelectTrigger className="h-10 min-w-[140px] rounded-xl border-[#24324D] bg-[#101A30] text-[#E6EDF7]">
                      <SelectValue placeholder="Templates" />
                    </SelectTrigger>
                    <SelectContent className="border-[#24324D] bg-[#0B1220] text-[#E6EDF7]">
                      <SelectItem value="none">不使用模版</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
