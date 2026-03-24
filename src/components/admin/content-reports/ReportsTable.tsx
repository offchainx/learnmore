'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Eye, Hash } from 'lucide-react'
import { useApp } from '@/providers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { IssueType, Report, ReportStatus } from './types'

interface ReportsTableProps {
  reports: Report[]
  totalCount: number
  onSelectReport: (report: Report) => void
}

export const ReportsTable: React.FC<ReportsTableProps> = ({
  reports,
  totalCount,
  onSelectReport,
}) => {
  const { lang } = useApp()
  const text = getReportsI18n(lang)

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.IN_REVIEW:
        return <Badge variant="warning">{text.table.inReview}</Badge>
      case ReportStatus.PENDING:
        return <Badge variant="danger">{text.table.pending}</Badge>
      case ReportStatus.RESOLVED:
        return <Badge variant="success">{text.table.resolved}</Badge>
    }
  }

  const getIssueBadge = (type: IssueType) => {
    switch (type) {
      case IssueType.ANSWER_WRONG:
        return <Badge variant="danger">{text.issueType[type]}</Badge>
      case IssueType.TYPO_ERROR:
        return <Badge variant="warning">{text.issueType[type]}</Badge>
      case IssueType.IMAGE_MISSING:
        return <Badge variant="primary">{text.issueType[type]}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-borderTone bg-[linear-gradient(180deg,hsl(var(--surface-muted)),hsl(var(--surface-default)))] px-4 py-3 shadow-surface">
        <div className="text-sm text-text-secondary">
          {reports.length} / {totalCount} {text.filters.resultSummary}
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-surface-subtle">
              <TableHead>
                {text.table.reporter}
              </TableHead>
              <TableHead>
                {text.table.issueType}
              </TableHead>
              <TableHead>
                {text.table.questionPreview}
              </TableHead>
              <TableHead>
                {text.table.subject}
              </TableHead>
              <TableHead>
                {text.table.status}
              </TableHead>
              <TableHead className="text-right">
                {text.table.actions}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="[&_tr:last-child]:border-b-0">
            {reports.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={6}
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
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {report.user.avatar ? (
                        <img
                          src={report.user.avatar}
                          alt={report.user.name}
                          className="h-10 w-10 rounded-full border border-borderTone object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-sm font-bold text-white">
                          {report.user.name
                            .split(' ')
                            .map((name) => name[0])
                            .join('')}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-text-primary dark:text-text-primary">
                          {report.user.name}
                        </div>
                        <div className="mt-1 text-xs text-text-secondary dark:text-text-secondary">
                          {report.timestamp}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{getIssueBadge(report.issueType)}</TableCell>

                  <TableCell className="max-w-[360px]">
                    <div
                      className="truncate text-sm font-medium text-text-primary dark:text-text-primary"
                      title={report.question.text}
                    >
                      {report.question.text}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-text-secondary dark:text-text-secondary">
                      <Hash className="h-3 w-3" />
                      {report.question.id}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-text-primary dark:text-text-primary">
                      {report.question.subject}
                    </div>
                  </TableCell>

                  <TableCell>{getStatusBadge(report.status)}</TableCell>

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
              <TableCell colSpan={6}>
                  <div className="flex w-full items-center justify-between">
                  <div className="text-xs text-text-secondary dark:text-text-secondary">
                    {text.table.showing} 1 {text.table.to} {reports.length}{' '}
                    {text.table.of} {totalCount} {text.table.results}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="border-borderTone bg-surface text-text-primary hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface dark:text-text-primary dark:hover:bg-surface-subtle dark:hover:text-text-primary"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reports.length === 0}
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
