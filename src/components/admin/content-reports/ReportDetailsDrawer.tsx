'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { format } from 'date-fns'
import {
  BadgeCheck,
  Clock3,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Send,
  X,
} from 'lucide-react'
import { resolveReport } from '@/actions/content-pipeline/question-service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { getReportsI18n, type ReportsLang } from './i18n'
import type { ReportRecord, ReportStatus } from './types'

type ReportTimelineEntry = {
  id: string
  action: string
  actor: string
  time: string
  statusLabel: string
  note: string | null
  icon: React.ElementType
  tone: 'violet' | 'sky' | 'emerald' | 'amber'
}

type ProcessingTemplate = {
  id: string
  label: string
  status: ReportStatus
  content: string
}

interface ReportDetailsDrawerProps {
  isOpen: boolean
  onClose: () => void
  report: ReportRecord | null
  lang: ReportsLang
  reviewerId: string
  reviewerLabel: string
  onRefresh?: () => void
}

const STATUS_META: Record<
  ReportStatus,
  {
    tone: 'warning' | 'info' | 'success' | 'neutral'
    badgeClass: string
    dotClass: string
  }
> = {
  PENDING: {
    tone: 'warning',
    badgeClass: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
    dotClass: 'bg-amber-400',
  },
  REVIEWING: {
    tone: 'info',
    badgeClass: 'border-sky-500/25 bg-sky-500/10 text-sky-300',
    dotClass: 'bg-sky-400',
  },
  RESOLVED: {
    tone: 'success',
    badgeClass: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    dotClass: 'bg-emerald-400',
  },
  REJECTED: {
    tone: 'neutral',
    badgeClass: 'border-slate-500/25 bg-slate-500/10 text-slate-300',
    dotClass: 'bg-slate-400',
  },
}

const PROCESSING_TEMPLATES: Record<ReportsLang, ProcessingTemplate[]> = {
  zh: [
    {
      id: 'triage',
      label: '进入复核',
      status: 'REVIEWING',
      content: '已收到报错，正在复核题目内容与用户描述，待进一步确认。',
    },
    {
      id: 'resolved',
      label: '确认修复',
      status: 'RESOLVED',
      content: '问题已确认并完成处理，后续会继续观察相关题目的反馈变化。',
    },
    {
      id: 'rejected',
      label: '误报驳回',
      status: 'REJECTED',
      content: '经核查题目本身无误，本次报错判定为误报，不纳入修复队列。',
    },
  ],
  en: [
    {
      id: 'triage',
      label: 'Triage',
      status: 'REVIEWING',
      content:
        'We have received this report and are reviewing the issue together with the user description.',
    },
    {
      id: 'resolved',
      label: 'Resolved',
      status: 'RESOLVED',
      content:
        'The issue has been confirmed and handled. We will keep monitoring related feedback.',
    },
    {
      id: 'rejected',
      label: 'Reject as false report',
      status: 'REJECTED',
      content:
        'After review, the question is correct. This report is treated as a false report and will not enter the fix queue.',
    },
  ],
  ms: [
    {
      id: 'triage',
      label: 'Saring',
      status: 'REVIEWING',
      content:
        'Kami telah menerima laporan ini dan sedang menyemak isu bersama penerangan pengguna.',
    },
    {
      id: 'resolved',
      label: 'Selesai',
      status: 'RESOLVED',
      content:
        'Isu telah disahkan dan diselesaikan. Kami akan terus memantau maklum balas berkaitan.',
    },
    {
      id: 'rejected',
      label: 'Tolak sebagai laporan palsu',
      status: 'REJECTED',
      content:
        'Selepas semakan, soalan ini didapati betul. Laporan ini dianggap laporan palsu dan tidak akan dimasukkan ke barisan pembetulan.',
    },
  ],
}

const LOCALE_COPY: Record<
  ReportsLang,
  {
    reportSubmitted: string
    reportProcessing: string
    reportProcessed: string
    reportStatus: string
    reportStatusUpdate: string
    ticketPrefix: string
    processingLocked: string
    processingLockedHint: string
    defaultTimelineNote: string
  }
> = {
  zh: {
    reportSubmitted: '用户提交报错',
    reportProcessing: '处理状态更新',
    reportProcessed: '处理结果已记录',
    reportStatus: '报错状态',
    reportStatusUpdate: '状态更新',
    ticketPrefix: '工单',
    processingLocked: '该报错已进入终态',
    processingLockedHint: 'RESOLVED / REJECTED 状态不再允许重复提交处理结果。',
    defaultTimelineNote: '尚未填写处理说明',
  },
  en: {
    reportSubmitted: 'User submitted a report',
    reportProcessing: 'Status updated',
    reportProcessed: 'Processing result recorded',
    reportStatus: 'Report status',
    reportStatusUpdate: 'Status change',
    ticketPrefix: 'Ticket',
    processingLocked: 'This report is already in a final state',
    processingLockedHint:
      'RESOLVED / REJECTED reports cannot be submitted again.',
    defaultTimelineNote: 'No processing note yet',
  },
  ms: {
    reportSubmitted: 'Pengguna menghantar laporan',
    reportProcessing: 'Status dikemas kini',
    reportProcessed: 'Hasil pemprosesan direkodkan',
    reportStatus: 'Status laporan',
    reportStatusUpdate: 'Kemas kini status',
    ticketPrefix: 'Tiket',
    processingLocked: 'Laporan ini sudah berada dalam status akhir',
    processingLockedHint:
      'Laporan RESOLVED / REJECTED tidak boleh dihantar semula.',
    defaultTimelineNote: 'Tiada nota pemprosesan lagi',
  },
}

function asDate(value: string | Date | null | undefined) {
  if (!value) return null
  return value instanceof Date ? value : new Date(value)
}

function formatDateTime(value: string | Date | null | undefined) {
  const date = asDate(value)
  if (!date) return '—'
  return format(date, 'yyyy-MM-dd HH:mm')
}

function getReporterInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getStatusLabel(status: ReportStatus, text: ReturnType<typeof getReportsI18n>) {
  switch (status) {
    case 'PENDING':
      return text.table.pending
    case 'REVIEWING':
      return text.table.reviewing
    case 'RESOLVED':
      return text.table.resolved
    case 'REJECTED':
      return text.table.rejected
    default:
      return status
  }
}

function getTitle(report: ReportRecord, text: ReturnType<typeof getReportsI18n>) {
  const issueLabel = text.issueType[report.issueType]
  const subject = report.question.subject?.trim()
  return subject ? `${issueLabel} · ${subject}` : issueLabel
}

function getAdminLabel(lang: ReportsLang) {
  if (lang === 'ms') return 'Pentadbir'
  if (lang === 'en') return 'Admin'
  return '管理员'
}

function getTimelineEntries(
  report: ReportRecord,
  lang: ReportsLang,
  text: ReturnType<typeof getReportsI18n>,
  reviewerId: string,
  reviewerLabel: string
): ReportTimelineEntry[] {
  const copy = LOCALE_COPY[lang]
  const reporterActor = report.reporter.name || report.reporter.email
  const reviewerActor =
    report.reviewedBy && report.reviewedBy === reviewerId
      ? reviewerLabel
      : getAdminLabel(lang)
  const processedTime = report.reviewedAt ?? report.createdAt
  const entries: ReportTimelineEntry[] = [
    {
      id: 'submitted',
      action: copy.reportSubmitted,
      actor: reporterActor,
      time: formatDateTime(report.createdAt),
      statusLabel: text.table.pending,
      note: report.description,
      icon: MessageSquareText,
      tone: 'violet',
    },
  ]

  if (report.reviewedAt || report.status !== 'PENDING') {
    entries.push({
      id: 'status-updated',
      action: copy.reportProcessing,
      actor: reviewerActor,
      time: formatDateTime(processedTime),
      statusLabel: getStatusLabel(report.status, text),
      note: `${copy.reportStatusUpdate}：${getStatusLabel(report.status, text)}`,
      icon: Clock3,
      tone: 'sky',
    })
  }

  if (report.resolution) {
    entries.push({
      id: 'processed',
      action: copy.reportProcessed,
      actor: reviewerActor,
      time: formatDateTime(report.reviewedAt ?? report.createdAt),
      statusLabel: getStatusLabel(report.status, text),
      note: report.resolution,
      icon: BadgeCheck,
      tone: 'emerald',
    })
  }

  return entries
}

export function ReportDetailsDrawer({
  isOpen,
  onClose,
  report,
  lang,
  reviewerId,
  reviewerLabel,
  onRefresh,
}: ReportDetailsDrawerProps) {
  const { toast } = useToast()
  const text = getReportsI18n(lang)
  const localeCopy = LOCALE_COPY[lang]
  const templates = PROCESSING_TEMPLATES[lang]

  const [nextStatus, setNextStatus] = useState<ReportStatus>('PENDING')
  const [templateId, setTemplateId] = useState<string>('custom')
  const [resolution, setResolution] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, startRefresh] = useTransition()

  useEffect(() => {
    if (!report) return

    setNextStatus(report.status)
    setResolution(report.resolution || '')
    setTemplateId('custom')
  }, [report?.id, report?.resolution, report?.status])

  const timelineEntries = useMemo(() => {
    if (!report) return []
    return getTimelineEntries(report, lang, text, reviewerId, reviewerLabel)
  }, [lang, report, reviewerId, reviewerLabel, text])

  const isLocked = report?.status === 'RESOLVED' || report?.status === 'REJECTED'

  const handleRefresh = () => {
    startRefresh(() => {
      if (onRefresh) {
        onRefresh()
        return
      }

      window.location.reload()
    })
  }

  const handleTemplateChange = (value: string) => {
    setTemplateId(value)

    if (value === 'custom') return

    const template = templates.find((item) => item.id === value)
    if (!template) return

    setNextStatus(template.status)
    setResolution(template.content)
  }

  const handleSubmit = async () => {
    if (!report) return

    if (isLocked) {
      toast({
        title: localeCopy.processingLocked,
        description: localeCopy.processingLockedHint,
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    const result = await resolveReport({
      reportId: report.id,
      status: nextStatus,
      reviewedBy: reviewerId,
      resolution: resolution.trim() || undefined,
    })

    if (result.success) {
      toast({
        title: '处理已提交',
        description: `${getStatusLabel(nextStatus, text)} 已写入处理结果。`,
      })
      onRefresh?.()
    } else {
      toast({
        title: '提交失败',
        description: result.error || '处理结果提交失败，请稍后重试。',
        variant: 'destructive',
      })
    }

    setIsSubmitting(false)
  }

  if (!isOpen || !report) {
    if (!isOpen) return null

    return (
      <aside className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-full flex-col border-l border-borderTone bg-page shadow-[0_32px_80px_rgba(2,8,23,0.36)] sm:w-[min(92vw,720px)] desktop:w-[min(88vw,860px)]">
        <div className="flex items-start justify-between gap-4 border-b border-borderTone px-5 py-4">
          <div className="space-y-2">
            <Badge
              variant="outline"
              className="border-rose-500/20 bg-rose-500/10 text-rose-200"
            >
              {text.drawer.reportDetails}
            </Badge>
            <h2 className="text-[26px] font-semibold tracking-tight text-text-primary sm:text-[30px]">
              {text.drawer.reportUnavailable}
            </h2>
            <p className="max-w-[44rem] text-sm leading-6 text-text-secondary">
              {text.drawer.reportUnavailableHint}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full border border-borderTone bg-surface text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-6">
          <Card className="w-full max-w-[560px] border-borderTone bg-surface-subtle shadow-surface-sm">
            <div className="space-y-4 px-5 py-5 text-sm text-text-secondary">
              <div className="rounded-2xl border border-dashed border-borderTone bg-surface px-4 py-4">
                {text.drawer.noTimeline}
              </div>
              <div className="rounded-2xl border border-dashed border-borderTone bg-surface px-4 py-4">
                {text.drawer.noWork}
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRefresh}
                  className="h-11 rounded-2xl border-borderTone bg-surface text-text-primary hover:bg-surface-subtle"
                >
                  <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                  {text.drawer.refresh}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </aside>
    )
  }

  const reporterName = report.reporter.name || '匿名用户'
  const reporterRole = report.reporter.role || 'GUEST'
  const title = getTitle(report, text)
  const statusMeta = STATUS_META[report.status]
  const ticketShortId = report.id.slice(0, 8).toUpperCase()

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-full flex-col border-l border-borderTone bg-page shadow-[0_32px_80px_rgba(2,8,23,0.36)] transition-transform duration-300 sm:w-[min(92vw,720px)] desktop:w-[min(88vw,860px)]">
      <div className="flex items-start justify-between gap-4 border-b border-borderTone px-5 py-4">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="border-sky-500/20 bg-sky-500/10 text-sky-300"
            >
              {text.drawer.reportDetails}
            </Badge>
            <Badge className={cn('border font-medium', statusMeta.badgeClass)}>
              {getStatusLabel(report.status, text)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-text-tertiary">
              <span className="truncate">
                {localeCopy.ticketPrefix} / #{ticketShortId}
              </span>
              <span className="text-borderTone">•</span>
              <span className="truncate">{formatDateTime(report.createdAt)}</span>
            </div>
            <h2 className="truncate text-[26px] font-semibold tracking-tight text-text-primary sm:text-[30px]">
              {title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[13px] text-text-secondary">
            <span className="inline-flex items-center gap-2 rounded-full border border-borderTone bg-surface px-3 py-1.5">
              <span className="text-text-tertiary">{text.drawer.reporterInfo}</span>
              <span className="font-medium text-text-primary">
                {reporterName}
              </span>
              <span className="text-text-tertiary">· {report.reporter.email}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-borderTone bg-surface px-3 py-1.5">
              <span className="text-text-tertiary">
                {text.drawer.reporterIdentity}
              </span>
              <span className="font-medium text-text-primary">{reporterRole}</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-borderTone bg-surface px-3 py-1.5">
              <span className="text-text-tertiary">{text.drawer.reportedAt}</span>
              <span className="font-medium text-text-primary">
                {formatDateTime(report.createdAt)}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-10 rounded-full border-borderTone bg-surface px-4 text-text-primary hover:bg-surface-subtle"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            {text.drawer.refresh}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full border border-borderTone bg-surface text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-5">
          <section className="rounded-[28px] border border-borderTone bg-surface-subtle p-4 shadow-surface-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-borderTone bg-surface text-text-secondary"
              >
                {text.drawer.topStatus}
              </Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-borderTone bg-surface px-2.5 py-1 text-xs text-text-secondary">
                <span className="font-medium text-text-primary">
                  {text.drawer.idPrefix}
                </span>
                <span className="font-mono text-text-primary">#{ticketShortId}</span>
                <span className="text-text-tertiary">{report.id}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-borderTone bg-surface px-2.5 py-1 text-xs text-text-secondary">
                <Clock3 className="h-3.5 w-3.5 text-text-tertiary" />
                <span className="font-medium text-text-primary">
                  {formatDateTime(report.createdAt)}
                </span>
              </span>
            </div>
          </section>

          <Card className="border-borderTone bg-surface-subtle shadow-surface-sm">
            <div className="flex items-center justify-between border-b border-borderTone px-4 py-4">
              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  {text.drawer.timelineTitle}
                </h3>
              </div>
              <Badge
                variant="outline"
                className={cn('border font-medium', statusMeta.badgeClass)}
              >
                {getStatusLabel(report.status, text)}
              </Badge>
            </div>

            <div className="space-y-4 px-4 py-4">
              {timelineEntries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-borderTone bg-surface px-4 py-6 text-sm text-text-tertiary">
                  {text.drawer.noTimeline}
                </div>
              ) : (
                timelineEntries.map((entry, index) => {
                  const Icon = entry.icon
                  const isLast = index === timelineEntries.length - 1
                  const toneClass =
                    entry.tone === 'violet'
                      ? 'bg-violet-500/10 text-violet-300'
                      : entry.tone === 'sky'
                        ? 'bg-sky-500/10 text-sky-300'
                        : entry.tone === 'emerald'
                          ? 'bg-emerald-500/10 text-emerald-300'
                          : 'bg-amber-500/10 text-amber-300'

                  return (
                    <div
                      key={entry.id}
                      className="grid grid-cols-[24px_minmax(0,1fr)] gap-4"
                    >
                      <div className="relative flex justify-center">
                        {!isLast ? (
                          <div className="absolute left-1/2 top-6 h-[calc(100%+14px)] w-px -translate-x-1/2 bg-borderTone" />
                        ) : null}
                        <div
                          className={cn(
                            'relative mt-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-borderTone bg-page shadow-[0_0_0_4px_rgba(8,16,29,0.8)]',
                            toneClass
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-borderTone bg-page px-4 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[15px] font-semibold leading-6 text-text-primary">
                              {entry.action}
                            </p>
                            <span className="text-[13px] text-text-tertiary">
                              {entry.actor}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full border border-borderTone bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                              {entry.statusLabel}
                            </span>
                            <span className="text-[13px] text-text-tertiary">
                              {entry.time}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 rounded-xl border border-borderTone/80 bg-surface px-3 py-3 text-[14px] leading-6 text-text-primary">
                          {entry.note || localeCopy.defaultTimelineNote}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>

          <Card className="border-borderTone bg-surface-subtle shadow-surface-sm">
            <div className="flex items-center justify-between border-b border-borderTone px-4 py-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-text-primary">
                  {text.drawer.workbenchTitle}
                </h3>
                {isLocked ? (
                  <Badge
                    variant="outline"
                    className="border-slate-500/25 bg-slate-500/10 text-slate-300"
                  >
                    {localeCopy.processingLocked}
                  </Badge>
                ) : null}
              </div>
              <Badge variant="outline" className="border-borderTone text-text-secondary">
                {text.drawer.currentStatus} / {getStatusLabel(report.status, text)}
              </Badge>
            </div>

            <div className="space-y-4 px-4 py-4">
              <div className="grid gap-4 desktop:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-tertiary">
                    {text.drawer.currentStatusLabel}
                  </label>
                  <Select
                    value={nextStatus}
                    onValueChange={(value) => setNextStatus(value as ReportStatus)}
                    disabled={isLocked}
                  >
                    <SelectTrigger className="h-11 rounded-2xl border-borderTone bg-surface text-text-primary">
                      <SelectValue placeholder={text.drawer.nextStatusPlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="border-borderTone bg-surface text-text-primary">
                      <SelectItem value="PENDING">
                        {text.table.pending}
                      </SelectItem>
                      <SelectItem value="REVIEWING">
                        {text.table.reviewing}
                      </SelectItem>
                      <SelectItem value="RESOLVED">
                        {text.table.resolved}
                      </SelectItem>
                      <SelectItem value="REJECTED">
                        {text.table.rejected}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-tertiary">
                    {text.drawer.templateLabel}
                  </label>
                  <Select
                    value={templateId}
                    onValueChange={handleTemplateChange}
                    disabled={isLocked}
                  >
                    <SelectTrigger className="h-11 rounded-2xl border-borderTone bg-surface text-text-primary">
                      <SelectValue placeholder={text.drawer.templatePlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="border-borderTone bg-surface text-text-primary">
                      <SelectItem value="custom">{text.drawer.templatePlaceholder}</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-text-tertiary">
                  {text.drawer.resolutionLabel}
                </label>
                <Textarea
                  value={resolution}
                  onChange={(event) => setResolution(event.target.value)}
                  placeholder={text.drawer.resolutionPlaceholder}
                  className="min-h-[220px] rounded-[24px] border-borderTone bg-surface px-4 py-4 text-[14px] leading-7 text-text-primary placeholder:text-text-tertiary"
                  disabled={isLocked}
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-borderTone pt-4">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="h-12 rounded-2xl bg-primary px-5 text-white hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {text.drawer.submitResolution}
                </Button>
              </div>

              {isLocked ? (
                <div className="rounded-2xl border border-dashed border-borderTone bg-surface px-4 py-3 text-sm text-text-secondary">
                  {localeCopy.processingLockedHint}
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </aside>
  )
}
