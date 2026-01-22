'use server'

/**
 * Practice Center Data Service
 * 练习中心统一数据访问层
 *
 * 提供可复用的数据查询方法，替换Mock数据
 */

import prisma from '@/lib/prisma'
import type { Question, Prisma } from '@prisma/client'
import type {
  ChapterWithStats,
  QuestionFilter,
  QuotaStatus,
  SubjectChaptersResult,
} from '@/lib/practice/types'
import { QUOTA_CONFIGS } from '@/lib/practice/types'

// ============ A2.1: 查询章节 + 掌握度 ============

/**
 * 获取单个章节信息及用户掌握度统计
 *
 * @param chapterId - 章节ID
 * @param userId - 用户ID
 * @returns 章节信息 + 统计数据
 */
export async function getChapterWithStats(
  chapterId: string,
  userId: string
): Promise<ChapterWithStats | null> {
  // 1. 查询章节基本信息
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      _count: {
        select: { questions: true }
      }
    }
  })

  if (!chapter) {
    return null
  }

  // 2. 查询用户在该章节的答题统计
  const totalAttempts = await prisma.userAttempt.count({
    where: {
      userId,
      question: {
        chapterId
      }
    }
  })

  // 统计正确数
  const correctCount = await prisma.userAttempt.count({
    where: {
      userId,
      isCorrect: true,
      question: {
        chapterId
      }
    }
  })

  // 3. 计算掌握度 (正确率 * 100)
  const masteryLevel = totalAttempts > 0
    ? Math.round((correctCount / totalAttempts) * 100)
    : 0

  return {
    id: chapter.id,
    title: chapter.title,
    subjectId: chapter.subjectId,
    parentId: chapter.parentId,
    order: chapter.order,
    stats: {
      totalAttempts,
      correctCount,
      masteryLevel,
      questionCount: chapter._count.questions
    }
  }
}

// ============ A2.2: 批量查询科目章节 ============

/**
 * 获取科目下所有章节及用户掌握度
 * 使用批量查询优化，避免N+1问题
 *
 * @param subjectId - 科目ID
 * @param userId - 用户ID
 * @returns 科目章节列表（带统计）
 */
export async function getSubjectChapters(
  subjectId: string,
  userId: string
): Promise<SubjectChaptersResult | null> {
  // 1. 查询科目信息
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId }
  })

  if (!subject) {
    return null
  }

  // 2. 查询该科目下所有章节及题目数
  const chapters = await prisma.chapter.findMany({
    where: { subjectId },
    include: {
      _count: {
        select: { questions: true }
      }
    },
    orderBy: { order: 'asc' }
  })

  if (chapters.length === 0) {
    return {
      subjectId,
      subjectName: subject.name,
      chapters: []
    }
  }

  const chapterIds = chapters.map(c => c.id)

  // 3. 批量查询用户在这些章节的答题统计（一次查询）
  const attemptStats = await prisma.userAttempt.groupBy({
    by: ['questionId'],
    where: {
      userId,
      question: {
        chapterId: { in: chapterIds }
      }
    },
    _count: {
      id: true
    }
  })

  // 4. 获取每个答题记录的正确性和章节关系
  const attemptsWithChapter = await prisma.userAttempt.findMany({
    where: {
      userId,
      question: {
        chapterId: { in: chapterIds }
      }
    },
    select: {
      isCorrect: true,
      question: {
        select: {
          chapterId: true
        }
      }
    }
  })

  // 5. 按章节聚合统计
  const chapterStatsMap = new Map<string, { total: number; correct: number }>()

  for (const attempt of attemptsWithChapter) {
    const cId = attempt.question.chapterId
    const existing = chapterStatsMap.get(cId) || { total: 0, correct: 0 }
    existing.total += 1
    if (attempt.isCorrect) {
      existing.correct += 1
    }
    chapterStatsMap.set(cId, existing)
  }

  // 6. 组装结果
  const chaptersWithStats: ChapterWithStats[] = chapters.map(chapter => {
    const stats = chapterStatsMap.get(chapter.id) || { total: 0, correct: 0 }
    const masteryLevel = stats.total > 0
      ? Math.round((stats.correct / stats.total) * 100)
      : 0

    return {
      id: chapter.id,
      title: chapter.title,
      subjectId: chapter.subjectId,
      parentId: chapter.parentId,
      order: chapter.order,
      stats: {
        totalAttempts: stats.total,
        correctCount: stats.correct,
        masteryLevel,
        questionCount: chapter._count.questions
      }
    }
  })

  return {
    subjectId,
    subjectName: subject.name,
    chapters: chaptersWithStats
  }
}

// ============ A2.3: 智能随机抽题 ============

/**
 * 根据筛选条件随机抽取题目
 * 支持排除最近N天做过的题
 *
 * @param filters - 筛选条件
 * @returns 随机题目列表
 */
export async function getRandomQuestions(
  filters: QuestionFilter
): Promise<Question[]> {
  const {
    chapterIds,
    subjectId,
    difficulty,
    types,
    excludeRecentDays = 30,
    limit = 10,
    userId
  } = filters

  // 1. 构建基础查询条件
  const whereCondition: Prisma.QuestionWhereInput = {}

  // 章节筛选
  if (chapterIds && chapterIds.length > 0) {
    whereCondition.chapterId = { in: chapterIds }
  } else if (subjectId) {
    // 如果没有指定章节但指定了科目，查询该科目下所有章节的题目
    whereCondition.chapter = {
      subjectId
    }
  }

  // 难度筛选
  if (difficulty && difficulty.length > 0) {
    whereCondition.difficulty = { in: difficulty }
  }

  // 题型筛选
  if (types && types.length > 0) {
    whereCondition.type = { in: types }
  }

  // 2. 排除最近做过的题（如果提供了userId）
  let excludeQuestionIds: string[] = []

  if (userId && excludeRecentDays > 0) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - excludeRecentDays)

    const recentAttempts = await prisma.userAttempt.findMany({
      where: {
        userId,
        createdAt: { gte: cutoffDate }
      },
      select: {
        questionId: true
      },
      distinct: ['questionId']
    })

    excludeQuestionIds = recentAttempts.map(a => a.questionId)
  }

  if (excludeQuestionIds.length > 0) {
    whereCondition.id = { notIn: excludeQuestionIds }
  }

  // 3. 先查询所有符合条件的题目ID（性能优化：避免在大数据集上直接random）
  const candidateQuestions = await prisma.question.findMany({
    where: whereCondition,
    select: { id: true }
  })

  if (candidateQuestions.length === 0) {
    return []
  }

  // 4. 随机选择N个ID
  const shuffled = candidateQuestions
    .map(q => ({ id: q.id, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, limit)
    .map(q => q.id)

  // 5. 查询完整题目信息
  const questions = await prisma.question.findMany({
    where: {
      id: { in: shuffled }
    }
  })

  // 保持随机顺序
  const idOrder = new Map(shuffled.map((id, index) => [id, index]))
  questions.sort((a, b) => (idOrder.get(a.id) || 0) - (idOrder.get(b.id) || 0))

  return questions
}

// ============ A2.4: 查询用户配额状态 ============

/**
 * 获取用户当前配额使用状态
 *
 * @param userId - 用户ID
 * @returns 配额状态
 */
export async function getUserQuotaStatus(
  userId: string
): Promise<QuotaStatus | null> {
  // 1. 查询用户信息
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      aiTokenBalance: true
    }
  })

  if (!user) {
    return null
  }

  // 2. 获取该角色的配额配置
  const config = QUOTA_CONFIGS[user.role]

  // 3. 计算今日开始时间（UTC 00:00）
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  // 4. 查询今日答题数
  const dailyQuestionsUsed = await prisma.userAttempt.count({
    where: {
      userId,
      createdAt: { gte: todayStart }
    }
  })

  // 5. 计算本周开始时间（周一 00:00 UTC）
  const weekStart = getWeekStartDate(new Date())

  // 6. 查询本周考试次数
  const weeklyExamsUsed = await prisma.examRecord.count({
    where: {
      userId,
      createdAt: { gte: weekStart }
    }
  })

  // 7. 计算剩余配额
  const dailyLimit = config.dailyQuestionLimit
  const weeklyLimit = config.weeklyExamLimit

  const dailyQuestionsRemaining = dailyLimit === -1
    ? -1  // 无限制
    : Math.max(0, dailyLimit - dailyQuestionsUsed)

  const weeklyExamsRemaining = weeklyLimit === -1
    ? -1  // 无限制
    : Math.max(0, weeklyLimit - weeklyExamsUsed)

  // 8. 判断是否付费用户
  const isPremium = ['PRO', 'ULTIMATE', 'TEACHER', 'ADMIN'].includes(user.role)

  return {
    dailyQuestionsUsed,
    dailyQuestionsLimit: dailyLimit,
    dailyQuestionsRemaining,
    weeklyExamsUsed,
    weeklyExamsLimit: weeklyLimit,
    weeklyExamsRemaining,
    aiTokensRemaining: user.aiTokenBalance,
    userRole: user.role,
    isPremium
  }
}

// ============ 辅助函数 ============

/**
 * 获取本周一的日期（UTC）
 */
function getWeekStartDate(date: Date): Date {
  const d = new Date(date)
  const day = d.getUTCDay()
  // 如果是周日(0)，则回退6天；否则回退 day-1 天
  const diff = day === 0 ? 6 : day - 1
  d.setUTCDate(d.getUTCDate() - diff)
  d.setUTCHours(0, 0, 0, 0)
  return d
}
