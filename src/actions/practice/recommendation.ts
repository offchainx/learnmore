'use server'

import prisma from "@/lib/prisma"
import { Question, Prisma } from "@prisma/client"
import { getEffectiveTier } from "@/lib/permissions/engine"
import { getRetentionDate } from "@/lib/permissions/prisma-scope"

// ... (SUBJECT_NAME_MAP and resolveSubjectId helper)

/**
 * 获取智能刷题题目列表
 * 算法逻辑：
 * 1. 排除最近7天做过的题目
 * 2. 50% 来自错题本 (优先选择 mastery_level 低的)
 * 3. 30% 来自薄弱章节 (错题最多的章节) 的未掌握题目
 * 4. 20% 来自新题目 (难度匹配用户等级)
 * 5. 如果某部分数量不足，由后续部分补足
 */
export async function getSmartDrillQuestions(
  userId: string,
  subjectIdentifier: string,
  limit: number = 10
): Promise<Question[]> {
  console.log('[Recommendation] getSmartDrillQuestions called:', { userId, subjectIdentifier, limit })
  try {
    // 0. 解析科目ID（支持 name 或 UUID）
    const subjectId = await resolveSubjectId(subjectIdentifier)
    console.log('[Recommendation] Resolved subjectId:', subjectId)
    if (!subjectId) {
      console.error(`[Recommendation] Subject not found: ${subjectIdentifier}`)
      return []
    }

    // 获取用户等级 (C1)
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

    // C1 Filter
    const difficultyFilter: Prisma.IntFilter = {}
    if (tier === 'STARTER') difficultyFilter.lte = 2
    else if (tier === 'STANDARD') difficultyFilter.lte = 4

    // 1. 准备基础数据
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // 获取最近7天做过的题目ID (排除列表)
    const recentAttempts = await prisma.userAttempt.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
        question: { chapter: { subjectId } }
      },
      select: { questionId: true },
      distinct: ['questionId']
    })
    const excludeIds = recentAttempts.map(a => a.questionId)

    // 计算各部分目标数量
    const errorBookCount = Math.floor(limit * 0.5)
    const weakChapterCount = Math.floor(limit * 0.3)
    
    const resultQuestions: Question[] = []
    const addedIds = new Set<string>(excludeIds)

    // 1. 获取错题本题目 (Target: 50%)
    // C3: Apply Retention Filter on ErrorBook
    const errorBookQuestions = await prisma.errorBook.findMany({
      where: {
        userId,
        updatedAt: { gte: minDate }, // C3: Retention Filter
        question: { 
          chapter: { subjectId },
          difficulty: difficultyFilter // C1: Difficulty Filter
        },
        questionId: { notIn: Array.from(addedIds) }
      },
      orderBy: { masteryLevel: 'asc' },
      take: errorBookCount,
      include: { question: true }
    })

    for (const entry of errorBookQuestions) {
      resultQuestions.push(entry.question)
      addedIds.add(entry.questionId)
    }

    // 更新剩余需要的数量 (如果错题不够，配额顺延给薄弱章节)
    const remainingForWeak = weakChapterCount + (errorBookCount - resultQuestions.length)

    // 2. 获取薄弱章节题目 (Target: 30% + carry over)
    if (remainingForWeak > 0) {
        // 找到错题最多的前3个章节
        // ErrorBook 没有 chapterId，Prisma groupBy 不支持 relation，必须手动聚合
        
        // 获取用户的 ErrorBook 关联的 Question 的 chapterId
        const allErrors = await prisma.errorBook.findMany({
            where: { userId, question: { chapter: { subjectId } } },
            select: { question: { select: { chapterId: true } } }
        })
        
        const chapterCounts: Record<string, number> = {}
        allErrors.forEach(e => {
            const cid = e.question.chapterId
            if (cid) {
                chapterCounts[cid] = (chapterCounts[cid] || 0) + 1
            }
        })
        
        const sortedChapterIds = Object.entries(chapterCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([id]) => id)

        if (sortedChapterIds.length > 0) {
            const weakQuestions = await prisma.question.findMany({
                where: {
                    chapterId: { in: sortedChapterIds },
                    difficulty: difficultyFilter, // C1: Difficulty Filter
                    id: { notIn: Array.from(addedIds) }
                },
                take: remainingForWeak
            })
            
            for (const q of weakQuestions) {
                resultQuestions.push(q)
                addedIds.add(q.id)
            }
        }
    }

    // 更新剩余需要的数量 (如果薄弱章节题目不够，全给新题)
    const remainingForNew = limit - resultQuestions.length

    // 3. 获取新题目 (Target: 20% + carry over)
    // 难度匹配：简单起见，取难度 3 (或根据用户等级，这里暂定固定难度或随机)
    if (remainingForNew > 0) {
        // 获取用户所有做过的题目ID (不仅仅是最近7天的)
        const allAttempts = await prisma.userAttempt.findMany({
            where: { userId },
            select: { questionId: true },
            distinct: ['questionId']
        })
        const allAttemptedIds = new Set(allAttempts.map(a => a.questionId))
        // 将已选的也加入排除
        resultQuestions.forEach(q => allAttemptedIds.add(q.id))
        
        // 尽量寻找新题
        const newQuestions = await prisma.question.findMany({
            where: {
                chapter: { subjectId },
                difficulty: difficultyFilter, // C1: Difficulty Filter
                id: { notIn: Array.from(allAttemptedIds) } // 真正的"新"题
            },
            take: remainingForNew
        })

        for (const q of newQuestions) {
            resultQuestions.push(q)
            addedIds.add(q.id)
        }
        
        // 如果新题还不够 (比如题库太小)，则允许重复做以前做过的题 (但在本次结果中不重复)
        if (resultQuestions.length < limit) {
             const fallbackNeeded = limit - resultQuestions.length
             const fallbackQuestions = await prisma.question.findMany({
                where: {
                    chapter: { subjectId },
                    id: { notIn: Array.from(addedIds) }
                },
                take: fallbackNeeded
             })
             resultQuestions.push(...fallbackQuestions)
        }
    }

    // 5. 最终兜底：如果还是没有题目，直接查询该科目所有题目
    if (resultQuestions.length === 0) {
      console.log('[Recommendation] No questions found, using final fallback')
      const anyQuestions = await prisma.question.findMany({
        where: {
          chapter: { subjectId }
        },
        take: limit
      })
      resultQuestions.push(...anyQuestions)
    }

    // 6. 打乱顺序
    console.log('[Recommendation] Returning questions:', resultQuestions.length)
    return resultQuestions.sort(() => Math.random() - 0.5)

  } catch (error) {
    console.error("[Recommendation] Error fetching smart drill questions:", error)
    return [] // 出错时返回空数组，避免崩溃
  }
}
