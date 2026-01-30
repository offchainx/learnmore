'use server'

import { QuestionReviewData } from '@/types/content-pipeline'
import { MOCK_REVIEW_QUESTIONS } from '@/lib/mock/content-pipeline-data'
import prisma from '@/lib/prisma'

/**
 * 获取单个题目的审核数据
 * @param questionId 题目ID
 * @returns 题目审核数据
 */
export async function getQuestionForReview(
  questionId: string
): Promise<QuestionReviewData | null> {
  // 先尝试从 Mock 数据获取（用于演示）
  if (MOCK_REVIEW_QUESTIONS[questionId]) {
    return MOCK_REVIEW_QUESTIONS[questionId]
  }

  // 从数据库获取真实题目数据
  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        knowledgePoints: {
          include: {
            kp: true,
          },
        },
        sourceFiles: true,
      },
    })

    if (!question) {
      return null
    }

    // 转换选项格式
    const optionsData = question.options as Record<string, string> | null
    const answerData = question.answer
    const correctAnswers = Array.isArray(answerData)
      ? answerData
      : typeof answerData === 'string'
        ? [answerData]
        : []

    const options: QuestionReviewData['options'] = optionsData
      ? Object.entries(optionsData).map(([key, value]) => ({
          id: key,
          value: value,
          isCorrect: correctAnswers.includes(key),
        }))
      : []

    // 转换难度级别
    const difficultyMap: Record<number, { level: string; label: string }> = {
      1: { level: 'L1', label: '基础' },
      2: { level: 'L2', label: '简单' },
      3: { level: 'L3', label: '中等' },
      4: { level: 'L4', label: '困难' },
      5: { level: 'L5', label: '极难' },
    }
    const difficultyInfo = difficultyMap[question.difficulty] || { level: 'L3', label: '中等' }

    // 转换为 QuestionReviewData 格式
    const reviewData: QuestionReviewData = {
      id: question.id,
      title: `题目 ${question.id.substring(0, 8)}`,
      stem: question.content,
      options,
      explanation: {
        text: question.explanation || '',
        steps: [],
      },
      metadata: {
        subject: question.chapter?.subject?.name || '未分类',
        topic: question.chapter?.title || '未分类',
        type: question.type,
        difficulty: difficultyInfo.level,
        difficultyLabel: difficultyInfo.label,
        points: 5, // 默认分值
        tags: question.tags.map((t) => t.tag.name),
      },
      history: [
        {
          status: '题目创建',
          date: new Date(question.createdAt).toLocaleDateString('zh-CN'),
          user: '系统',
          color: 'bg-blue-500',
        },
      ],
      sourceImageUrl: question.sourceFiles?.[0]?.fileUrl,
      status: question.status, // 添加题目状态
    }

    return reviewData
  } catch (error) {
    console.error('获取题目审核数据失败:', error)
    return null
  }
}

/**
 * 更新题目数据
 * @param questionId 题目ID
 * @param data 更新的题目数据
 */
export async function updateQuestion(questionId: string, data: QuestionReviewData) {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 在真实环境中，这里会调用 Prisma 更新数据库
  console.log('[Server Action] 更新题目:', questionId, data)

  // 暂时更新内存中的 Mock 数据
  MOCK_REVIEW_QUESTIONS[questionId] = data

  return { success: true }
}

/**
 * 审核通过题目
 * @param questionId 题目ID
 * @param feedback 审核意见（可选）
 */
export async function approveQuestion(questionId: string, feedback?: string) {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('[Server Action] 审核通过:', questionId, feedback)

  // 在真实环境中，这里会：
  // 1. 更新题目状态为 VERIFIED
  // 2. 记录审核日志到 ContentReviewLog
  // 3. 可能触发通知给题目创建者

  const question = MOCK_REVIEW_QUESTIONS[questionId]
  if (question) {
    question.history.unshift({
      status: '审核通过',
      date: '刚刚',
      user: '当前审核员',
      color: 'bg-green-500',
    })
  }

  return { success: true, message: '审核通过成功' }
}

/**
 * 审核拒绝题目
 * @param questionId 题目ID
 * @param reason 拒绝原因
 */
export async function rejectQuestion(questionId: string, reason: string) {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('[Server Action] 审核拒绝:', questionId, reason)

  // 在真实环境中，这里会：
  // 1. 更新题目状态为 REVIEW_REJECTED
  // 2. 记录审核日志和拒绝原因
  // 3. 通知题目创建者

  const question = MOCK_REVIEW_QUESTIONS[questionId]
  if (question) {
    question.history.unshift({
      status: `审核拒绝: ${reason}`,
      date: '刚刚',
      user: '当前审核员',
      color: 'bg-red-500',
    })
  }

  return { success: true, message: '已拒绝该题目' }
}
