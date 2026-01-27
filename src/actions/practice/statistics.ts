'use server'

/**
 * Practice Center Statistics
 * 练习中心统计分析
 *
 * 提供知识蜂巢、薄弱点分析等统计查询
 */

import prisma from '@/lib/prisma'
import type { HiveNode } from '@/lib/practice/types'
import { getHiveStatus, HIVE_STATUS_COLORS } from '@/lib/practice/types'

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
  // 1. 查询该科目下所有章节
  const chapters = await prisma.chapter.findMany({
    where: { subjectId },
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
    const existing = chapterStatsMap.get(cId) || { total: 0, correct: 0 }
    existing.total += 1
    if (attempt.isCorrect) {
      existing.correct += 1
    }
    chapterStatsMap.set(cId, existing)
  }

  // 4. 查询错题本中的掌握度（可选，用于更精准的 masteryLevel）
  const errorBookEntries = await prisma.errorBook.findMany({
    where: {
      userId,
      question: {
        chapterId: { in: chapterIds }
      }
    },
    select: {
      masteryLevel: true,
      question: {
        select: {
          chapterId: true
        }
      }
    }
  })

  // 按章节聚合平均掌握度
  const chapterMasteryMap = new Map<string, { sum: number; count: number }>()
  for (const entry of errorBookEntries) {
    const cId = entry.question.chapterId
    const existing = chapterMasteryMap.get(cId) || { sum: 0, count: 0 }
    existing.sum += entry.masteryLevel
    existing.count += 1
    chapterMasteryMap.set(cId, existing)
  }

  // 5. 组装蜂巢节点数据
  const hiveNodes: HiveNode[] = chapters.map(chapter => {
    const stats = chapterStatsMap.get(chapter.id) || { total: 0, correct: 0 }
    const mastery = chapterMasteryMap.get(chapter.id)

    // 计算正确率
    const correctRate = stats.total > 0
      ? Math.round((stats.correct / stats.total) * 100)
      : 0

    // 计算平均掌握度（0-3）
    const masteryLevel = mastery && mastery.count > 0
      ? Math.round(mastery.sum / mastery.count)
      : 0

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
}
