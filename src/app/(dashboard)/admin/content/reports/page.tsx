import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { AdminClientWrapper } from '@/components/admin/common'
import { ReportsClient } from '@/components/admin/content-reports/ReportsClient'
import {
  getQuestionReports,
  getQuestionReportsOverview,
} from '@/actions/content-pipeline/question-service'
import type {
  ReportRecord,
  ReportsOverview,
  ReportsRange,
} from '@/components/admin/content-reports/types'

type ReportRow = Awaited<ReturnType<typeof getQuestionReports>>['data'][number]

const PAGE_SIZE = 1000

function parseRange(raw: string | string[] | undefined): ReportsRange {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (value === '30d' || value === 'all') return value
  return '7d'
}

function getRangeStart(range: ReportsRange) {
  if (range === 'all') return undefined
  const days = range === '30d' ? 30 : 7
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function toIso(date: Date | null): string | null {
  return date ? date.toISOString() : null
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    range?: string | string[]
  }>
}) {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const currentRange = parseRange(resolvedSearchParams?.range)
  const rangeStart = getRangeStart(currentRange)

  let reports: ReportRow[] = []
  let overview: ReportsOverview = {
    openQueue: 0,
    resolvedCount: 0,
    avgResolutionTime: 0,
    answerWrongCount: 0,
  }
  let loadError: string | null = null

  try {
    const [reportsResult, overviewResult] = await Promise.all([
      getQuestionReports(
        { page: 1, pageSize: PAGE_SIZE },
        rangeStart ? { createdAfter: rangeStart } : {}
      ),
      getQuestionReportsOverview(currentRange),
    ])

    reports = reportsResult.data
    if (overviewResult.success && overviewResult.data) {
      overview = overviewResult.data
    } else if (!overviewResult.success) {
      loadError = overviewResult.error || '获取报错概览失败'
    }
  } catch (error) {
    loadError = error instanceof Error ? error.message : '获取报错列表失败'
  }

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <ReportsClient
        initialRange={currentRange}
        reviewerId={profile.id}
        reviewerLabel={profile.username || profile.email || profile.id}
        initialReports={reports.map(
          (report): ReportRecord => ({
            id: report.id,
            reporter: {
              id: report.reporter.id,
              name: report.reporter.name,
              email: report.reporter.email,
              avatar: report.reporter.avatar,
              role: report.reporter.role,
            },
            question: {
              id: report.question.id,
              content: report.question.content,
              type: report.question.type,
              subject: report.question.subject,
              options: report.question.options.map((option) => ({
                id: option.id,
                text: option.text,
                isCorrect: option.isCorrect,
              })),
              answer: report.question.answer,
            },
            issueType: report.issueType as ReportRecord['issueType'],
            status: report.status as ReportRecord['status'],
            description: report.description,
            createdAt: toIso(report.createdAt)!,
            reviewedAt: toIso(report.reviewedAt),
            reviewedBy: report.reviewedBy,
            resolution: report.resolution,
          })
        )}
        initialOverview={overview}
        loadError={loadError}
      />
    </AdminClientWrapper>
  )
}
