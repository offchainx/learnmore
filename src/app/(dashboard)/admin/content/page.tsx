import { Suspense } from "react"
import Link from "next/link"
import { getQuestions } from "@/actions/content-pipeline/question-service"
import { getAllSubjects } from "@/actions/subject"
import { QuestionReviewTable } from "@/components/admin/QuestionReviewTable"
import { SubjectFilter } from "@/components/admin/SubjectFilter"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuestionFilter } from "@/lib/content-pipeline/types"
import { ContentStatus } from "@prisma/client"

export const dynamic = 'force-dynamic'

interface AdminContentPageProps {
  searchParams: {
    page?: string
    subjectId?: string
    status?: string
    tab?: string
  }
}

export default async function AdminContentPage({ searchParams }: AdminContentPageProps) {
  // Parse search params
  const page = Number(searchParams.page) || 1
  const subjectId = searchParams.subjectId
  const statusParam = searchParams.status
  const currentTab = searchParams.tab || 'all'

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
    getQuestions({ page, pageSize: 20 }, filter),
    getAllSubjects()
  ])

  const questions = questionsResult.data || []
  const subjects = (subjectsResult.success && subjectsResult.data) ? subjectsResult.data.map(s => ({
    id: s.id,
    name: s.name,
    slug: (s as any).slug || s.name.toLowerCase(), // Ensure slug is present
    order: s.order,
    icon: s.icon
  })) : []

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">内容管理</h1>
          <p className="text-muted-foreground">
            管理题目内容，审核待发布的题目。
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>题目列表</CardTitle>
          <CardDescription>
            查看和管理所有题目内容。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <Tabs defaultValue={currentTab} className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="all" asChild>
                    <Link href="?tab=all">全部</Link>
                  </TabsTrigger>
                  <TabsTrigger value="pending" asChild>
                    <Link href="?tab=pending">待审核</Link>
                  </TabsTrigger>
                  <TabsTrigger value="published" asChild>
                    <Link href="?tab=published">已发布</Link>
                  </TabsTrigger>
                  <TabsTrigger value="rejected" asChild>
                    <Link href="?tab=rejected">已驳回</Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center space-x-2">
                <SubjectFilter subjects={subjects} />
              </div>
            </div>

            <Suspense fallback={<div className="h-48 flex items-center justify-center">加载中...</div>}>
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
  )
}