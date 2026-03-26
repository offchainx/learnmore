import { Suspense } from 'react'
import Link from 'next/link'
import {
  getContentStats,
  getContentReviewActivityLogs,
  getQuestions,
  getPendingReviewQuestions,
} from '@/actions/content-pipeline/question-service'
import { getAllSubjects } from '@/actions/courses/subject'
import { QuestionReviewTable } from '@/components/admin/questions'
import { SubjectFilter } from '@/components/admin/common'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { QuestionFilter } from '@/lib/content-pipeline/types'
import { ContentStatus } from '@prisma/client'
import { AdminClientWrapper } from '@/components/admin/common'
import { getProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { PageHeroTitle } from '@/components/shared/PageHeroTitle'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import {
  pageKpiCardClass,
  pagePillActiveClass,
  pagePillInactiveClass,
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
import { AlertCircle, Clock3, FolderKanban, RefreshCcw } from 'lucide-react'
import { AdminActivityActions } from '@/components/admin/content/AdminActivityActions'

export const dynamic = 'force-dynamic'

interface AdminContentPageProps {
  searchParams: Promise<{
    page?: string
    subjectId?: string
    status?: string
    tab?: string
    range?: string
  }>
}

export default async function AdminContentPage({
  searchParams,
}: AdminContentPageProps) {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }

  // Parse search params
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page) || 1
  const subjectId = resolvedSearchParams.subjectId
  const statusParam = resolvedSearchParams.status
  const currentTab = resolvedSearchParams.tab || 'all'
  const currentRange =
    resolvedSearchParams.range === '30d' || resolvedSearchParams.range === 'all'
      ? resolvedSearchParams.range
      : '7d'

  // Determine status filter based on tab or param
  let statusFilter: ContentStatus[] | undefined = undefined

  if (currentTab === 'pending') {
    statusFilter = [ContentStatus.REVIEW_PENDING]
  } else if (currentTab === 'published') {
    statusFilter = [ContentStatus.PUBLISHED]
  } else if (currentTab === 'rejected') {
    statusFilter = [ContentStatus.REVIEW_REJECTED]
  } else if (statusParam) {
    statusFilter = [statusParam as ContentStatus]
  }

  const filter: QuestionFilter = {
    subjectId,
    status: statusFilter,
    deletedOnly: currentTab === 'deleted',
  }

  // Fetch data in parallel
  const [questionsResult, subjectsResult, contentStatsResult, activityLogsResult] =
    await Promise.all([
      currentTab === 'pending'
        ? getPendingReviewQuestions({ page, pageSize: 20 }, filter)
        : getQuestions({ page, pageSize: 20 }, filter),
      getAllSubjects(),
      getContentStats(currentRange, { subjectId }),
      getContentReviewActivityLogs({ limit: 40, subjectId }),
    ])

  const questions = questionsResult.data || []
  const buildReviewHref = (
    overrides: Partial<{
      tab: string
      subjectId: string
      page: string
      range: string
    }>
  ) => {
    const params = new URLSearchParams()
    const nextTab = overrides.tab ?? currentTab
    const nextSubjectId = overrides.subjectId ?? subjectId
    const nextPage = overrides.page ?? String(page)
    const nextRange = overrides.range ?? currentRange

    params.set('tab', nextTab)
    if (nextSubjectId) params.set('subjectId', nextSubjectId)
    if (nextPage && nextPage !== '1') params.set('page', nextPage)
    if (nextRange && nextRange !== '7d') params.set('range', nextRange)

    return `?${params.toString()}`
  }
  const buildTabHref = (tab: string) =>
    buildReviewHref({
      tab,
      page: '1',
    })
  const buildRangeHref = (range: '7d' | '30d' | 'all') =>
    buildReviewHref({
      range,
    })
  const subjects =
    subjectsResult.success && subjectsResult.data
      ? subjectsResult.data.map((s) => ({
          id: s.id,
          name: s.name,
          slug: (s as any).slug || s.name.toLowerCase(), // Ensure slug is present
          order: s.order,
          icon: s.icon,
        }))
      : []
  const contentStats = contentStatsResult.success
    ? contentStatsResult.data
    : null
  const activityLogs =
    activityLogsResult.success && activityLogsResult.data
      ? activityLogsResult.data
      : []
  const rangeLabel =
    currentRange === '30d'
      ? '30 天范围'
      : currentRange === 'all'
        ? '全部时间'
        : '7 天范围'
  const volumeLabel =
    currentRange === '30d'
      ? '30 天内入库'
      : currentRange === 'all'
        ? '全部入库'
        : '7 天内入库'
  const reviewOverview = [
    {
      key: 'pending',
      label: '待审核',
      value: contentStats?.byStatus.REVIEW_PENDING || 0,
      hint: '当前需要处理',
      icon: Clock3,
      caption: rangeLabel,
      iconClassName: 'text-amber-700 dark:text-[#FBBF24]',
      iconBgClassName: 'bg-amber-50 dark:bg-[#3B2A10]',
      glowClassName: 'bg-[#F59E0B]/20',
      borderClassName: 'border-amber-200 dark:border-[#5C4520]',
    },
    {
      key: 'rejected',
      label: '已驳回',
      value: contentStats?.byStatus.REVIEW_REJECTED || 0,
      hint: '可回看问题题',
      icon: RefreshCcw,
      caption: rangeLabel,
      iconClassName: 'text-rose-700 dark:text-[#F87171]',
      iconBgClassName: 'bg-rose-50 dark:bg-[#31151D]',
      glowClassName: 'bg-[#EF4444]/20',
      borderClassName: 'border-rose-200 dark:border-[#5C2B33]',
    },
    {
      key: 'reports',
      label: '待处理报错',
      value: contentStats?.pendingReports || 0,
      hint: '来自用户纠错',
      icon: AlertCircle,
      caption: rangeLabel,
      iconClassName: 'text-violet-700 dark:text-[#C4B5FD]',
      iconBgClassName: 'bg-violet-50 dark:bg-[#2A1F4A]',
      glowClassName: 'bg-[#8B5CF6]/20',
      borderClassName: 'border-violet-200 dark:border-[#47306C]',
    },
    {
      key: 'volume',
      label: volumeLabel,
      value: contentStats?.recentlyAdded || 0,
      hint: '新进入审核池',
      icon: FolderKanban,
      caption: currentRange === 'all' ? '累计内容量' : '内容入库速度',
      iconClassName: 'text-blue-700 dark:text-[#60A5FA]',
      iconBgClassName: 'bg-blue-50 dark:bg-[#18335E]',
      glowClassName: 'bg-[#2563EB]/20',
      borderClassName: 'border-blue-200 dark:border-[#2B4470]',
    },
  ] as const

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto w-full max-w-[1820px] space-y-3 rounded-[32px] border border-borderTone bg-page p-2.5 text-text-primary dark:border-[#24324D] dark:bg-[#0B1220] dark:text-[#E6EDF7] sm:p-3">
          <PageHeroShell
            className="sm:py-4.5 px-4 py-4 sm:px-5"
            title={
              <PageHeroTitle title="内容管理" capsuleLabel="Review Console" />
            }
            subtitle="审核批量导入后的题目内容，集中处理待发布、已发布和已驳回题目。"
            titleClassName="font-semibold"
            actions={
              <AdminActivityActions
                logs={activityLogs}
                auditTitle="审核操作日志"
                auditDescription="基于 content_review_logs 真实记录生成的近期审核活动。"
                emptyText="当前还没有可显示的审核日志。"
                searchPlaceholder="搜索审核人、动作、题干片段..."
                footerText={`当前显示 ${activityLogs.length} 条真实审核日志`}
              />
            }
          />

          <section className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <SectionBlockHeader
                title="审核概览"
                description="聚焦审核积压、驳回回流、用户报错与当前时间范围内的入库量。"
                className="flex-1"
              />

              <div className={pageSegmentedControlCompactClass}>
                {[
                  { key: '7d', label: '7 Days' },
                  { key: '30d', label: '30 Days' },
                  { key: 'all', label: 'All Time' },
                ].map((range) => {
                  const isActive = currentRange === range.key
                  return (
                    <Link
                      key={range.key}
                      href={buildRangeHref(range.key as '7d' | '30d' | 'all')}
                      className={`${pageSegmentedButtonCompactClass} ${
                        isActive ? pagePillActiveClass : pagePillInactiveClass
                      }`}
                    >
                      {range.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {reviewOverview.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.key}
                    className={`${pageKpiCardClass} ${item.borderClassName}`}
                  >
                    <div
                      className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${item.glowClassName}`}
                    />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70" />

                    <div className="relative flex h-full items-start justify-between gap-4">
                      <div className="flex min-h-[120px] flex-1 flex-col justify-between gap-3">
                        <div className="space-y-1.5">
                          <p className={pageKickerClass}>{item.label}</p>
                          <div className="flex items-end gap-2">
                            <p className={pageHeroNumericValueClass}>
                              {item.value}
                            </p>
                            <span className={`pb-1 ${pageMetaTextClass}`}>
                              {item.caption}
                            </span>
                          </div>
                        </div>
                        <p
                          className={`line-clamp-2 max-w-[20rem] ${pageMetaTextClass}`}
                        >
                          {item.hint}
                        </p>
                      </div>

                      <div
                        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 ${item.iconBgClassName}`}
                      >
                        <Icon className={`h-5 w-5 ${item.iconClassName}`} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <Card className={pageTableShellClass}>
            <CardHeader className={pageSectionHeaderBandClass}>
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <SectionBlockHeader
                  title="题目列表"
                  description="统一处理题目审核、发布与驳回动作，优先消化批量导入待审核项。"
                />

                <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                  <div className="flex items-center gap-2">
                    <SubjectFilter
                      subjects={subjects}
                      triggerClassName="w-[200px] rounded-2xl border-borderTone bg-surface text-text-primary hover:bg-surface-subtle focus:ring-primary/40 focus:ring-offset-page data-[placeholder]:text-text-tertiary dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7] dark:hover:bg-[#1A2744] dark:focus:ring-[#60A5FA] dark:focus:ring-offset-[#0F172A] dark:data-[placeholder]:text-[#8FA4C2]"
                      contentClassName="border-borderTone bg-surface text-text-primary dark:border-[#24324D] dark:bg-[#151F36] dark:text-[#E6EDF7]"
                    />
                  </div>

                  <div
                    className={`${pageSegmentedControlCompactClass} flex-wrap gap-1`}
                  >
                    {[
                      { key: 'all', label: '全部' },
                      { key: 'pending', label: '待审核' },
                      { key: 'published', label: '已发布' },
                      { key: 'rejected', label: '已驳回' },
                      { key: 'deleted', label: '已删除' },
                    ].map((tab) => {
                      const isActive = currentTab === tab.key
                      return (
                        <Link
                          key={tab.key}
                          href={buildTabHref(tab.key)}
                          className={`${pageSegmentedButtonCompactClass} ${
                            isActive
                              ? pagePillActiveClass
                              : pagePillInactiveClass
                          }`}
                        >
                          {tab.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
              <Suspense
                fallback={
                  <div className="flex h-48 items-center justify-center text-text-secondary dark:text-[#7F93B2]">
                    加载中...
                  </div>
                }
              >
                <QuestionReviewTable
                  questions={questions}
                  page={questionsResult.page}
                  totalPages={questionsResult.totalPages}
                  currentTab={currentTab}
                />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminClientWrapper>
  )
}
