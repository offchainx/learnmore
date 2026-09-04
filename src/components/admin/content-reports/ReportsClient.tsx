'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock3, Search, Siren } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useApp } from '@/providers'
import { bulkResolveReports } from '@/actions/content-pipeline/question-service'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import {
  pageKpiCardClass,
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
import { getReportsI18n } from './i18n'
import type {
  ReportIssueType,
  ReportRecord,
  ReportsOverview,
  ReportsRange,
  ReportStatus,
} from './types'

type StatusFilter = 'ALL' | ReportStatus
type IssueFilter = 'ALL' | ReportIssueType

const PAGE_SIZE = 10

function matchesReportQuery(report: ReportRecord, query: string): boolean {
  if (!query) return true

  return [
    report.id,
    report.reporter.name,
    report.reporter.email,
    report.question.id,
    report.question.subject,
    report.question.content,
    report.description,
    report.resolution || '',
  ]
    .join(' ')
    .toLowerCase()
    .includes(query)
}

function getReportStatusLabel(
  status: ReportStatus,
  text: ReturnType<typeof getReportsI18n>
) {
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

interface ReportsClientProps {
  initialRange: ReportsRange
  initialReports: ReportRecord[]
  initialOverview: ReportsOverview
  reviewerId: string
  reviewerLabel: string
  loadError?: string | null
}

export const ReportsClient: React.FC<ReportsClientProps> = ({
  initialRange,
  initialReports,
  initialOverview,
  reviewerId,
  reviewerLabel,
  loadError,
}) => {
  const { lang } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const text = getReportsI18n(lang)

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<ReportsRange>(initialRange)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [issueFilter, setIssueFilter] = useState<IssueFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkNote, setBulkNote] = useState('')
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)

  useEffect(() => {
    setTimeRange(initialRange)
  }, [initialRange])

  const selectedReport = useMemo(
    () =>
      selectedReportId
        ? (initialReports.find((report) => report.id === selectedReportId) ??
          null)
        : null,
    [initialReports, selectedReportId]
  )

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

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, issueFilter])

  useEffect(() => {
    setSelectedIds([])
    setBulkNote('')
  }, [currentPage, issueFilter, pageSize, searchQuery, statusFilter, timeRange])

  const handleSelectReport = (report: ReportRecord) => {
    setSelectedReportId(report.id)
    setIsDrawerOpen(true)
  }

  const toggleSelectRow = (reportId: string) => {
    setSelectedIds((current) =>
      current.includes(reportId)
        ? current.filter((id) => id !== reportId)
        : [...current, reportId]
    )
  }

  const toggleSelectAll = (reportIds: string[]) => {
    setSelectedIds((current) => {
      const hasAll = reportIds.every((reportId) => current.includes(reportId))
      if (hasAll) {
        return current.filter((id) => !reportIds.includes(id))
      }

      const next = new Set(current)
      reportIds.forEach((reportId) => next.add(reportId))
      return Array.from(next)
    })
  }

  const handleRangeChange = (nextRange: ReportsRange) => {
    if (nextRange === timeRange) return

    setTimeRange(nextRange)
    setCurrentPage(1)

    const params = new URLSearchParams()
    if (nextRange !== '7d') {
      params.set('range', nextRange)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const reportsInRange = useMemo(() => initialReports, [initialReports])

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return reportsInRange.filter((report) => {
      const matchesStatus =
        statusFilter === 'ALL' ? true : report.status === statusFilter
      const matchesIssue =
        issueFilter === 'ALL' ? true : report.issueType === issueFilter
      const matchesQuery = matchesReportQuery(report, query)

      return matchesStatus && matchesIssue && matchesQuery
    })
  }, [issueFilter, reportsInRange, searchQuery, statusFilter])

  const totalPages =
    filteredReports.length === 0
      ? 0
      : Math.ceil(filteredReports.length / pageSize)

  useEffect(() => {
    if (totalPages === 0) {
      if (currentPage !== 1) {
        setCurrentPage(1)
      }
      return
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const pagedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredReports.slice(start, start + pageSize)
  }, [currentPage, filteredReports, pageSize])

  const selectedCount = selectedIds.length

  const handleBulkResolve = async (nextStatus: ReportStatus) => {
    if (selectedCount === 0) return

    setIsBulkSubmitting(true)
    const result = await bulkResolveReports(
      selectedIds,
      nextStatus,
      reviewerId,
      bulkNote.trim() || undefined
    )

    if (result.succeeded > 0) {
      toast({
        title: '批量处理已提交',
        description:
          result.failed === 0
            ? `${result.succeeded} 条报错已更新为 ${getReportStatusLabel(nextStatus, text)}.`
            : `${result.succeeded} 条成功，${result.failed} 条失败。`,
      })
      setSelectedIds([])
      setBulkNote('')
      router.refresh()
    } else {
      const firstError = result.results.find((item) => !item.success)?.error
      toast({
        variant: 'destructive',
        title: '批量处理失败',
        description: firstError || '批量处理未生效，请稍后重试。',
      })
    }

    setIsBulkSubmitting(false)
  }

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    if (nextPageSize !== pageSize) {
      setPageSize(nextPageSize)
      setCurrentPage(1)
      return
    }

    setCurrentPage(nextPage)
  }

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
      value: String(initialOverview.openQueue),
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
      value: String(initialOverview.resolvedCount),
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
      value: `${initialOverview.avgResolutionTime.toFixed(1)}${text.stats.hours}`,
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
      value: String(initialOverview.answerWrongCount),
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
    { key: 'ALL', label: text.filters.statusAll },
    { key: 'PENDING', label: text.table.pending },
    { key: 'REVIEWING', label: text.table.reviewing },
    { key: 'RESOLVED', label: text.table.resolved },
    { key: 'REJECTED', label: text.table.rejected },
  ]

  return (
    <div className="px-3 py-2 sm:px-4 sm:py-3">
      <div className="mx-auto w-full max-w-[1820px] space-y-3 rounded-[32px] border border-borderTone bg-page p-2.5 text-text-primary shadow-surface-lg sm:p-3">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-text-tertiary">
            {text.header.badge}
          </div>
        </div>

        {loadError ? (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="font-medium text-rose-100">报错页面加载失败</p>
                <p className="text-rose-200/80">{loadError}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.refresh()}
                className="border-rose-400/30 bg-transparent text-rose-100 hover:bg-rose-500/10 hover:text-rose-50"
              >
                重新加载
              </Button>
            </div>
          </div>
        ) : null}

        <section className="space-y-3">
          <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
            <SectionBlockHeader
              title={text.filters.queueTitle}
              description={text.filters.queueDescription}
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
                    onClick={() => handleRangeChange(range.key as ReportsRange)}
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
          <CardContent className="space-y-5 p-4 sm:p-5">
            <div className="flex flex-col gap-3 desktop:flex-row desktop:items-center desktop:justify-between">
              <div className="relative w-full desktop:max-w-[460px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder={text.filters.searchPlaceholder}
                  className="h-11 w-full rounded-2xl border border-borderTone bg-surface pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-page"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 desktop:justify-end">
                <Select
                  value={issueFilter}
                  onValueChange={(value) => {
                    setIssueFilter(value as IssueFilter)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[220px] rounded-2xl border-borderTone bg-surface text-text-primary hover:bg-surface-subtle focus:ring-primary/20 focus:ring-offset-page data-[placeholder]:text-text-tertiary">
                    <SelectValue placeholder={text.filters.issueLabel} />
                  </SelectTrigger>
                  <SelectContent className="border-borderTone bg-surface text-text-primary">
                    <SelectItem value="ALL">{text.filters.issueAll}</SelectItem>
                    <SelectItem value="ANSWER_WRONG">
                      {text.issueType.ANSWER_WRONG}
                    </SelectItem>
                    <SelectItem value="TYPO">{text.issueType.TYPO}</SelectItem>
                    <SelectItem value="UNCLEAR">
                      {text.issueType.UNCLEAR}
                    </SelectItem>
                    <SelectItem value="IMAGE_BROKEN">
                      {text.issueType.IMAGE_BROKEN}
                    </SelectItem>
                    <SelectItem value="LATEX_ERROR">
                      {text.issueType.LATEX_ERROR}
                    </SelectItem>
                    <SelectItem value="OTHER">
                      {text.issueType.OTHER}
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
                        onClick={() => {
                          setStatusFilter(tab.key)
                          setCurrentPage(1)
                        }}
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

            <ReportsTable
              reports={pagedReports}
              filteredCount={filteredReports.length}
              totalCount={reportsInRange.length}
              currentPage={currentPage}
              pageSize={pageSize}
              selectedIds={selectedIds}
              onPageChange={handlePageChange}
              onToggleSelectRow={toggleSelectRow}
              onToggleSelectAll={toggleSelectAll}
              onSelectReport={handleSelectReport}
            />

            {selectedCount > 0 ? (
              <div className="shadow-surface-sm rounded-3xl border border-borderTone bg-surface-subtle p-4">
                <div className="flex flex-col gap-4 laptop:flex-row laptop:items-end laptop:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-text-primary">
                      {text.table.bulkActions}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {selectedCount} {text.table.bulkSelected}
                    </p>
                  </div>

                  <div className="grid gap-3 laptop:max-w-[660px] laptop:flex-1">
                    <Textarea
                      value={bulkNote}
                      onChange={(event) => setBulkNote(event.target.value)}
                      placeholder={text.table.bulkNotePlaceholder}
                      className="min-h-[96px] rounded-[22px] border-borderTone bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary"
                      disabled={isBulkSubmitting}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleBulkResolve('REVIEWING')}
                          disabled={isBulkSubmitting}
                          className="border-borderTone bg-surface text-text-primary hover:bg-surface-subtle"
                        >
                          {text.table.bulkSetReviewing}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleBulkResolve('RESOLVED')}
                          disabled={isBulkSubmitting}
                          className="border-borderTone bg-surface text-text-primary hover:bg-surface-subtle"
                        >
                          {text.table.bulkSetResolved}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleBulkResolve('REJECTED')}
                          disabled={isBulkSubmitting}
                          className="border-borderTone bg-surface text-text-primary hover:bg-surface-subtle"
                        >
                          {text.table.bulkSetRejected}
                        </Button>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setSelectedIds([])
                          setBulkNote('')
                        }}
                        className="text-text-secondary hover:text-text-primary"
                      >
                        {text.table.bulkClear}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
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
        lang={lang}
        reviewerId={reviewerId}
        reviewerLabel={reviewerLabel}
        onRefresh={() => router.refresh()}
      />
    </div>
  )
}
