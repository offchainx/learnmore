'use server'

/**
 * Mock Arena (模拟考场) Server Actions
 * 试卷生成 + 考试管理
 */

import prisma from '@/lib/prisma'
import { QuestionType } from '@prisma/client'
import type { PracticeMode, Prisma } from '@prisma/client'
import { applyPracticeSubmissionEffects } from './submission-effects'
import { recalibrateQuestionDifficulties } from './submission-core'
import { isRelaxedPracticeAnswerCorrect } from '@/lib/practice/answer-evaluation'
import {
  practiceQuestionWithGroupInclude,
  type PracticeQuestionRecord,
} from '@/lib/practice/question-groups'

// ============ 类型定义 ============

export type ExamDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface ExamConfig {
  subjectId: string
  difficulty: ExamDifficulty
  totalQuestions: number
  timeLimitMinutes: number // 考试时长（分钟）
}

export type ExamQuestion = PracticeQuestionRecord

export interface ExamResult {
  examRecordId: string
  score: number
  totalQuestions: number
  correctCount: number
  duration: number // 实际用时（秒）
  questions: Array<{
    questionId: string
    userAnswer: string | string[]
    correctAnswer: string | string[]
    isCorrect: boolean
    explanation: string | null
  }>
}

export interface StartExamResult {
  success: boolean
  examRecordId?: string
  questions?: ExamQuestion[]
  error?: string
}

export interface SubmitExamResult {
  success: boolean
  result?: ExamResult
  error?: string
}

// ============ 难度分布配置 ============

const DIFFICULTY_DISTRIBUTION: Record<ExamDifficulty, { easy: number; medium: number; hard: number }> = {
  EASY: { easy: 0.5, medium: 0.4, hard: 0.1 },
  MEDIUM: { easy: 0.3, medium: 0.5, hard: 0.2 },
  HARD: { easy: 0.1, medium: 0.4, hard: 0.5 },
}

// 难度映射: 1-2=easy, 3=medium, 4-5=hard
const DIFFICULTY_LEVELS = {
  easy: [1, 2],
  medium: [3],
  hard: [4, 5],
}

const PRACTICE_SUPPORTED_TYPES: QuestionType[] = [
  QuestionType.SINGLE_CHOICE,
  QuestionType.MULTIPLE_CHOICE,
  QuestionType.FILL_BLANK,
  QuestionType.ESSAY,
  QuestionType.TRUE_FALSE,
  QuestionType.MCQ,
]

// ============ A: 生成模拟试卷 ============

/**
 * 根据难度分布生成模拟试卷
 *
 * @param subjectId - 科目ID
 * @param difficulty - 整体难度 (EASY/MEDIUM/HARD)
 * @param totalQuestions - 总题目数量
 * @returns 打乱顺序的题目列表
 */
export async function generateMockExam(
  subjectId: string,
  difficulty: ExamDifficulty = 'MEDIUM',
  totalQuestions: number = 20
): Promise<PracticeQuestionRecord[]> {
  // 1. 获取难度分布
  const distribution = DIFFICULTY_DISTRIBUTION[difficulty]

  // 2. 计算各难度题目数量
  const easyCount = Math.round(totalQuestions * distribution.easy)
  const hardCount = Math.round(totalQuestions * distribution.hard)
  const mediumCount = totalQuestions - easyCount - hardCount

  // 3. 获取该科目的所有章节
  const chapters = await prisma.chapter.findMany({
    where: {
      subjectId,
      children: { none: {} },
    },
    select: { id: true }
  })

  if (chapters.length === 0) {
    return []
  }

  const chapterIds = chapters.map(c => c.id)

  // 4. 按难度分别抽取题目
  const easyQuestions = await getQuestionsByDifficulty(
    chapterIds,
    DIFFICULTY_LEVELS.easy,
    easyCount
  )
  const mediumQuestions = await getQuestionsByDifficulty(
    chapterIds,
    DIFFICULTY_LEVELS.medium,
    mediumCount
  )
  const hardQuestions = await getQuestionsByDifficulty(
    chapterIds,
    DIFFICULTY_LEVELS.hard,
    hardCount
  )

  // 5. 合并并打乱顺序
  const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions]

  // Fisher-Yates 洗牌算法
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]]
  }

  return allQuestions
}

/**
 * 按难度范围随机抽取题目
 */
async function getQuestionsByDifficulty(
  chapterIds: string[],
  difficultyLevels: number[],
  count: number
): Promise<PracticeQuestionRecord[]> {
  if (count <= 0) return []

  // 查询所有符合条件的题目ID
  const candidates = await prisma.question.findMany({
    where: {
      chapterId: { in: chapterIds },
      difficulty: { in: difficultyLevels },
      isPastPaper: false,
      deletedAt: null,
      type: { in: PRACTICE_SUPPORTED_TYPES },
      status: { in: ['PUBLISHED', 'VERIFIED'] },
    },
    select: { id: true }
  })

  if (candidates.length === 0) return []

  // 随机选择
  const shuffled = candidates
    .map(q => ({ id: q.id, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, count)
    .map(q => q.id)

  // 查询完整题目
  const questions = await prisma.question.findMany({
    where: { id: { in: shuffled } },
    include: practiceQuestionWithGroupInclude,
  })

  return questions
}

import { checkWeeklyExamQuota } from './quota'

// ============ B: 开始考试 ============

/**
 * 创建考试记录并返回题目列表
 *
 * @param userId - 用户ID
 * @param config - 考试配置
 * @returns 考试记录ID + 题目列表
 */
export async function startExam(
  userId: string,
  config: ExamConfig
): Promise<StartExamResult> {
  try {
    // 0. 检查配额
    const quota = await checkWeeklyExamQuota(userId)
    if (!quota.canProceed) {
      return {
        success: false,
        error: 'Weekly exam quota exceeded. Please upgrade to Standard or Smart Plus for more attempts.'
      }
    }

    // 1. 生成试卷
    const questions = await generateMockExam(
      config.subjectId,
      config.difficulty,
      config.totalQuestions
    )

    if (questions.length === 0) {
      return {
        success: false,
        error: '当前科目暂无可用于 Mock Arena 的题目'
      }
    }

    // 2. 获取科目名称
    const subject = await prisma.subject.findUnique({
      where: { id: config.subjectId },
      select: { name: true }
    })

    // 3. 创建 ExamRecord (初始状态: 进行中)
    // 使用 duration = null 表示考试进行中
    const examRecord = await prisma.examRecord.create({
      data: {
        userId,
        subjectId: config.subjectId,
        mode: 'MOCK_EXAM' as PracticeMode,
        title: `${subject?.name || 'Mock'} Exam - ${config.difficulty}`,
        score: 0,
        totalQuestions: questions.length,
        correctCount: 0,
        duration: null, // null 表示进行中
      }
    })

    return {
      success: true,
      examRecordId: examRecord.id,
      questions
    }
  } catch (error) {
    console.error('Failed to start exam:', error)
    return {
      success: false,
      error: 'Failed to start exam'
    }
  }
}

// ============ C: 提交考试 ============

export interface UserAnswerSubmission {
  questionId: string
  userAnswer: string | string[]
}

/**
 * 提交考试答案，批量判分
 *
 * @param examRecordId - 考试记录ID
 * @param userId - 用户ID
 * @param answers - 用户答案列表
 * @param duration - 实际用时（秒）
 * @returns 考试结果
 */
export async function submitExam(
  examRecordId: string,
  userId: string,
  answers: UserAnswerSubmission[],
  duration: number
): Promise<SubmitExamResult> {
  try {
    const buildExistingResult = async (): Promise<SubmitExamResult> => {
      const existing = await getExamResult(examRecordId, userId)
      if (!existing) {
        return {
          success: false,
          error: 'Exam record not found',
        }
      }

      return {
        success: true,
        result: existing,
      }
    }

    const examRecord = await prisma.examRecord.findFirst({
      where: {
        id: examRecordId,
        userId,
      },
    })

    if (!examRecord) {
      return {
        success: false,
        error: 'Exam record not found'
      }
    }

    if (examRecord.duration !== null) {
      return buildExistingResult()
    }

    // 3. 获取所有题目的正确答案
    const questionIds = answers.map(a => a.questionId)
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        answer: true,
        explanation: true,
        type: true
      }
    })

    const questionMap = new Map(questions.map(q => [q.id, q]))

    // 4. 批量判分
    const results: ExamResult['questions'] = []
    let correctCount = 0

    for (const submission of answers) {
      const question = questionMap.get(submission.questionId)
      if (!question) continue

      const correctAnswer = question.answer as string | string[]
      const isCorrect = checkAnswer(submission.userAnswer, correctAnswer, question.type)

      if (isCorrect) correctCount++

      results.push({
        questionId: submission.questionId,
        userAnswer: submission.userAnswer,
        correctAnswer,
        isCorrect,
        explanation: question.explanation
      })
    }

    // 5. 计算分数 (百分制)
    const score = Math.round((correctCount / answers.length) * 100)

    const attemptData: Prisma.UserAttemptCreateManyInput[] = results.map((r) => ({
      userId,
      questionId: r.questionId,
      examRecordId,
      userAnswer: r.userAnswer as Prisma.InputJsonValue,
      isCorrect: r.isCorrect,
      duration: answers.length > 0 ? Math.max(1, Math.round(duration / answers.length)) : null,
    }))

    const submissionState = await prisma.$transaction(async (tx) => {
      const updated = await tx.examRecord.updateMany({
        where: {
          id: examRecordId,
          userId,
          duration: null,
        },
        data: {
          score,
          correctCount,
          duration,
        },
      })

      if (updated.count === 0) {
        return { created: false as const }
      }

      if (attemptData.length > 0) {
        await tx.userAttempt.createMany({
          data: attemptData,
        })

        await recalibrateQuestionDifficulties(
          tx,
          attemptData.map((attempt) => attempt.questionId)
        )
      }

      return { created: true as const }
    })

    if (!submissionState.created) {
      return buildExistingResult()
    }

    await applyPracticeSubmissionEffects({
      userId,
      mode: 'MOCK_EXAM',
      correctCount,
      duration,
    })

    return {
      success: true,
      result: {
        examRecordId,
        score,
        totalQuestions: answers.length,
        correctCount,
        duration,
        questions: results
      }
    }
  } catch (error) {
    console.error('Failed to submit exam:', error)
    return {
      success: false,
      error: 'Failed to submit exam'
    }
  }
}

// ============ D: 获取考试结果 ============

/**
 * 获取已完成考试的详细结果
 */
export async function getExamResult(
  examRecordId: string,
  userId: string
): Promise<ExamResult | null> {
  try {
    const examRecord = await prisma.examRecord.findFirst({
      where: {
        id: examRecordId,
        userId,
        duration: { not: null } // 已完成的考试
      },
      include: {
        attempts: {
          include: {
            question: {
              select: {
                id: true,
                answer: true,
                explanation: true
              }
            }
          }
        }
      }
    })

    if (!examRecord) return null

    const questions = examRecord.attempts.map(attempt => ({
      questionId: attempt.questionId,
      userAnswer: attempt.userAnswer as string | string[],
      correctAnswer: attempt.question.answer as string | string[],
      isCorrect: attempt.isCorrect,
      explanation: attempt.question.explanation
    }))

    return {
      examRecordId,
      score: examRecord.score,
      totalQuestions: examRecord.totalQuestions,
      correctCount: examRecord.correctCount,
      duration: examRecord.duration || 0,
      questions
    }
  } catch (error) {
    console.error('Failed to get exam result:', error)
    return null
  }
}

// ============ 辅助函数 ============

/**
 * 检查答案是否正确
 */
function checkAnswer(
  userAnswer: string | string[],
  correctAnswer: string | string[],
  questionType: string
): boolean {
  return isRelaxedPracticeAnswerCorrect(questionType, userAnswer, correctAnswer)
}
