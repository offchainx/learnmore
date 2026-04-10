import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { getCurrentUser } from '@/actions/user/auth'
import { getLessonData, getSubjectDetails } from '@/actions/courses/subject'
import prisma from '@/lib/prisma'
import { CourseNavigation, LessonVideoPlayer } from '@/components/business/courses'
import { LessonCompletionButton } from '@/components/courses/LessonCompletionButton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, BookOpen, CheckCircle2, FileText, PlayCircle } from 'lucide-react'

function renderLessonContent(content: string | null | undefined) {
  if (!content) {
    return (
      <div className="rounded-2xl border border-dashed border-borderTone bg-surface-subtle p-6 text-sm text-text-secondary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        当前课时没有正文内容。
      </div>
    )
  }

  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ subjectId: string; lessonId: string }>
}) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }

  const { subjectId, lessonId } = await params
  const [subjectResult, lessonResult] = await Promise.all([
    getSubjectDetails(subjectId),
    getLessonData(lessonId),
  ])

  if (lessonResult.success && lessonResult.data) {
    const lesson = lessonResult.data.lesson
    if (lesson.chapter.subjectId !== subjectId) {
      notFound()
    }

    const subjectName = subjectResult.success && subjectResult.data ? subjectResult.data.name : lesson.chapter.subject.name
    const isCompleted = lessonResult.data.userProgress?.isCompleted ?? false
    const progress = lessonResult.data.userProgress?.progress ?? 0

    return (
      <div className="space-y-6">
        <Card className="border-borderTone bg-surface/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary dark:text-slate-300">
            <Link href={`/course/${subjectId}`} className="inline-flex items-center gap-2 rounded-full border border-borderTone bg-surface-subtle px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <ArrowLeft className="h-3.5 w-3.5" />
              返回科目页
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-borderTone bg-surface-subtle px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
              <BookOpen className="h-3.5 w-3.5" />
              {subjectName}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-borderTone bg-surface-subtle px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
              {lesson.type === 'VIDEO' ? <PlayCircle className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              {lesson.type}
            </span>
            {isCompleted ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                已完成
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-text-primary dark:text-white">{lesson.title}</h1>
            <p className="text-sm text-text-secondary dark:text-slate-300">
              章节：{lesson.chapter.title} · 完成进度：{Math.round(progress)}%
            </p>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            {lesson.videoUrl ? (
              <Card className="overflow-hidden border-borderTone bg-surface/95 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <LessonVideoPlayer
                  lessonId={lesson.id}
                  videoUrl={lesson.videoUrl}
                  initialPosition={lessonResult.data.userProgress?.lastPosition ?? 0}
                />
              </Card>
            ) : null}

            <Card className="border-borderTone bg-surface/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 text-sm font-semibold text-text-primary dark:text-white">课时内容</div>
              {renderLessonContent(lesson.content)}
            </Card>

            <div className="flex flex-wrap gap-3">
              <LessonCompletionButton lessonId={lesson.id} duration={lesson.duration} />
              <Button asChild variant="outline">
                <Link href={`/course/${subjectId}`}>
                  回到科目页
                </Link>
              </Button>
            </div>

            <CourseNavigation
              subjectId={subjectId}
              nextLessonId={lessonResult.data.nextLessonId}
              isCompleted={isCompleted}
            />
          </div>

          <Card className="h-fit border-borderTone bg-surface/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="text-sm font-semibold text-text-primary dark:text-white">课时信息</div>
            <div className="mt-4 space-y-4 text-sm text-text-secondary dark:text-slate-300">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-text-tertiary dark:text-slate-400">章节路径</div>
                <div className="mt-1">{lesson.chapter.title}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-text-tertiary dark:text-slate-400">课时类型</div>
                <div className="mt-1">{lesson.type}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-text-tertiary dark:text-slate-400">建议时长</div>
                <div className="mt-1">{lesson.duration ? `${lesson.duration} 秒` : '未配置'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-text-tertiary dark:text-slate-400">奖励</div>
                <div className="mt-1">{lesson.xpReward} XP</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      subjectId: true,
      subject: { select: { name: true } },
      children: {
        orderBy: { order: 'asc' },
        select: { id: true, title: true },
      },
      lessons: {
        orderBy: { order: 'asc' },
        select: { id: true, title: true, type: true },
      },
    },
  })

  if (!chapter || chapter.subjectId !== subjectId) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Card className="border-borderTone bg-surface/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary dark:text-slate-300">
          <Link href={`/course/${subjectId}`} className="inline-flex items-center gap-2 rounded-full border border-borderTone bg-surface-subtle px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回科目页
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-borderTone bg-surface-subtle px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800">
            <BookOpen className="h-3.5 w-3.5" />
            {chapter.subject.name}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-text-primary dark:text-white">{chapter.title}</h1>
          <p className="text-sm text-text-secondary dark:text-slate-300">
            当前章节暂未挂载 `Lesson` 记录，系统会先展示章节结构，待课时同步后可直接进入真实课时页。
          </p>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-borderTone bg-surface/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm font-semibold text-text-primary dark:text-white">章节内容</div>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-dashed border-borderTone bg-surface-subtle p-6 text-sm text-text-secondary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              该章节当前只有结构，没有真正的课时正文。你可以先回到科目页，或进入下方子章节继续浏览。
            </div>

            {chapter.lessons.length > 0 ? (
              <div className="space-y-3">
                {chapter.lessons.map((lessonItem) => (
                  <Button key={lessonItem.id} asChild variant="outline" className="h-auto justify-start rounded-2xl px-4 py-4 text-left">
                    <Link href={`/course/${subjectId}/${lessonItem.id}`}>
                      <div>
                        <div className="font-semibold">{lessonItem.title}</div>
                        <div className="mt-1 text-xs text-text-tertiary dark:text-slate-400">{lessonItem.type}</div>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            ) : null}

            {chapter.children.length > 0 ? (
              <div className="space-y-3">
                {chapter.children.map((child) => (
                  <Button key={child.id} asChild variant="outline" className="h-auto justify-start rounded-2xl px-4 py-4 text-left">
                    <Link href={`/course/${subjectId}/${child.id}`}>
                      <div>
                        <div className="font-semibold">{child.title}</div>
                        <div className="mt-1 text-xs text-text-tertiary dark:text-slate-400">进入子章节</div>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="h-fit border-borderTone bg-surface/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-sm font-semibold text-text-primary dark:text-white">章节状态</div>
          <div className="mt-4 space-y-3 text-sm text-text-secondary dark:text-slate-300">
            <div>课时数：{chapter.lessons.length}</div>
            <div>子章节数：{chapter.children.length}</div>
          </div>
        </Card>
      </div>
    </div>
  )
}

