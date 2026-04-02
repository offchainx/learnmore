'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Eye, Hash } from 'lucide-react'
import { useApp } from '@/providers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getReportsI18n } from './i18n'
import type { ReportRecord, ReportIssueType, ReportStatus } from './types'

interface ReportsTableProps {
  reports: ReportRecord[]
  filteredCount: number
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
  selectedIds: string[]
  onPageChange: (page: number) => void
  onToggleSelectRow: (reportId: string) => void
  onToggleSelectAll: (reportIds: string[]) => void
  onSelectReport: (report: ReportRecord) => void
}

function getStatusVariant(status: ReportStatus) {
  switch (status) {
    case 'PENDING':
      return 'danger' as const
    case 'REVIEWING':
      return 'warning' as const
    case 'RESOLVED':
      return 'success' as const
    case 'REJECTED':
      return 'neutral' as const
    default:
      return 'neutral' as const
  }
}

function getIssueVariant(type: ReportIssueType) {
  switch (type) {
    case 'ANSWER_WRONG':
      return 'danger' as const
    case 'TYPO':
    case 'LATEX_ERROR':
      return 'warning' as const
    case 'UNCLEAR':
      return 'neutral' as const
    case 'IMAGE_BROKEN':
      return 'primary' as const
    default:
      return 'outline' as const
  }
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

function formatDateTime(value: string, lang: string) {
  const locale =
    lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms-MY' : 'en-US'
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value))
}

export const ReportsTable: React.FC<ReportsTableProps> = ({
  reports,
  filteredCount,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  selectedIds,
  onPageChange,
  onToggleSelectRow,
  onToggleSelectAll,
  onSelectReport,
}) => {
  const { lang } = useApp()
  const text = getReportsI18n(lang)
  const selectedSet = new Set(selectedIds)
  const allSelected = reports.length > 0 && reports.every((report) => selectedSet.has(report.id))
  const someSelected = !allSelected && reports.some((report) => selectedSet.has(report.id))

  const start = filteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = filteredCount === 0 ? 0 : start + reports.length - 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-borderTone bg-[linear-gradient(180deg,hsl(var(--surface-muted)),hsl(var(--surface-default)))] px-4 py-3 shadow-surface">
        <div className="text-sm text-text-secondary">
          {filteredCount === totalCount ? (
            <>
              {text.table.showing} {start} {text.table.to} {end} {text.table.of}{' '}
              {totalCount} {text.table.results}
            </>
          ) : (
            <>
              {text.table.showing} {start} {text.table.to} {end} {text.table.of}{' '}
              {filteredCount} {text.table.results}
              <span className="ml-2 text-text-tertiary">
                / {totalCount} {text.table.results}
              </span>
            </>
          )}
        </div>
        <div className="text-xs text-text-tertiary">
          {text.table.page} {currentPage}/{Math.max(1, totalPages)}
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-surface-subtle">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected || (someSelected && 'indeterminate')}
                  onCheckedChange={() =>
                    onToggleSelectAll(reports.map((report) => report.id))
                  }
                  aria-label={text.table.selectAll}
                />
              </TableHead>
              <TableHead>{text.table.reporter}</TableHead>
              <TableHead>{text.table.issueType}</TableHead>
              <TableHead>{text.table.questionPreview}</TableHead>
              <TableHead>{text.table.subject}</TableHead>
              <TableHead>{text.table.status}</TableHead>
              <TableHead className="text-right">{text.table.actions}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="[&_tr:last-child]:border-b-0">
            {reports.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="h-28 bg-surface-muted text-center text-text-secondary"
                >
                  {text.filters.empty}
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow
                  key={report.id}
                  className="cursor-pointer"
                  onClick={() => onSelectReport(report)}
                >
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={selectedSet.has(report.id)}
                      onCheckedChange={() => onToggleSelectRow(report.id)}
                      aria-label={`${text.table.selectAll}: ${report.id}`}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      {report.reporter.avatar ? (
                        <img
                          src={report.reporter.avatar}
                          alt={report.reporter.name}
                          className="h-10 w-10 rounded-full border border-borderTone object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-sm font-bold text-white">
                          {report.reporter.name
                            .split(/\s+/)
                            .filter(Boolean)
                            .map((name) => name[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-text-primary dark:text-text-primary">
                          {report.reporter.name}
                        </div>
                        <div className="mt-1 truncate text-xs text-text-secondary dark:text-text-secondary">
                          {report.reporter.email}
                        </div>
                        <div className="mt-1 text-xs text-text-tertiary">
                          {formatDateTime(report.createdAt, lang)}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={getIssueVariant(report.issueType)}>
                      {text.issueType[report.issueType]}
                    </Badge>
                  </TableCell>

                  <TableCell className="max-w-[360px]">
                    <div
                      className="truncate text-sm font-medium text-text-primary dark:text-text-primary"
                      title={report.question.content}
                    >
                      {report.question.content}
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-text-secondary dark:text-text-secondary">
                      {report.description}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-text-tertiary">
                      <Hash className="h-3 w-3" />
                      {report.question.id}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-text-primary dark:text-text-primary">
                      {report.question.subject}
                    </div>
                    <div className="mt-1 text-xs text-text-tertiary">
                      {report.question.type}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={getStatusVariant(report.status)}>
                      {getStatusLabel(report.status, text)}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      className="h-8 w-8 rounded-full p-0 text-text-secondary hover:bg-surface-subtle hover:text-text-primary dark:text-text-secondary dark:hover:bg-surface-subtle dark:hover:text-text-primary"
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelectReport(report)
                      }}
                    >
                      <span className="sr-only">{text.table.viewDetails}</span>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

          <TableFooter>
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableCell colSpan={7}>
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="text-xs text-text-secondary dark:text-text-secondary">
                    {text.table.showing} {start} {text.table.to} {end}{' '}
                    {text.table.of} {filteredCount} {text.table.results}
                    <span className="ml-2 text-text-tertiary">
                      / {totalCount} {text.table.results}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                      className="border-borderTone bg-surface text-text-primary hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface dark:text-text-primary dark:hover:bg-surface-subtle dark:hover:text-text-primary"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= Math.max(1, totalPages)}
                      onClick={() =>
                        onPageChange(
                          Math.min(Math.max(1, totalPages), currentPage + 1)
                        )
                      }
                      className="border-borderTone bg-surface text-text-primary hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface dark:text-text-primary dark:hover:bg-surface-subtle dark:hover:text-text-primary"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}
