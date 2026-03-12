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
        return (
          <Badge className="border-[#5C4520] bg-[#3B2A10] text-[#FBBF24]">
            {text.table.inReview}
          </Badge>
        )
      case ReportStatus.PENDING:
        return (
          <Badge className="border-[#6D2432] bg-[#241118] text-[#FDA4AF]">
            {text.table.pending}
          </Badge>
        )
      case ReportStatus.RESOLVED:
        return (
          <Badge className="border-[#244B37] bg-[#123125] text-[#7FE0AF]">
            {text.table.resolved}
          </Badge>
        )
    }
  }

  const getIssueBadge = (type: IssueType) => {
    switch (type) {
      case IssueType.ANSWER_WRONG:
        return (
          <Badge className="border-[#6D2432] bg-[#241118] text-[#FDA4AF]">
            {text.issueType[type]}
          </Badge>
        )
      case IssueType.TYPO_ERROR:
        return (
          <Badge className="border-[#5C4520] bg-[#3B2A10] text-[#FBBF24]">
            {text.issueType[type]}
          </Badge>
        )
      case IssueType.IMAGE_MISSING:
        return (
          <Badge className="border-[#2B4470] bg-[#18335E] text-[#93C5FD]">
            {text.issueType[type]}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-[#24324D] bg-[#101A2E]/80 px-4 py-3">
        <div className="text-sm text-[#9FB0C9]">
          {reports.length} / {totalCount} {text.filters.resultSummary}
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#24324D] bg-[#0D1628]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#1B2840] bg-[#0F1A2F] hover:bg-[#0F1A2F]">
              <TableHead className="text-[#7F93B2]">
                {text.table.reporter}
              </TableHead>
              <TableHead className="text-[#7F93B2]">
                {text.table.issueType}
              </TableHead>
              <TableHead className="text-[#7F93B2]">
                {text.table.questionPreview}
              </TableHead>
              <TableHead className="text-[#7F93B2]">
                {text.table.subject}
              </TableHead>
              <TableHead className="text-[#7F93B2]">
                {text.table.status}
              </TableHead>
              <TableHead className="text-right text-[#7F93B2]">
                {text.table.actions}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="[&_tr:last-child]:border-b-0">
            {reports.length === 0 ? (
              <TableRow className="border-b border-[#16233A] hover:bg-transparent">
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-[#7F93B2]"
                >
                  {text.filters.empty}
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow
                  key={report.id}
                  className="cursor-pointer border-b border-[#16233A] text-[#E6EDF7] hover:bg-[#111C31]"
                  onClick={() => onSelectReport(report)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {report.user.avatar ? (
                        <img
                          src={report.user.avatar}
                          alt={report.user.name}
                          className="h-10 w-10 rounded-full border border-[#24324D] object-cover"
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
                        <div className="truncate text-sm font-medium text-[#E6EDF7]">
                          {report.user.name}
                        </div>
                        <div className="mt-1 text-xs text-[#7F93B2]">
                          {report.timestamp}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{getIssueBadge(report.issueType)}</TableCell>

                  <TableCell className="max-w-[360px]">
                    <div
                      className="truncate text-sm font-medium text-[#E6EDF7]"
                      title={report.question.text}
                    >
                      {report.question.text}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-[#7F93B2]">
                      <Hash className="h-3 w-3" />
                      {report.question.id}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-[#D6E7FF]">
                      {report.question.subject}
                    </div>
                  </TableCell>

                  <TableCell>{getStatusBadge(report.status)}</TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      className="h-8 w-8 rounded-full p-0 text-[#AFC3DE] hover:bg-[#18253E] hover:text-white"
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

          <TableFooter className="border-t border-[#1B2840] bg-[#0F1A2F]/80 text-[#C7D5EA]">
            <TableRow className="border-b-0 hover:bg-transparent">
              <TableCell colSpan={6}>
                <div className="flex w-full items-center justify-between">
                  <div className="text-xs text-[#7F93B2]">
                    {text.table.showing} 1 {text.table.to} {reports.length}{' '}
                    {text.table.of} {totalCount} {text.table.results}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="border-[#24324D] bg-[#151F36] text-[#D6E7FF] hover:bg-[#1A2744] hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={reports.length === 0}
                      className="border-[#24324D] bg-[#151F36] text-[#D6E7FF] hover:bg-[#1A2744] hover:text-white"
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
