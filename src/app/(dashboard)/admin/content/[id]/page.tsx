import { notFound, redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { QuestionQualityChecker } from '@/lib/content-pipeline/quality-checker'
import { QuestionReviewPanel } from '@/components/admin/QuestionReviewPanel'
import { QuestionPreview } from '@/components/admin/QuestionPreview'
import { QualityCheckDisplay } from '@/components/admin/QualityCheckDisplay'
import { getCurrentUser } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import type { QuestionWithRelations } from '@/lib/content-pipeline/types'

export default async function QuestionReviewDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  // 获取当前用户
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  // Await params to access id
  const { id } = await params

  // 检查权限 (简化版，实际应检查 role)
  // if (!['ADMIN', 'TEACHER'].includes(user.role)) {
  //   redirect('/dashboard')
  // }

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      chapter: { include: { subject: true } },
      group: true,
      tags: { include: { tag: true } },
      knowledgePoints: { include: { kp: true } },
      sourceFiles: true,
      _count: {
        select: {
          attempts: true,
          errorBook: true
        }
      }
    }
  })

  if (!question) {
    notFound()
  }

  // 运行质量检查
  const checker = new QuestionQualityChecker()
  // Cast to unknown first if types mismatch due to Prisma version diffs, but usually compatible
  const qualityResult = await checker.check(question as unknown as any)

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/content">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">题目审核</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：题目预览 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 题目内容卡片 */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">预览效果</h2>
            <QuestionPreview question={question as unknown as QuestionWithRelations} />
          </div>

          {/* 质量检查结果 */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
             <h2 className="text-lg font-semibold mb-4">质量检查报告</h2>
             <QualityCheckDisplay result={qualityResult} />
          </div>

          {/* OCR原文（如果有） */}
          {question.ocrRawText && (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">OCR 原文</h2>
              <div className="bg-muted p-4 rounded-md overflow-x-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                  {question.ocrRawText}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：审核面板 */}
        <div>
          <QuestionReviewPanel
            question={question as unknown as QuestionWithRelations}
            qualityResult={qualityResult}
            reviewerId={user.id}
          />
        </div>
      </div>
    </div>
  )
}
