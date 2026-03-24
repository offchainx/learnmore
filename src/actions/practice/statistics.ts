'use server'

/**
 * Practice Center Statistics
 * 练习中心统计分析
 *
 * 提供知识蜂巢、薄弱点分析、考分预测等统计查询
 */

import prisma from '@/lib/prisma'
import type { HiveNode, ExamForecast } from '@/lib/practice/types'
import { getHiveStatus, HIVE_STATUS_COLORS } from '@/lib/practice/types'
import { calculateExamForecast } from '@/lib/practice/algorithms'
import { getEffectiveTier } from '@/lib/permissions/engine'
import { getRetentionDate } from '@/lib/permissions/prisma-scope'

// ============ C1: Knowledge Hive (知识蜂巢) ============

/**
 * 获取知识蜂巢数据
 * 查询用户在某科目所有章节的掌握度，生成蜂窝图数据
 *
 * @param userId - 用户ID
 * @param subjectId - 科目ID
 * @returns 蜂巢节点数组
 */
export async function getKnowledgeHiveData(
  userId: string,
  subjectId: string
): Promise<HiveNode[]> {
  if (!subjectId || subjectId.length < 10) return [] // Basic validation

  try {
    // 0. 获取用户等级和数据保留期 (C3)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        permissionOverrides: {
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          }
        }
      }
    })

    if (!user) return []

    const tier = getEffectiveTier(user)
    const minDate = getRetentionDate(tier)

    // console.log(`[Hive] Fetching data for ${subjectId}`);
    // 1. 查询该科目下所有章节
    const chapters = await prisma.chapter.findMany({
      where: {
        subjectId,
        children: { none: {} },
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
      }
    })

    if (chapters.length === 0) {
      return []
    }

    const chapterIds = chapters.map(c => c.id)

    // 2. 批量查询用户在这些章节的答题记录
    const attemptsWithChapter = await prisma.userAttempt.findMany({
      where: {
        userId,
        createdAt: { gte: minDate }, // C3: Retention filter
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

    // 3. 按章节聚合统计
    const chapterStatsMap = new Map<string, { total: number; correct: number }>()

    for (const attempt of attemptsWithChapter) {
      const cId = attempt.question.chapterId
      if (!cId) continue // 跳过没有章节的题目

      const existing = chapterStatsMap.get(cId) || { total: 0, correct: 0 }
      existing.total += 1
      if (attempt.isCorrect) {
        existing.correct += 1
      }
      chapterStatsMap.set(cId, existing)
    }

    // 4. 组装蜂巢节点数据（掌握度由 attempts 实时映射）
    const hiveNodes: HiveNode[] = chapters.map(chapter => {
      const stats = chapterStatsMap.get(chapter.id) || { total: 0, correct: 0 }

      // 计算正确率
      const correctRate = stats.total > 0
        ? Math.round((stats.correct / stats.total) * 100)
        : 0

      // 计算掌握度（0-3）
      const masteryLevel = correctRate >= 80 ? 3 : correctRate >= 60 ? 2 : correctRate > 0 ? 1 : 0

      // 根据正确率和答题次数确定状态
      const status = getHiveStatus(correctRate, stats.total)

      // 获取对应颜色
      const color = HIVE_STATUS_COLORS[status]

      return {
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        masteryLevel,
        correctRate,
        totalAttempts: stats.total,
        status,
        color
      }
    })

    return hiveNodes
  } catch (error) {
    console.error('Failed to get Knowledge Hive data:', error)
    return []
  }
}

// ============ C2: Exam Forecast (考分预测) ============

/**
 * 获取考分预测数据
 * 基于用户近30天的答题记录、课程完成度和连续学习天数计算预测分数
 *
 * @param userId - 用户ID
 * @param subjectId - 可选，科目ID（筛选特定科目）
 * @returns 考分预测结果
 */
export async function getExamForecastData(
  userId: string,
  subjectId?: string
): Promise<ExamForecast | null> {
  // 0. 获取用户等级和数据保留期 (C3)
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      permissionOverrides: {
        where: {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      }
    }
  })

  if (!userRecord) return null

  const tier = getEffectiveTier(userRecord)
  const retentionDate = getRetentionDate(tier)

  // 计算算法建议的30天前的日期
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // C3: 最终截止日期取两者中较晚的一个（即取交集，且不超出权限范围）
  const finalCutoff = retentionDate > thirtyDaysAgo ? retentionDate : thirtyDaysAgo

  // 并行查询所需数据
  const [recentAttempts, user, lessonStats] = await Promise.all([
    // 1. 查询符合保留期且在30天内的答题记录
    prisma.userAttempt.findMany({
      where: {
        userId,
        createdAt: { gte: finalCutoff },
        ...(subjectId && {
          question: {
            chapter: {
              subjectId
            }
          }
        })
      },
      select: {
        isCorrect: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    }),

    // 2. 查询用户的 streak
    prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true }
    }),

    // 3. 查询课程完成情况
    subjectId
      ? prisma.$transaction([
          // 该科目总课程数
          prisma.lesson.count({
            where: {
              chapter: { subjectId }
            }
          }),
          // 用户已完成的课程数
          prisma.userProgress.count({
            where: {
              userId,
              isCompleted: true,
              lesson: {
                chapter: { subjectId }
              }
            }
          })
        ])
      : prisma.$transaction([
          // 所有科目总课程数
          prisma.lesson.count(),
          // 用户已完成的课程数
          prisma.userProgress.count({
            where: {
              userId,
              isCompleted: true
            }
          })
        ])
  ])

  // 如果用户不存在，返回 null
  if (!user) {
    return null
  }

  const [totalLessons, completedLessons] = lessonStats

  // 如果没有任何答题记录，返回默认预测
  if (recentAttempts.length === 0) {
    return {
      grade: 'N/A',
      score: 0,
      trend: 'STABLE',
      confidence: 0,
      sparklineData: [50, 50, 50, 50, 50, 50, 50]
    }
  }

  // 调用算法计算预测
  const forecast = calculateExamForecast({
    recentAttempts: recentAttempts.map(a => ({
      isCorrect: a.isCorrect,
      createdAt: a.createdAt
    })),
    totalLessons,
    completedLessons,
    userStreak: user.streak
  })

  return forecast
}
