'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/user/auth'

export async function getKnowledgeGraphData(subjectId?: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const chapters = await prisma.chapter.findMany({
    where: subjectId ? { subjectId } : {},
    include: {
      subject: true,
      _count: { select: { questions: true, lessons: true } },
    },
  })

  const attempts = await prisma.userAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: { isCorrect: true, question: { select: { chapterId: true } } },
  })

  const nodes = chapters.map((chapter) => {
    const chapterAttempts = attempts.filter((a) => a.question.chapterId === chapter.id)
    const totalAttempts = chapterAttempts.length
    const correctAttempts = chapterAttempts.filter((a) => a.isCorrect).length

    const mastery = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

    let status: 'locked' | 'started' | 'mastered' = 'locked'
    if (mastery > 70) status = 'mastered'
    else if (totalAttempts > 0) status = 'started'

    return {
      id: chapter.id,
      data: {
        label: chapter.title,
        subject: chapter.subject.name,
        mastery,
        status,
        stats: {
          questions: chapter._count.questions,
          lessons: chapter._count.lessons,
        },
      },
      position: { x: chapter.x || Math.random() * 500, y: chapter.y || Math.random() * 500 },
      type: 'knowledgeNode',
    }
  })

  // 前置关系表已下线，先返回空边集合
  const edges: Array<{
    id: string
    source: string
    target: string
    animated: boolean
    style: { stroke: string; strokeWidth: number }
  }> = []

  return { nodes, edges }
}
