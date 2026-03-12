'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Search,
  Siren,
} from 'lucide-react'
import { useApp } from '@/providers'
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
import { ReportDetailsDrawer } from './ReportDetailsDrawer'
import { ReportsTable } from './ReportsTable'
import { MOCK_REPORTS } from './constants'
import { getReportsI18n } from './i18n'
import { IssueType, Report, ReportStatus } from './types'

type RangeKey = '7d' | '30d' | 'all'
type StatusFilter = 'ALL' | ReportStatus
type IssueFilter = 'ALL' | IssueType

function parseReportAgeHours(timestamp: string): number {
  const normalized = timestamp.trim().toLowerCase()
  const value = Number.parseInt(normalized, 10)

  if (normalized.includes('min')) {
    return Number.isFinite(value) ? value / 60 : Number.POSITIVE_INFINITY
  }
  if (normalized.includes('hour')) {
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY
  }
  if (normalized.includes('day')) {
    return Number.isFinite(value) ? value * 24 : Number.POSITIVE_INFINITY
  }

  return Number.POSITIVE_INFINITY
}

export const ReportsClient: React.FC = () => {
  const { lang } = useApp()
  const text = getReportsI18n(lang)

  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<RangeKey>('7d')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [issueFilter, setIssueFilter] = useState<IssueFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!isDrawerOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen])

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report)
    setIsDrawerOpen(true)
  }

  const reportsInRange = useMemo(() => {
    if (timeRange === 'all') return MOCK_REPORTS

    const maxHours = timeRange === '30d' ? 30 * 24 : 7 * 24
    return MOCK_REPORTS.filter(
      (report) => parseReportAgeHours(report.timestamp) <= maxHours
    )
  }, [timeRange])

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return reportsInRange.filter((report) => {
      const matchesStatus =
        statusFilter === 'ALL' ? true : report.status === statusFilter
      const matchesIssue =
        issueFilter === 'ALL' ? true : report.issueType === issueFilter
      const matchesQuery =
        query.length === 0
          ? true
          : [
              report.id,
              report.user.name,
              report.question.id,
              report.question.subject,
              report.question.text,
              report.comment || '',
            ]
              .join(' ')
              .toLowerCase()
              .includes(query)

      return matchesStatus && matchesIssue && matchesQuery
    })
  }, [issueFilter, reportsInRange, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const openQueue = reportsInRange.filter(
      (report) => report.status !== ReportStatus.RESOLVED
    ).length
    const resolvedReports = reportsInRange.filter(
      (report) => report.status === ReportStatus.RESOLVED
    )
    const answerWrongCount = reportsInRange.filter(
      (report) => report.issueType === IssueType.ANSWER_WRONG
    ).length
    const avgResolutionTime =
      resolvedReports.length > 0
        ? resolvedReports.reduce(
            (sum, report) => sum + parseReportAgeHours(report.timestamp),
            0
          ) / resolvedReports.length
        : 0

    return {
      openQueue,
      resolvedCount: resolvedReports.length,
      avgResolutionTime,
      answerWrongCount,
    }
  }, [reportsInRange])

  const rangeLabel =
    timeRange === '30d'
      ? text.header.range30d
      : timeRange === 'all'
        ? text.header.rangeAll
        : text.header.range7d

  const statCards = [
    {
      key: 'open',
      title: text.stats.openQueue,
      value: String(stats.openQueue),
      caption: rangeLabel,
      meta: text.stats.openQueueHint,
      icon: Clock3,
      iconClassName: 'text-[#FBBF24]',
      iconBgClassName: 'bg-[#3B2A10]',
      glowClassName: 'bg-[#F59E0B]/20',
      borderClassName: 'border-[#5C4520]',
    },
    {
      key: 'resolved',
      title: text.stats.resolvedInRange,
      value: String(stats.resolvedCount),
      caption: rangeLabel,
      meta: text.stats.resolvedInRangeHint,
      icon: CheckCircle2,
      iconClassName: 'text-[#4ADE80]',
      iconBgClassName: 'bg-[#123125]',
      glowClassName: 'bg-[#22C55E]/20',
      borderClassName: 'border-[#244B37]',
    },
    {
      key: 'avg',
      title: text.stats.avgResolutionTime,
      value: `${stats.avgResolutionTime.toFixed(1)}${text.stats.hours}`,
      caption: rangeLabel,
      meta: text.stats.avgResolutionHint,
      icon: AlertCircle,
      iconClassName: 'text-[#60A5FA]',
      iconBgClassName: 'bg-[#18335E]',
      glowClassName: 'bg-[#2563EB]/20',
      borderClassName: 'border-[#2B4470]',
    },
    {
      key: 'answer',
      title: text.stats.answerWrong,
      value: String(stats.answerWrongCount),
      caption: rangeLabel,
      meta: text.stats.answerWrongHint,
      icon: Siren,
      iconClassName: 'text-[#C4B5FD]',
      iconBgClassName: 'bg-[#2A1F4A]',
      glowClassName: 'bg-[#8B5CF6]/20',
      borderClassName: 'border-[#47306C]',
    },
  ] as const

  const statusTabs: Array<{ key: StatusFilter; label: string }> = [
    { key: 'ALL', label: '全部' },
    { key: ReportStatus.PENDING, label: text.table.pending },
    { key: ReportStatus.IN_REVIEW, label: text.table.inReview },
    { key: ReportStatus.RESOLVED, label: text.table.resolved },
  ]

  return (
    <div className="px-3 py-2 sm:px-4 sm:py-3">
      <div className="mx-auto w-full max-w-[1820px] space-y-3 rounded-[32px] border border-[#24324D] bg-[#0B1220] p-2.5 text-[#E6EDF7] sm:p-3">
        <section className="relative overflow-hidden rounded-[28px] border border-[#24324D] bg-[linear-gradient(135deg,#111A2E_0%,#0F1A2F_55%,#0B1220_100%)] px-4 py-4 shadow-[0_22px_50px_rgba(2,8,23,0.35)] sm:px-5">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2563EB]/10 blur-3xl" />
          <div className="absolute bottom-0 left-16 h-24 w-24 rounded-full bg-[#22C55E]/10 blur-3xl" />

          <div className="relative flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#E6EDF7] sm:text-[30px]">
                {text.header.title}
              </h1>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#274066] bg-[#10203C] px-2.5 py-1 text-[11px] font-medium text-[#D6E7FF]">
                <ClipboardCheck className="h-3 w-3 text-[#60A5FA]" />
                {text.header.badge}
              </div>
            </div>
            <p className="max-w-3xl text-sm text-[#B2C3DA]">
              {text.header.description}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#E6EDF7]">报错概览</h2>
              <p className="text-sm text-[#8FA4C2]">
                按时间范围查看待处理队列、关闭效率和高影响问题类型。
              </p>
            </div>

            <div className="inline-flex items-center rounded-2xl border border-[#24324D] bg-[#121C32] p-1">
              {[
                { key: '7d', label: text.header.range7d },
                { key: '30d', label: text.header.range30d },
                { key: 'all', label: text.header.rangeAll },
              ].map((range) => {
                const isActive = timeRange === range.key
                return (
                  <button
                    key={range.key}
                    type="button"
                    onClick={() => setTimeRange(range.key as RangeKey)}
                    className={`rounded-xl px-5 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                        : 'text-[#8FA4C2] hover:text-white'
                    }`}
                  >
                    {range.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.key}
                  className={`relative overflow-hidden rounded-[24px] border bg-[linear-gradient(180deg,rgba(17,26,46,0.98),rgba(11,18,32,0.96))] p-4 shadow-[0_18px_40px_rgba(2,8,23,0.38)] ${card.borderClassName}`}
                >
                  <div
                    className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${card.glowClassName}`}
                  />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70" />

                  <div className="relative flex h-full items-start justify-between gap-4">
                    <div className="flex min-h-[120px] flex-1 flex-col justify-between gap-3">
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA3C0]">
                          {card.title}
                        </p>
                        <div className="flex items-end gap-2">
                          <p className="text-[2rem] font-semibold leading-none tracking-tight text-[#F8FBFF]">
                            {card.value}
                          </p>
                          <span className="pb-1 text-[11px] text-[#8EA3C0]">
                            {card.caption}
                          </span>
                        </div>
                      </div>
                      <p className="line-clamp-2 max-w-[20rem] text-sm leading-6 text-[#B2C3DA]">
                        {card.meta}
                      </p>
                    </div>

                    <div
                      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 ${card.iconBgClassName}`}
                    >
                      <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <Card className="bg-[#0F172A]/96 overflow-hidden rounded-[28px] border border-[#24324D] shadow-[0_18px_40px_rgba(2,8,23,0.24)]">
          <CardHeader className="border-b border-[#1B2840] bg-[#0F1A2F] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-[#F4F7FB]">
                  {text.filters.queueTitle}
                </CardTitle>
                <CardDescription className="text-sm text-[#8FA4C2]">
                  {text.filters.queueDescription}
                </CardDescription>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full xl:max-w-[460px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6F84A2]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={text.filters.searchPlaceholder}
                    className="h-11 w-full rounded-2xl border border-[#24324D] bg-[#121C32] pl-10 pr-4 text-sm text-[#E6EDF7] placeholder:text-[#6F84A2] focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:ring-offset-2 focus:ring-offset-[#0F172A]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                  <Select
                    value={issueFilter}
                    onValueChange={(value) =>
                      setIssueFilter(value as IssueFilter)
                    }
                  >
                    <SelectTrigger className="w-[200px] rounded-2xl border-[#24324D] bg-[#151F36] text-[#E6EDF7] hover:bg-[#1A2744] focus:ring-[#60A5FA] focus:ring-offset-[#0F172A] data-[placeholder]:text-[#8FA4C2]">
                      <SelectValue placeholder={text.filters.issueLabel} />
                    </SelectTrigger>
                    <SelectContent className="border-[#24324D] bg-[#151F36] text-[#E6EDF7]">
                      <SelectItem value="ALL">
                        {text.filters.issueAll}
                      </SelectItem>
                      <SelectItem value={IssueType.ANSWER_WRONG}>
                        {text.issueType.ANSWER_WRONG}
                      </SelectItem>
                      <SelectItem value={IssueType.TYPO_ERROR}>
                        {text.issueType.TYPO_ERROR}
                      </SelectItem>
                      <SelectItem value={IssueType.IMAGE_MISSING}>
                        {text.issueType.IMAGE_MISSING}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-[#24324D] bg-[#121C32] p-1">
                    {statusTabs.map((tab) => {
                      const isActive = statusFilter === tab.key
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setStatusFilter(tab.key)}
                          className={`rounded-xl px-3 py-1.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-[#1E2C47] text-white shadow-[inset_0_0_0_1px_rgba(96,165,250,0.2)]'
                              : 'text-[#8FA4C2] hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5">
            <ReportsTable
              reports={filteredReports}
              totalCount={reportsInRange.length}
              onSelectReport={handleSelectReport}
            />
          </CardContent>
        </Card>
      </div>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <ReportDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        report={selectedReport}
      />
    </div>
  )
}
