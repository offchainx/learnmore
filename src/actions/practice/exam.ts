'use server'

/**
 * Mock Arena (模拟考场) Server Actions
 * 试卷生成 + 考试管理
 */

import prisma from '@/lib/prisma'
import type { Question, PracticeMode, Prisma } from '@prisma/client'

// ============ 类型定义 ============

export type ExamDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface ExamConfig {
  subjectId: string
  difficulty: ExamDifficulty
  totalQuestions: number
  timeLimitMinutes: number // 考试时长（分钟）
}

export type ExamQuestion = Question

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
): Promise<Question[]> {
  // 1. 获取难度分布
  const distribution = DIFFICULTY_DISTRIBUTION[difficulty]

  // 2. 计算各难度题目数量
  const easyCount = Math.round(totalQuestions * distribution.easy)
  const hardCount = Math.round(totalQuestions * distribution.hard)
  const mediumCount = totalQuestions - easyCount - hardCount

  // 3. 获取该科目的所有章节
  const chapters = await prisma.chapter.findMany({
    where: { subjectId },
    select: { id: true }
  })

  if (chapters.length === 0) {
    return []
  }

  const chapterIds = chapters.map(c => c.id)

  // 4. 按难度分别抽取题目
  const [easyQuestions, mediumQuestions, hardQuestions] = await Promise.all([
    getQuestionsByDifficulty(chapterIds, DIFFICULTY_LEVELS.easy, easyCount),
    getQuestionsByDifficulty(chapterIds, DIFFICULTY_LEVELS.medium, mediumCount),
    getQuestionsByDifficulty(chapterIds, DIFFICULTY_LEVELS.hard, hardCount),
  ])

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
): Promise<Question[]> {
  if (count <= 0) return []

  // 查询所有符合条件的题目ID
  const candidates = await prisma.question.findMany({
    where: {
      chapterId: { in: chapterIds },
      difficulty: { in: difficultyLevels }
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
    where: { id: { in: shuffled } }
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
        error: 'No questions available for this subject'
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
      questions: questions as ExamQuestion[]
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
    // 1. 验证考试记录存在且属于该用户
    const examRecord = await prisma.examRecord.findFirst({
      where: {
        id: examRecordId,
        userId
      }
    })

    if (!examRecord) {
      return {
        success: false,
        error: 'Exam record not found'
      }
    }

    // 2. 检查是否已提交（duration 不为 null 表示已完成）
    if (examRecord.duration !== null) {
      return {
        success: false,
        error: 'Exam already submitted'
      }
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

    // 6. 更新 ExamRecord
    await prisma.examRecord.update({
      where: { id: examRecordId },
      data: {
        score,
        correctCount,
        duration
      }
    })

    // 7. 批量创建 UserAttempt 记录
    const attemptData: Prisma.UserAttemptCreateManyInput[] = results.map(r => ({
      userId,
      questionId: r.questionId,
      examRecordId,
      userAnswer: r.userAnswer as Prisma.InputJsonValue,
      isCorrect: r.isCorrect,
      duration: Math.round(duration / answers.length) // 平均每题时间
    }))

    await prisma.userAttempt.createMany({
      data: attemptData
    })

    // 8. 错题加入错题本
    const wrongAnswers = results.filter(r => !r.isCorrect)
    if (wrongAnswers.length > 0) {
      await addToErrorBook(userId, wrongAnswers.map(w => w.questionId))
    }

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
  if (questionType === 'SINGLE_CHOICE' || questionType === 'FILL_BLANK') {
    const uStr = (Array.isArray(userAnswer) ? userAnswer[0] : userAnswer) || ''
    const cStr = (Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer) || ''
    return uStr.trim().toLowerCase() === cStr.trim().toLowerCase()
  }

  if (questionType === 'MULTIPLE_CHOICE') {
    const uArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
    const cArr = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]

    if (uArr.length !== cArr.length) return false

    const sortedU = [...uArr].sort()
    const sortedC = [...cArr].sort()

    return sortedU.every((val, idx) => val === sortedC[idx])
  }

  return false
}

/**
 * 将错题加入错题本
 */
async function addToErrorBook(userId: string, questionIds: string[]): Promise<void> {
  for (const questionId of questionIds) {
    await prisma.errorBook.upsert({
      where: {
        userId_questionId: { userId, questionId }
      },
      create: {
        userId,
        questionId,
        masteryLevel: 0
      },
      update: {
        masteryLevel: 0, // 重置掌握度
        updatedAt: new Date()
      }
    })
  }
}
