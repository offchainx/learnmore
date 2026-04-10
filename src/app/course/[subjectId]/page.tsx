import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getSubjectDetails } from '@/actions/courses/subject'
import { findFirstCourseLeaf, countCourseLeaves, countCourseNodes } from '@/lib/course-tree'
import { ArrowRight, BookOpen, Layers3 } from 'lucide-react'

export default async function CourseIndexPage({
  params,
}: {
  params: Promise<{ subjectId: string }>
}) {
  const { subjectId } = await params
  const subjectResult = await getSubjectDetails(subjectId)

  if (!subjectResult.success || !subjectResult.data) {
    notFound()
  }

  const { name, chapters } = subjectResult.data
  const firstEntry = findFirstCourseLeaf(chapters) ?? chapters[0] ?? null
  const totalNodes = countCourseNodes(chapters)
  const totalLeaves = countCourseLeaves(chapters)

  return (
    <div className="space-y-6">
      <Card className="border-borderTone bg-surface/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-borderTone bg-surface-subtle px-3 py-1 text-xs font-semibold text-text-secondary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <BookOpen className="h-3.5 w-3.5" />
              课程入口
            </div>
            <h1 className="text-2xl font-semibold text-text-primary dark:text-white">{name}</h1>
            <p className="max-w-2xl text-sm leading-6 text-text-secondary dark:text-slate-300">
              这里展示当前科目的章节结构。你可以从左侧目录进入任一章节，或从下方继续到第一个可进入节点。
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-xs text-text-tertiary dark:text-slate-400">节点总数</div>
              <div className="mt-1 text-lg font-semibold text-text-primary dark:text-white">{totalNodes}</div>
            </div>
            <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-xs text-text-tertiary dark:text-slate-400">可进入节点</div>
              <div className="mt-1 text-lg font-semibold text-text-primary dark:text-white">{totalLeaves}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {firstEntry ? (
            <Button asChild>
              <Link href={`/course/${subjectId}/${firstEntry.id}`}>
                继续学习
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href="/dashboard/courses">
              返回课程中心
            </Link>
          </Button>
        </div>
      </Card>

      <Card className="border-borderTone bg-surface/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary dark:text-white">
          <Layers3 className="h-4 w-4 text-primary" />
          当前章节结构
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {chapters.map((chapter) => {
            const targetId = findFirstCourseLeaf([chapter])?.id ?? chapter.id
            return (
              <Button
                key={chapter.id}
                asChild
                variant="outline"
                className="h-auto justify-start rounded-2xl border-borderTone px-4 py-4 text-left"
              >
                <Link href={`/course/${subjectId}/${targetId}`}>
                  <div>
                    <div className="font-semibold">{chapter.title}</div>
                    <div className="mt-1 text-xs text-text-tertiary dark:text-slate-400">
                      点击进入该章节的首个可学习节点
                    </div>
                  </div>
                </Link>
              </Button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
