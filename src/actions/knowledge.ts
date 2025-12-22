'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'

export async function getKnowledgeGraphData(subjectId?: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Fetch Chapters and their relations
  const chapters = await prisma.chapter.findMany({
    where: subjectId ? { subjectId } : {},
    include: {
      prerequisites: true,
      subject: true,
      _count: {
        select: { questions: true, lessons: true }
      }
    }
  })

  // 2. Fetch User Mastery Data
  const [, , attempts] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId: user.id, isCompleted: true },
      select: { lessonId: true }
    }),
    prisma.errorBook.findMany({
      where: { userId: user.id },
      select: { questionId: true }
    }),
    prisma.userAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { questionId: true, isCorrect: true, question: { select: { chapterId: true } } }
    })
  ])

  // Note: These sets could be used for future mastery calculation features
  // const completedLessonIds = new Set(completedLessons.map(l => l.lessonId))
  // const errorQuestionIds = new Set(errorBookEntries.map(e => e.questionId))

  // 3. Map to Graph Format (React Flow style)
  const nodes = chapters.map((chapter) => {
    // Calculate Mastery Score for this chapter
    const chapterAttempts = attempts.filter(a => a.question.chapterId === chapter.id)
    const totalAttempts = chapterAttempts.length
    const correctAttempts = chapterAttempts.filter(a => a.isCorrect).length
    
    let mastery = 0
    if (totalAttempts > 0) {
      mastery = Math.round((correctAttempts / totalAttempts) * 100)
    }

    // Determine status color
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
          lessons: chapter._count.lessons
        }
      },
      position: { x: chapter.x || Math.random() * 500, y: chapter.y || Math.random() * 500 },
      type: 'knowledgeNode',
    }
  })

  const edges = chapters.flatMap((chapter) => 
    chapter.prerequisites.map((pre) => ({
      id: `e-${pre.prerequisiteId}-${chapter.id}`,
      source: pre.prerequisiteId,
      target: chapter.id,
      animated: nodes.find(n => n.id === pre.prerequisiteId)?.data.status === 'mastered',
      style: { stroke: '#6366f1', strokeWidth: 2 },
    }))
  )

  return { nodes, edges }
}
