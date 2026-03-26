import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ContentStatus } from '@prisma/client'
import { getCurrentUser } from '@/actions/user/auth'
import prisma from '@/lib/prisma'
import { QuizView } from '@/components/business/quiz/QuizView'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Past Year Paper | LearnMore',
  description: 'Practice real past-year papers from published questions',
}

interface PageProps {
  params: Promise<{
    paperId: string
  }>
  searchParams: Promise<{
    subjectId?: string
  }>
}

export default async function PastPaperPage({ params, searchParams }: PageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const { paperId } = await params
  const resolvedSearchParams = await searchParams

  const questions = await prisma.question.findMany({
    where: {
      paperId,
      isPastPaper: true,
      status: ContentStatus.PUBLISHED,
    },
    orderBy: { createdAt: 'asc' },
  })

  if (questions.length === 0) {
    redirect('/dashboard/practice')
  }

  const chapterId = questions.find((question) => question.chapterId)?.chapterId
  const subjectId =
    resolvedSearchParams.subjectId ||
    questions.find((q) => q.subjectId)?.subjectId
  const practiceCenterHref = subjectId
    ? `/dashboard/practice?subjectId=${encodeURIComponent(subjectId)}`
    : '/dashboard/practice'
  const subject = subjectId
    ? await prisma.subject.findUnique({ where: { id: subjectId }, select: { name: true } })
    : null
  const subjectName = subject?.name || 'Subject'
  const paperTitle = questions[0].source || `Past Paper ${paperId}`

  return (
    <div className="mx-auto w-full max-w-[1680px] px-3 py-2 sm:px-4 sm:py-4">
      {questions.length === 0 ? (
        <div className="rounded-xl border border-borderTone dark:border-slate-800 p-6 bg-surface-subtle dark:bg-slate-900 space-y-4">
          <p className="text-sm text-text-secondary dark:text-slate-300">当前这套真题还没有可用题目。</p>
          <Button asChild variant="outline">
            <Link href={practiceCenterHref}>返回练习中心</Link>
          </Button>
        </div>
      ) : (
        <QuizView
          userId={user.id}
          title={paperTitle}
          modeLabel="Past Year Paper"
          subtitle={`${subjectName} · 整套真题统一作答，完成后一次性交卷。`}
          mode="PAST_PAPER"
          chapterId={chapterId || undefined}
          subjectId={subjectId || undefined}
          questions={questions}
          submitLabel="提交真题"
          refreshLabel="重载真题"
          exitLabel="退出真题"
          resultTitle="真题练习完成"
          resultSubtitle="这一套真题已经完成，下面是整卷结果摘要。"
          recommendation="先看整卷错题分布，再决定是否回到章节地图补薄弱章节。"
          theme="indigo"
          rightPanelNote="历年真题更适合按整套卷完成，先做完整卷再回看结果，会更接近真实考试体验。"
        />
      )}
    </div>
  );
}
