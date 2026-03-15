import { Suspense } from 'react'
import Link from 'next/link'
import {
  getContentStats,
  getQuestions,
  getPendingReviewQuestions,
} from '@/actions/content-pipeline/question-service'
import { getAllSubjects } from '@/actions/courses/subject'
import { QuestionReviewTable } from '@/components/admin/questions'
import { SubjectFilter } from '@/components/admin/common'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { QuestionFilter } from '@/lib/content-pipeline/types'
import { ContentStatus } from '@prisma/client'
import { AdminClientWrapper } from '@/components/admin/common'
import { getProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import { pageBadgeClass } from '@/components/shared/pageSurfaces'
import {
  AlertCircle,
  ClipboardCheck,
  Clock3,
  FolderKanban,
  RefreshCcw,
  Sparkles,
} from 'lucide-react'

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
  }

  // Fetch data in parallel
  const [questionsResult, subjectsResult, contentStatsResult] =
    await Promise.all([
      currentTab === 'pending'
        ? getPendingReviewQuestions({ page, pageSize: 20 }, filter)
        : getQuestions({ page, pageSize: 20 }, filter),
      getAllSubjects(),
      getContentStats(currentRange),
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
      iconClassName: 'text-[#FBBF24]',
      iconBgClassName: 'bg-[#3B2A10]',
      glowClassName: 'bg-[#F59E0B]/20',
      borderClassName: 'border-[#5C4520]',
    },
    {
      key: 'rejected',
      label: '已驳回',
      value: contentStats?.byStatus.REVIEW_REJECTED || 0,
      hint: '可回看问题题',
      icon: RefreshCcw,
      caption: rangeLabel,
      iconClassName: 'text-[#F87171]',
      iconBgClassName: 'bg-[#31151D]',
      glowClassName: 'bg-[#EF4444]/20',
      borderClassName: 'border-[#5C2B33]',
    },
    {
      key: 'reports',
      label: '待处理报错',
      value: contentStats?.pendingReports || 0,
      hint: '来自用户纠错',
      icon: AlertCircle,
      caption: rangeLabel,
      iconClassName: 'text-[#C4B5FD]',
      iconBgClassName: 'bg-[#2A1F4A]',
      glowClassName: 'bg-[#8B5CF6]/20',
      borderClassName: 'border-[#47306C]',
    },
    {
      key: 'volume',
      label: volumeLabel,
      value: contentStats?.recentlyAdded || 0,
      hint: '新进入审核池',
      icon: FolderKanban,
      caption: currentRange === 'all' ? '累计内容量' : '内容入库速度',
      iconClassName: 'text-[#60A5FA]',
      iconBgClassName: 'bg-[#18335E]',
      glowClassName: 'bg-[#2563EB]/20',
      borderClassName: 'border-[#2B4470]',
    },
  ] as const

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto w-full max-w-[1820px] space-y-3 rounded-[32px] border border-[#24324D] bg-[#0B1220] p-2.5 text-[#E6EDF7] sm:p-3">
          <PageHeroShell
            className="px-4 py-4 sm:px-5 sm:py-4.5"
            eyebrow={
              <div className={pageBadgeClass}>
                <ClipboardCheck className="h-3 w-3 text-[#60A5FA]" />
                Review Console
              </div>
            }
            title="内容管理"
            subtitle="审核批量导入后的题目内容，集中处理待发布、已发布和已驳回题目。"
          />

          <section className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <SectionBlockHeader
                title="审核概览"
                description="聚焦审核积压、驳回回流、用户报错与当前时间范围内的入库量。"
                className="flex-1"
              />

              <div className="inline-flex items-center rounded-2xl border border-[#24324D] bg-[#121C32] p-1">
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
                      className={`rounded-xl px-5 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                          : 'text-[#8FA4C2] hover:text-white'
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
                    className={`relative overflow-hidden rounded-[24px] border bg-[linear-gradient(180deg,rgba(17,26,46,0.98),rgba(11,18,32,0.96))] p-4 shadow-[0_18px_40px_rgba(2,8,23,0.38)] ${item.borderClassName}`}
                  >
                    <div
                      className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${item.glowClassName}`}
                    />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-70" />

                    <div className="relative flex h-full items-start justify-between gap-4">
                      <div className="flex min-h-[120px] flex-1 flex-col justify-between gap-3">
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA3C0]">
                            {item.label}
                          </p>
                          <div className="flex items-end gap-2">
                            <p className="text-[2rem] font-semibold leading-none tracking-tight text-[#F8FBFF]">
                              {item.value}
                            </p>
                            <span className="pb-1 text-[11px] text-[#8EA3C0]">
                              {item.caption}
                            </span>
                          </div>
                        </div>
                        <p className="line-clamp-2 max-w-[20rem] text-sm leading-6 text-[#B2C3DA]">
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

          <Card className="bg-[#0F172A]/96 overflow-hidden rounded-[28px] border border-[#24324D] shadow-[0_18px_40px_rgba(2,8,23,0.24)]">
            <CardHeader className="border-b border-[#1B2840] bg-[#0F1A2F] px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <SectionBlockHeader
                  title="题目列表"
                  description="统一处理题目审核、发布与驳回动作，优先消化批量导入待审核项。"
                />

                <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                  <div className="flex items-center gap-2">
                    <SubjectFilter
                      subjects={subjects}
                      triggerClassName="w-[200px] rounded-2xl border-[#24324D] bg-[#151F36] text-[#E6EDF7] hover:bg-[#1A2744] focus:ring-[#60A5FA] focus:ring-offset-[#0F172A] data-[placeholder]:text-[#8FA4C2]"
                      contentClassName="border-[#24324D] bg-[#151F36] text-[#E6EDF7]"
                    />
                  </div>

                  <div className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-[#24324D] bg-[#121C32] p-1">
                    {[
                      { key: 'all', label: '全部' },
                      { key: 'pending', label: '待审核' },
                      { key: 'published', label: '已发布' },
                      { key: 'rejected', label: '已驳回' },
                    ].map((tab) => {
                      const isActive = currentTab === tab.key
                      return (
                        <Link
                          key={tab.key}
                          href={buildTabHref(tab.key)}
                          className={`rounded-xl px-3 py-1.5 text-sm transition-colors ${
                            isActive
                              ? 'bg-[#1E2C47] text-white shadow-[inset_0_0_0_1px_rgba(96,165,250,0.2)]'
                              : 'text-[#8FA4C2] hover:text-white'
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
                  <div className="flex h-48 items-center justify-center text-[#7F93B2]">
                    加载中...
                  </div>
                }
              >
                <QuestionReviewTable
                  questions={questions}
                  page={questionsResult.page}
                  totalPages={questionsResult.totalPages}
                />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminClientWrapper>
  )
}
