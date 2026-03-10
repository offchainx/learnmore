import { Suspense } from "react"
import Link from "next/link"
import { getQuestions, getPendingReviewQuestions } from "@/actions/content-pipeline/question-service"
import { getAllSubjects } from "@/actions/courses/subject"
import { QuestionReviewTable } from "@/components/admin/questions"
import { SubjectFilter } from "@/components/admin/common"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { QuestionFilter } from "@/lib/content-pipeline/types"
import { ContentStatus } from "@prisma/client"
import { AdminClientWrapper } from "@/components/admin/common"
import { getProfile } from "@/actions/user/profile"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

interface AdminContentPageProps {
  searchParams: Promise<{
    page?: string
    subjectId?: string
    status?: string
    tab?: string
  }>
}

export default async function AdminContentPage({ searchParams }: AdminContentPageProps) {
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
    status: statusFilter
  }

  // Fetch data in parallel
  const [questionsResult, subjectsResult] = await Promise.all([
    currentTab === 'pending'
      ? getPendingReviewQuestions({ page, pageSize: 20 }, filter)
      : getQuestions({ page, pageSize: 20 }, filter),
    getAllSubjects()
  ])

  const questions = questionsResult.data || []
  const buildTabHref = (tab: string) => {
    const params = new URLSearchParams()
    params.set('tab', tab)
    if (subjectId) params.set('subjectId', subjectId)
    return `?${params.toString()}`
  }
  const subjects = (subjectsResult.success && subjectsResult.data) ? subjectsResult.data.map(s => ({
    id: s.id,
    name: s.name,
    slug: (s as any).slug || s.name.toLowerCase(), // Ensure slug is present
    order: s.order,
    icon: s.icon
  })) : []

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">内容管理</h1>
            <p className="text-muted-foreground">
              管理题目内容，审核待发布的题目。
            </p>
          </div>
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-100 dark:border-slate-800 p-6">
            <CardTitle className="text-xl">题目列表</CardTitle>
            <CardDescription>
              查看和管理所有题目内容。
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="inline-flex items-center gap-1 bg-slate-100/60 dark:bg-slate-800/60 p-1 rounded-xl">
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
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          isActive
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </Link>
                    )
                  })}
                </div>

                <div className="flex items-center space-x-2">
                  <SubjectFilter subjects={subjects} />
                </div>
              </div>

              <Suspense fallback={<div className="h-48 flex items-center justify-center text-slate-400">加载中...</div>}>
                <QuestionReviewTable 
                  questions={questions}
                  total={questionsResult.total}
                  page={questionsResult.page}
                  totalPages={questionsResult.totalPages}
                />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminClientWrapper>
  )
}
