'use server'

import prisma from '@/lib/prisma'
import { FeedbackCategory, FeedbackStatus } from '@prisma/client'
import { getCurrentUser } from '../user/auth'
import { sendEmail } from '@/lib/email/resend'
import { createInAppNotification } from '../notification/core'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { INTERNAL_AUTH_USER_ID_HEADER } from '@/lib/auth/request-context'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'

export interface SubmitFeedbackParams {
  category: FeedbackCategory
  title: string
  content: string
  email?: string // For anonymous users
  attachments?: string[]
  sourceType?: string
  sourcePath?: string
}

export type FeedbackOverviewWindow = '7D' | '30D' | 'ALL'

export interface FeedbackOverviewMetric {
  id: string
  title: string
  value: string
  caption: string
  meta: string
  trend: number | null
  trendLabel: string
}

export interface FeedbackOverview {
  window: FeedbackOverviewWindow
  metrics: FeedbackOverviewMetric[]
  lastUpdated: string
}

type FeedbackActor = {
  id: string
  email: string | null
} | null

async function resolveFeedbackActor(): Promise<FeedbackActor> {
  try {
    const requestHeaders = await headers()
    const forwardedUserId =
      requestHeaders.get(INTERNAL_AUTH_USER_ID_HEADER)?.trim() || null

    if (forwardedUserId) {
      const dbUser = await prisma.user.findUnique({
        where: { id: forwardedUserId },
        select: { id: true, email: true },
      })

      if (dbUser) {
        return dbUser
      }
    }

    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true },
    })

    if (dbUser) {
      return dbUser
    }

    return {
      id: user.id,
      email: user.email ?? null,
    }
  } catch (error) {
    console.warn('[Feedback] Failed to resolve viewer from request context:', error)
    return null
  }
}

/**
 * 提交用户反馈
 */
export async function submitFeedback(params: SubmitFeedbackParams) {
  try {
    const actor = await resolveFeedbackActor()
    const userId = actor?.id
    const normalizedTitle = params.title.trim()
    const normalizedContent = params.content.trim()
    const normalizedEmail = params.email?.trim().toLowerCase()
    const userEmail = actor?.email || normalizedEmail

    if (normalizedTitle.length < 2) {
      return {
        success: false,
        error: '标题至少需要 2 个字符',
      }
    }

    if (normalizedContent.length < 5) {
      return {
        success: false,
        error: '反馈内容至少需要 5 个字符',
      }
    }

    if (!userEmail) {
      return {
        success: false,
        error: '未登录提交时必须填写联系邮箱',
      }
    }

    const duplicateWindowStart = new Date(Date.now() - 2 * 60 * 1000)
    const existingFeedback = await prisma.userFeedback.findFirst({
      where: {
        category: params.category,
        title: normalizedTitle,
        content: normalizedContent,
        createdAt: {
          gte: duplicateWindowStart,
        },
        ...(userId
          ? { userId }
          : {
              email: userEmail,
              userId: null,
            }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (existingFeedback) {
      return {
        success: true,
        data: existingFeedback,
        deduplicated: true,
      }
    }

    // 1. 创建反馈记录
    const feedback = await prisma.userFeedback.create({
      data: {
        email: userEmail,
        category: params.category,
        title: normalizedTitle,
        content: normalizedContent,
        attachments: params.attachments || [],
        sourceType: params.sourceType,
        sourcePath: params.sourcePath,
        status: FeedbackStatus.PENDING,
        ...(userId
          ? {
              user: {
                connect: { id: userId },
              },
            }
          : {}),
      },
    })

    // 2. 发送确认邮件给用户 (fire-and-forget, 不阻塞主流程 — ADR-004)
    sendEmail({
      to: userEmail,
      subject: `We've received your feedback: ${params.title}`,
      text: `Hi,\n\nThank you for reaching out to LearnMore. We've received your feedback regarding "${params.category}" and our team will look into it as soon as possible.\n\nYour Feedback:\n${params.content}\n\nBest regards,\nLearnMore Support Team`,
    }).catch((err) => console.error('Feedback ack email failed:', err))

    // 3. 站内通知用户（如果是登录用户）
    if (userId) {
      await createInAppNotification({
        userId,
        type: 'SYSTEM',
        title: 'Feedback Received',
        content: `Your feedback "${params.title}" has been received. Thank you for helping us improve!`,
      })
    }

    revalidatePath('/admin/feedback')

    return { success: true, data: feedback }
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return {
      success: false,
      error:
        process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : 'Failed to submit feedback',
    }
  }
}

/**
 * 获取反馈列表 (Admin)
 */
export async function getFeedbackList(params: {
  status?: FeedbackStatus
  category?: FeedbackCategory
  search?: string
  limit?: number
  offset?: number
}) {
  try {
    const user = await getCurrentUser()
    if (user?.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' }
    }

    const { status, category, search, limit = 20, offset = 0 } = params
    const query = search?.trim()
    const where = {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: 'insensitive' as const } },
              { content: { contains: query, mode: 'insensitive' as const } },
              { email: { contains: query, mode: 'insensitive' as const } },
              {
                user: {
                  is: {
                    username: {
                      contains: query,
                      mode: 'insensitive' as const,
                    },
                  },
                },
              },
            ],
          }
        : {}),
    }

    const [feedbacks, total] = await Promise.all([
      prisma.userFeedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              username: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.userFeedback.count({
        where,
      }),
    ])

    return { success: true, data: feedbacks, total }
  } catch (error) {
    console.error('Error fetching feedback list:', error)
    return { success: false, error: 'Failed to fetch feedback' }
  }
}

export async function getFeedbackOverview(window: FeedbackOverviewWindow) {
  try {
    const user = await getCurrentUser()
    if (user?.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' }
    }

    const config = getFeedbackWindowConfig(window)
    const now = new Date()

    const [totalCount, pendingCount, inProgressCount, resolvedCount] =
      await Promise.all([
        prisma.userFeedback.count(),
        prisma.userFeedback.count({
          where: { status: FeedbackStatus.PENDING },
        }),
        prisma.userFeedback.count({
          where: { status: FeedbackStatus.IN_PROGRESS },
        }),
        prisma.userFeedback.count({
          where: { status: FeedbackStatus.RESOLVED },
        }),
      ])

    let metrics: FeedbackOverviewMetric[]

    if (config.days === null) {
      metrics = [
        {
          id: 'total',
          title: '总反馈',
          value: formatNumber(totalCount),
          caption: '全站累计',
          meta: '累计进入反馈中心的用户反馈总数',
          trend: null,
          trendLabel: '累计视角',
        },
        {
          id: 'pending',
          title: '待处理',
          value: formatNumber(pendingCount),
          caption: '当前状态',
          meta: '当前仍等待首轮处理的反馈数量',
          trend: null,
          trendLabel: '累计视角',
        },
        {
          id: 'progress',
          title: '处理中',
          value: formatNumber(inProgressCount),
          caption: '当前状态',
          meta: '当前已进入处理流程的反馈数量',
          trend: null,
          trendLabel: '累计视角',
        },
        {
          id: 'resolved',
          title: '已解决',
          value: formatNumber(resolvedCount),
          caption: '当前状态',
          meta: '当前已完成闭环的反馈数量',
          trend: null,
          trendLabel: '累计视角',
        },
      ]
    } else {
      const currentStart = subtractDays(now, config.days)
      const previousStart = subtractDays(currentStart, config.days)

      const [
        totalCurrent,
        totalPrevious,
        pendingCurrent,
        pendingPrevious,
        progressCurrent,
        progressPrevious,
        resolvedCurrent,
        resolvedPrevious,
      ] = await Promise.all([
        prisma.userFeedback.count({
          where: { createdAt: { gte: currentStart, lt: now } },
        }),
        prisma.userFeedback.count({
          where: { createdAt: { gte: previousStart, lt: currentStart } },
        }),
        prisma.userFeedback.count({
          where: {
            status: FeedbackStatus.PENDING,
            createdAt: { gte: currentStart, lt: now },
          },
        }),
        prisma.userFeedback.count({
          where: {
            status: FeedbackStatus.PENDING,
            createdAt: { gte: previousStart, lt: currentStart },
          },
        }),
        prisma.userFeedback.count({
          where: {
            status: FeedbackStatus.IN_PROGRESS,
            updatedAt: { gte: currentStart, lt: now },
          },
        }),
        prisma.userFeedback.count({
          where: {
            status: FeedbackStatus.IN_PROGRESS,
            updatedAt: { gte: previousStart, lt: currentStart },
          },
        }),
        prisma.userFeedback.count({
          where: {
            status: FeedbackStatus.RESOLVED,
            repliedAt: { gte: currentStart, lt: now },
          },
        }),
        prisma.userFeedback.count({
          where: {
            status: FeedbackStatus.RESOLVED,
            repliedAt: { gte: previousStart, lt: currentStart },
          },
        }),
      ])

      metrics = [
        {
          id: 'total',
          title: '总反馈',
          value: formatNumber(totalCount),
          caption: config.label,
          meta: `${config.label} 新增 ${formatNumber(totalCurrent)} 条，上一周期 ${formatNumber(totalPrevious)} 条`,
          trend: calcTrend(totalCurrent, totalPrevious),
          trendLabel: '较上窗口新增',
        },
        {
          id: 'pending',
          title: '待处理',
          value: formatNumber(pendingCount),
          caption: config.label,
          meta: `${config.label} 新进入待处理 ${formatNumber(pendingCurrent)} 条，上一周期 ${formatNumber(pendingPrevious)} 条`,
          trend: calcTrend(pendingCurrent, pendingPrevious),
          trendLabel: '较上窗口进入',
        },
        {
          id: 'progress',
          title: '处理中',
          value: formatNumber(inProgressCount),
          caption: config.label,
          meta: `${config.label} 进入处理中 ${formatNumber(progressCurrent)} 条，上一周期 ${formatNumber(progressPrevious)} 条`,
          trend: calcTrend(progressCurrent, progressPrevious),
          trendLabel: '较上窗口进入',
        },
        {
          id: 'resolved',
          title: '已解决',
          value: formatNumber(resolvedCount),
          caption: config.label,
          meta: `${config.label} 完成闭环 ${formatNumber(resolvedCurrent)} 条，上一周期 ${formatNumber(resolvedPrevious)} 条`,
          trend: calcTrend(resolvedCurrent, resolvedPrevious),
          trendLabel: '较上窗口完成',
        },
      ]
    }

    return {
      success: true,
      data: {
        window,
        metrics,
        lastUpdated: now.toISOString(),
      } satisfies FeedbackOverview,
    }
  } catch (error) {
    console.error('Error fetching feedback overview:', error)
    return { success: false, error: 'Failed to fetch feedback overview' }
  }
}

/**
 * 回复反馈 (Admin)
 */
export async function replyToFeedback(
  feedbackId: string,
  reply: string,
  status: FeedbackStatus = FeedbackStatus.RESOLVED
) {
  try {
    const admin = await getCurrentUser()
    if (admin?.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' }
    }

    const feedback = await prisma.userFeedback.findUnique({
      where: { id: feedbackId },
    })

    if (!feedback) {
      return { success: false, error: 'Feedback not found' }
    }

    // 1. 更新反馈状态和回复
    const updatedFeedback = await prisma.userFeedback.update({
      where: { id: feedbackId },
      data: {
        status,
        adminReply: reply,
        repliedAt: new Date(),
        repliedBy: admin.id,
      },
    })

    // 2. 发送邮件通知用户 (fire-and-forget, 不阻塞主流程 — ADR-004)
    sendEmail({
      to: feedback.email || '',
      subject: `Update on your feedback: ${feedback.title}`,
      text: `Hi,\n\nOur team has responded to your feedback:\n\nResponse:\n${reply}\n\nStatus: ${status}\n\nThank you for being part of LearnMore.\n\nBest regards,\nLearnMore Support Team`,
    }).catch((err) => console.error('Feedback reply email failed:', err))

    // 3. 如果是登录用户，发送站内通知
    if (feedback.userId) {
      await createInAppNotification({
        userId: feedback.userId,
        type: 'FEEDBACK_REPLY',
        title: 'Feedback Replied',
        content: `Your feedback "${feedback.title}" has been replied to by our support team.`,
      })
    }

    revalidatePath('/admin/feedback')
    revalidatePath(`/admin/feedback/${feedbackId}`)

    return { success: true, data: updatedFeedback }
  } catch (error) {
    console.error('Error replying to feedback:', error)
    return { success: false, error: 'Failed to reply to feedback' }
  }
}

/**
 * 获取反馈详情
 */
export async function getFeedbackDetail(id: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const feedback = await prisma.userFeedback.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    if (!feedback) return { success: false, error: 'Feedback not found' }

    // 权限检查：只有作者或 ADMIN 可以查看
    if (user.role !== 'ADMIN' && feedback.userId !== user.id) {
      return { success: false, error: 'Forbidden' }
    }

    return { success: true, data: feedback }
  } catch (error) {
    console.error('Error fetching feedback detail:', error)
    return { success: false, error: 'Failed to fetch feedback' }
  }
}

function getFeedbackWindowConfig(window: FeedbackOverviewWindow) {
  switch (window) {
    case '7D':
      return { days: 7, label: '7 Days' }
    case 'ALL':
      return { days: null, label: 'All Time' }
    case '30D':
    default:
      return { days: 30, label: '30 Days' }
  }
}

function subtractDays(base: Date, days: number) {
  return new Date(base.getTime() - days * 24 * 60 * 60 * 1000)
}

function calcTrend(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return 0
    return 100
  }

  return Number((((current - previous) / previous) * 100).toFixed(1))
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value)
}
