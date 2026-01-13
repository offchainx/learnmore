'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { QuestionType } from '@prisma/client'

interface CreateQuestionInput {
  content: string
  type: string
  options?: Record<string, string> | null
  answer: string | string[] | null
  explanation: string | null
  difficulty?: number | null
}

export async function createQuestion(data: CreateQuestionInput) {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Map string type to Prisma Enum
  let prismaType: QuestionType
  switch (data.type) {
    case 'SINGLE_CHOICE': prismaType = QuestionType.SINGLE_CHOICE; break;
    case 'MULTIPLE_CHOICE': prismaType = QuestionType.MULTIPLE_CHOICE; break;
    case 'FILL_BLANK': prismaType = QuestionType.FILL_BLANK; break;
    case 'ESSAY': prismaType = QuestionType.ESSAY; break;
    default: prismaType = QuestionType.SINGLE_CHOICE;
  }

  // Find or Create a default chapter for imported questions
  // In a real app, this should be selected by the user
  let chapter = await prisma.chapter.findFirst({
    where: { title: 'Imported Questions' }
  })
  
  if (!chapter) {
    // Try to find a subject first
    let subject = await prisma.subject.findFirst({
      where: { name: 'General' }
    })
    
    if (!subject) {
        subject = await prisma.subject.upsert({
            where: { name: 'General' },
            update: {},
            create: { name: 'General', order: 999 }
        })
    }
    
    chapter = await prisma.chapter.create({
      data: {
        title: 'Imported Questions',
        subjectId: subject.id
      }
    })
  }

  // 验证必填字段
  if (!data.content || !data.content.trim()) {
    throw new Error('Question content is required')
  }

  if (!data.answer) {
    throw new Error('Answer is required. Please fill in the answer field before saving.')
  }

  const question = await prisma.question.create({
    data: {
      content: data.content,
      type: prismaType,
      options: data.options || undefined,
      answer: data.answer,
      explanation: data.explanation || '', // 默认为空字符串
      difficulty: data.difficulty || 3,
      chapterId: chapter.id
    }
  })

  console.log('✅ [DB] 题目已保存:', question.id);
  return { success: true, id: question.id }
}
