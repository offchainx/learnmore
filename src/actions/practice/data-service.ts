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
  WeaknessItem,
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
 * 同时计算最近7天和30天的统计数据（用于 HOT/WEAK 标签）
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

  // 3. 批量查询用户在这些章节的所有答题统计（包含时间信息）
  const attemptsWithChapter = await prisma.userAttempt.findMany({
    where: {
      userId,
      question: {
        chapterId: { in: chapterIds }
      }
    },
    select: {
      isCorrect: true,
      createdAt: true,
      question: {
        select: {
          chapterId: true
        }
      }
    }
  })

  // 4. 按章节聚合统计
  // 使用 Map 存储每个章节的累积统计数据
  interface AggregatedStats {
    total: number
    correct: number
    recentTotal: number // 7天
    recentCorrect: number
    monthlyTotal: number // 30天
    monthlyCorrect: number
  }

  const chapterStatsMap = new Map<string, AggregatedStats>()
  
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  for (const attempt of attemptsWithChapter) {
    const cId = attempt.question.chapterId
    const existing = chapterStatsMap.get(cId) || { 
      total: 0, correct: 0, 
      recentTotal: 0, recentCorrect: 0,
      monthlyTotal: 0, monthlyCorrect: 0 
    }
    
    // 全量统计
    existing.total += 1
    if (attempt.isCorrect) existing.correct += 1

    const attemptDate = new Date(attempt.createdAt)

    // 7天统计
    if (attemptDate >= sevenDaysAgo) {
      existing.recentTotal += 1
      if (attempt.isCorrect) existing.recentCorrect += 1
    }

    // 30天统计
    if (attemptDate >= thirtyDaysAgo) {
      existing.monthlyTotal += 1
      if (attempt.isCorrect) existing.monthlyCorrect += 1
    }

    chapterStatsMap.set(cId, existing)
  }

  // 5. 组装结果
  const chaptersWithStats: ChapterWithStats[] = chapters.map(chapter => {
    const stats = chapterStatsMap.get(chapter.id) || { 
      total: 0, correct: 0, 
      recentTotal: 0, recentCorrect: 0,
      monthlyTotal: 0, monthlyCorrect: 0 
    }
    
    // 计算掌握度 (全量数据)
    const masteryLevel = stats.total > 0
      ? Math.round((stats.correct / stats.total) * 100)
      : 0
    
    // 计算近期正确率
    const recentCorrectRate = stats.recentTotal > 0
      ? Math.round((stats.recentCorrect / stats.recentTotal) * 100)
      : 0

    // 计算月度正确率
    const monthlyCorrectRate = stats.monthlyTotal > 0
      ? Math.round((stats.monthlyCorrect / stats.monthlyTotal) * 100)
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
        questionCount: chapter._count.questions,
        recentAttempts: stats.recentTotal,
        recentCorrectRate,
        monthlyCorrectRate
      }
    }
  })

  return {
    subjectId,
    subjectName: subject.name,
    chapters: chaptersWithStats
  }
}

// ============ 薄弱点分析 ============

/**
 * 获取薄弱知识点分析
 * 找出掌握度最低的 N 个章节
 * 
 * @param userId - 用户ID
 * @param subjectId - 科目ID
 * @param limit - 返回数量
 */
export async function getWeaknessAnalysis(
  userId: string,
  subjectId: string,
  limit: number = 3
): Promise<WeaknessItem[]> {
  // 复用 getSubjectChapters 的逻辑获取所有章节统计
  const result = await getSubjectChapters(subjectId, userId)
  
  if (!result || !result.chapters) {
    return []
  }

  // 筛选出已答题的章节，并按正确率/掌握度排序
  // 规则: 
  // 1. 至少答过 5 次题 (避免刚做错1题就判为薄弱)
  // 2. 正确率 < 70% 视为潜在薄弱点
  // 3. 按正确率升序排序 (越低越弱)
  
  const weaknesses = result.chapters
    .filter(c => c.stats.totalAttempts >= 5 && c.stats.masteryLevel < 70)
    .sort((a, b) => a.stats.masteryLevel - b.stats.masteryLevel)
    .slice(0, limit)
    .map(c => {
      // 将 0-100 的掌握度映射为 0-3 等级
      let level = 0
      if (c.stats.masteryLevel >= 80) level = 3
      else if (c.stats.masteryLevel >= 60) level = 2
      else if (c.stats.masteryLevel > 0) level = 1
      
      return {
        chapterId: c.id,
        chapterTitle: c.title,
        correctRate: c.stats.masteryLevel, // 这里 masteryLevel 就是正确率百分比
        masteryLevel: level
      }
    })

  return weaknesses
}

// ============ A2.3: 智能随机抽题 ============

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
