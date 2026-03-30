'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock3, Search, Siren } from 'lucide-react'
import { useApp } from '@/providers'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { PageHeroTitle } from '@/components/shared/PageHeroTitle'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import {
  pageKpiCardClass,
  pageSectionHeaderBandClass,
  pageSegmentedButtonCompactClass,
  pageSegmentedControlCompactClass,
  pageTableShellClass,
} from '@/components/shared/pageSurfaces'
import {
  pageHeroNumericValueClass,
  pageKickerClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'
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
      iconClassName: 'text-[hsl(var(--state-warning-fg))]',
      iconBgClassName: 'bg-[hsl(var(--state-warning-bg))]',
      glowClassName: 'bg-[hsl(var(--state-warning-fg))]/20',
      borderClassName: 'border-borderTone',
    },
    {
      key: 'resolved',
      title: text.stats.resolvedInRange,
      value: String(stats.resolvedCount),
      caption: rangeLabel,
      meta: text.stats.resolvedInRangeHint,
      icon: CheckCircle2,
      iconClassName: 'text-[hsl(var(--state-success-fg))]',
      iconBgClassName: 'bg-[hsl(var(--state-success-bg))]',
      glowClassName: 'bg-[hsl(var(--state-success-fg))]/20',
      borderClassName: 'border-borderTone',
    },
    {
      key: 'avg',
      title: text.stats.avgResolutionTime,
      value: `${stats.avgResolutionTime.toFixed(1)}${text.stats.hours}`,
      caption: rangeLabel,
      meta: text.stats.avgResolutionHint,
      icon: AlertCircle,
      iconClassName: 'text-[hsl(var(--state-info-fg))]',
      iconBgClassName: 'bg-[hsl(var(--state-info-bg))]',
      glowClassName: 'bg-[hsl(var(--state-info-fg))]/20',
      borderClassName: 'border-borderTone',
    },
    {
      key: 'answer',
      title: text.stats.answerWrong,
      value: String(stats.answerWrongCount),
      caption: rangeLabel,
      meta: text.stats.answerWrongHint,
      icon: Siren,
      iconClassName: 'text-[hsl(var(--text-secondary))]',
      iconBgClassName: 'bg-surface-subtle',
      glowClassName: 'bg-[hsl(var(--focus-ring))]/16',
      borderClassName: 'border-borderTone',
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
      <div className="mx-auto w-full max-w-[1820px] space-y-3 rounded-[32px] border border-borderTone bg-page p-2.5 text-text-primary shadow-surface-lg sm:p-3">
        <PageHeroShell
          className="sm:py-4.5 px-4 py-4 sm:px-5"
          title={
            <PageHeroTitle
              title={text.header.title}
              capsuleLabel={text.header.badge}
            />
          }
          subtitle={text.header.description}
          titleClassName="font-semibold"
        />

        <section className="space-y-3">
          <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
            <SectionBlockHeader
              title="报错概览"
              description="按时间范围查看待处理队列、关闭效率和高影响问题类型。"
              className="flex-1"
            />

            <div className={pageSegmentedControlCompactClass}>
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
                    className={`${pageSegmentedButtonCompactClass} ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {range.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.key}
                  className={`${pageKpiCardClass} ${card.borderClassName}`}
                >
                  <div
                    className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${card.glowClassName}`}
                  />
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--border-strong))]/70 to-transparent opacity-70" />

                  <div className="relative flex h-full items-start justify-between gap-4">
                    <div className="flex min-h-[120px] flex-1 flex-col justify-between gap-3">
                      <div className="space-y-1.5">
                        <p className={pageKickerClass}>{card.title}</p>
                        <div className="flex items-end gap-2">
                          <p className={pageHeroNumericValueClass}>
                            {card.value}
                          </p>
                          <span className={`pb-1 ${pageMetaTextClass}`}>
                            {card.caption}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`line-clamp-2 max-w-[20rem] ${pageMetaTextClass}`}
                      >
                        {card.meta}
                      </p>
                    </div>

                    <div
                      className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-borderTone ${card.iconBgClassName}`}
                    >
                      <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <Card className={pageTableShellClass}>
          <CardHeader className={pageSectionHeaderBandClass}>
            <div className="flex flex-col gap-3">
              <SectionBlockHeader
                title={text.filters.queueTitle}
                description={text.filters.queueDescription}
              />

              <div className="flex flex-col gap-3 desktop:flex-row desktop:items-center desktop:justify-between">
                <div className="relative w-full desktop:max-w-[460px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={text.filters.searchPlaceholder}
                    className="h-11 w-full rounded-2xl border border-borderTone bg-surface pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-page"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 desktop:justify-end">
                  <Select
                    value={issueFilter}
                    onValueChange={(value) =>
                      setIssueFilter(value as IssueFilter)
                    }
                  >
                    <SelectTrigger className="w-[200px] rounded-2xl border-borderTone bg-surface text-text-primary hover:bg-surface-subtle focus:ring-primary/20 focus:ring-offset-page data-[placeholder]:text-text-tertiary">
                      <SelectValue placeholder={text.filters.issueLabel} />
                    </SelectTrigger>
                    <SelectContent className="border-borderTone bg-surface text-text-primary">
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

                  <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-borderTone bg-surface-subtle p-1">
                    {statusTabs.map((tab) => {
                      const isActive = statusFilter === tab.key
                      return (
                        <button
                          key={tab.key}
                          type="button"
                          onClick={() => setStatusFilter(tab.key)}
                          className={`rounded-xl px-3 py-1.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-text-secondary hover:text-text-primary'
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
