'use server'

import prisma from '@/lib/prisma'
import {
  FeedbackCategory,
  FeedbackEventType,
  FeedbackStatus,
  Prisma,
} from '@prisma/client'
import { sendEmail } from '@/lib/email/resend'
import { createInAppNotification } from '../notification/core'
import { revalidatePath } from 'next/cache'
import {
  resolveRequestAdminIdentity,
  resolveRequestUserIdentity,
} from '@/lib/auth/request-user'
import { runAfterTask } from '@/lib/server/run-after-task'
import { invalidateAdminDashboardOverview } from '@/lib/cache/sitewide'

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

type FeedbackEventInput = {
  actorId?: string | null
  eventType: FeedbackEventType
  feedbackId: string
  fromStatus?: FeedbackStatus | null
  toStatus?: FeedbackStatus | null
  message?: string | null
  metadata?: Prisma.InputJsonValue
}

type FeedbackDetailRecord = Prisma.UserFeedbackGetPayload<{
  include: {
    user: {
      select: {
        username: true
        email: true
        avatar: true
        role: true
      }
    }
    responder: {
      select: {
        username: true
        email: true
        role: true
      }
    }
    events: {
      include: {
        actor: {
          select: {
            username: true
            email: true
            role: true
          }
        }
      }
    }
  }
}>

const FEEDBACK_WRITE_DEDUP_WINDOW_MS = 2 * 60 * 1000

async function createFeedbackEvent(
  tx: Prisma.TransactionClient,
  input: FeedbackEventInput
) {
  return tx.userFeedbackEvent.create({
    data: {
      feedbackId: input.feedbackId,
      actorId: input.actorId ?? null,
      eventType: input.eventType,
      fromStatus: input.fromStatus ?? null,
      toStatus: input.toStatus ?? null,
      message: input.message ?? null,
      metadata: input.metadata,
    },
  })
}

async function isRecentDuplicateFeedbackEvent(
  feedbackId: string,
  actorId: string,
  eventType: FeedbackEventType,
  toStatus: FeedbackStatus,
  message: string | null
) {
  const latestEvent = await prisma.userFeedbackEvent.findFirst({
    where: {
      feedbackId,
      actorId,
      eventType,
      toStatus,
      message,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      createdAt: true,
    },
  })

  if (!latestEvent) return false

  return Date.now() - latestEvent.createdAt.getTime() <= FEEDBACK_WRITE_DEDUP_WINDOW_MS
}

async function loadFeedbackForWrite(feedbackId: string) {
  return prisma.userFeedback.findUnique({
    where: { id: feedbackId },
  })
}

async function resolveFeedbackActor(): Promise<FeedbackActor> {
  try {
    const identity = await resolveRequestUserIdentity()
    if (!identity) return null

    return {
      id: identity.id,
      email: identity.email,
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

    const feedback = await prisma.$transaction(async (tx) => {
      const createdFeedback = await tx.userFeedback.create({
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

      await createFeedbackEvent(tx, {
        feedbackId: createdFeedback.id,
        actorId: userId,
        eventType: FeedbackEventType.SUBMITTED,
        toStatus: FeedbackStatus.PENDING,
        metadata: {
          category: params.category,
          sourceType: params.sourceType ?? null,
          sourcePath: params.sourcePath ?? null,
        },
      })

      return createdFeedback
    })

    runAfterTask(async () => {
      await sendEmail({
        to: userEmail,
        subject: `We've received your feedback: ${params.title}`,
        text: `Hi,\n\nThank you for reaching out to LearnMore. We've received your feedback regarding "${params.category}" and our team will look into it as soon as possible.\n\nYour Feedback:\n${params.content}\n\nBest regards,\nLearnMore Support Team`,
      })

      if (userId) {
        await createInAppNotification({
          userId,
          type: 'SYSTEM',
          title: 'Feedback Received',
          content: `Your feedback "${params.title}" has been received. Thank you for helping us improve!`,
        })
      }

      revalidatePath('/admin/feedback')
      revalidatePath('/admin')
      invalidateAdminDashboardOverview()
    }, 'feedback-submit-side-effects')

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
    const admin = await resolveRequestAdminIdentity()
    if (!admin) {
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
    const admin = await resolveRequestAdminIdentity()
    if (!admin) {
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
    const admin = await resolveRequestAdminIdentity()
    if (!admin) {
      return { success: false, error: 'Unauthorized' }
    }

    const feedback = await loadFeedbackForWrite(feedbackId)

    if (!feedback) {
      return { success: false, error: 'Feedback not found' }
    }

    const normalizedReply = reply.trim()
    if (!normalizedReply) {
      return { success: false, error: 'Reply cannot be empty' }
    }

    const replyEventType =
      status === FeedbackStatus.CLOSED
        ? FeedbackEventType.CLOSED
        : FeedbackEventType.REPLIED
    if (
      await isRecentDuplicateFeedbackEvent(
        feedbackId,
        admin.id,
        replyEventType,
        status,
        normalizedReply
      ) &&
      feedback.status === status &&
      feedback.adminReply === normalizedReply &&
      feedback.repliedBy === admin.id
    ) {
      return {
        success: true,
        data: feedback,
        deduplicated: true,
      }
    }

    const now = new Date()
    const updatedFeedback = await prisma.$transaction(async (tx) => {
      const nextFeedback = await tx.userFeedback.update({
        where: { id: feedbackId },
        data: {
          status,
          adminReply: normalizedReply,
          repliedAt: now,
          repliedBy: admin.id,
        },
      })

      await createFeedbackEvent(tx, {
        feedbackId,
        actorId: admin.id,
        eventType: replyEventType,
        fromStatus: feedback.status,
        toStatus: status,
        message: normalizedReply,
      })

      return nextFeedback
    })

    runAfterTask(async () => {
      if (feedback.email) {
        await sendEmail({
          to: feedback.email,
          subject: `Update on your feedback: ${feedback.title}`,
          text: `Hi,\n\nOur team has responded to your feedback:\n\nResponse:\n${normalizedReply}\n\nStatus: ${status}\n\nThank you for being part of LearnMore.\n\nBest regards,\nLearnMore Support Team`,
        })
      } else {
        console.warn('[Feedback] Reply email skipped because feedback email is missing:', feedbackId)
      }

      if (feedback.userId) {
        await createInAppNotification({
          userId: feedback.userId,
          type: 'FEEDBACK_REPLY',
          title: 'Feedback Replied',
          content: `Your feedback "${feedback.title}" has been replied to by our support team.`,
          metadata: {
            feedbackId,
            feedbackStatus: status,
            feedbackTitle: feedback.title,
          },
        })
      }

      revalidatePath('/admin/feedback')
      revalidatePath(`/admin/feedback/${feedbackId}`)
      revalidatePath('/admin')
      invalidateAdminDashboardOverview()
    }, 'feedback-reply-side-effects')

    return { success: true, data: updatedFeedback }
  } catch (error) {
    console.error('Error replying to feedback:', error)
    return { success: false, error: 'Failed to reply to feedback' }
  }
}

export async function updateFeedbackStatus(
  feedbackId: string,
  status: FeedbackStatus,
  note?: string
) {
  try {
    const admin = await resolveRequestAdminIdentity()
    if (!admin) {
      return { success: false, error: 'Unauthorized' }
    }

    const feedback = await loadFeedbackForWrite(feedbackId)

    if (!feedback) {
      return { success: false, error: 'Feedback not found' }
    }

    const normalizedNote = note?.trim() || null
    if (
      feedback.status === status &&
      (await isRecentDuplicateFeedbackEvent(
        feedbackId,
        admin.id,
        status === FeedbackStatus.CLOSED
          ? FeedbackEventType.CLOSED
          : FeedbackEventType.STATUS_CHANGED,
        status,
        normalizedNote
      ))
    ) {
      return {
        success: true,
        data: feedback,
        deduplicated: true,
      }
    }

    if (feedback.status === status) {
      return { success: false, error: 'Status is already up to date' }
    }

    const updatedFeedback = await prisma.$transaction(async (tx) => {
      const nextFeedback = await tx.userFeedback.update({
        where: { id: feedbackId },
        data: {
          status,
        },
      })

      await createFeedbackEvent(tx, {
        feedbackId,
        actorId: admin.id,
        eventType:
          status === FeedbackStatus.CLOSED
            ? FeedbackEventType.CLOSED
            : FeedbackEventType.STATUS_CHANGED,
        fromStatus: feedback.status,
        toStatus: status,
        message: normalizedNote,
      })

      return nextFeedback
    })

    runAfterTask(() => {
      revalidatePath('/admin/feedback')
      revalidatePath(`/admin/feedback/${feedbackId}`)
      revalidatePath('/admin')
      invalidateAdminDashboardOverview()
    }, 'feedback-status-revalidate')

    return { success: true, data: updatedFeedback }
  } catch (error) {
    console.error('Error updating feedback status:', error)
    return { success: false, error: 'Failed to update feedback status' }
  }
}

/**
 * 获取反馈详情
 */
export async function getFeedbackDetail(id: string) {
  try {
    const user = await resolveRequestUserIdentity()
    if (!user) return { success: false, error: 'Unauthorized' }

    const feedback = await loadFeedbackDetailRecord(id)

    if (!feedback) return { success: false, error: 'Feedback not found' }

    // 权限检查：只有作者或 ADMIN 可以查看
    if (user.role !== 'ADMIN' && feedback.userId !== user.id) {
      return { success: false, error: 'Forbidden' }
    }

    return {
      success: true,
      data: {
        ...feedback,
        events: buildFeedbackTimeline(feedback),
      },
    }
  } catch (error) {
    console.error('Error fetching feedback detail:', error)
    return { success: false, error: 'Failed to fetch feedback' }
  }
}

export async function getAdminFeedbackDetail(id: string) {
  try {
    const admin = await resolveRequestAdminIdentity()
    if (!admin) return { success: false, error: 'Unauthorized' }

    const feedback = await loadFeedbackDetailRecord(id)
    if (!feedback) return { success: false, error: 'Feedback not found' }

    return {
      success: true,
      data: {
        ...feedback,
        events: buildFeedbackTimeline(feedback),
      },
    }
  } catch (error) {
    console.error('Error fetching admin feedback detail:', error)
    return { success: false, error: 'Failed to fetch feedback' }
  }
}

function buildFeedbackTimeline(feedback: FeedbackDetailRecord) {
  const events = [...feedback.events]

  if (!events.some((event) => event.eventType === FeedbackEventType.SUBMITTED)) {
    events.unshift({
      id: `legacy-submitted-${feedback.id}`,
      feedbackId: feedback.id,
      actorId: feedback.userId,
      eventType: FeedbackEventType.SUBMITTED,
      fromStatus: null,
      toStatus: FeedbackStatus.PENDING,
      message: null,
      metadata: null,
      createdAt: feedback.createdAt,
      actor: feedback.user
        ? {
            username: feedback.user.username,
            email: feedback.user.email,
            role: feedback.user.role,
          }
        : null,
    })
  }

  if (
    feedback.repliedAt &&
    feedback.adminReply &&
    !events.some(
      (event) =>
        event.eventType === FeedbackEventType.REPLIED &&
        event.createdAt.getTime() === feedback.repliedAt?.getTime()
    )
  ) {
    events.push({
      id: `legacy-replied-${feedback.id}`,
      feedbackId: feedback.id,
      actorId: feedback.repliedBy,
      eventType:
        feedback.status === FeedbackStatus.CLOSED
          ? FeedbackEventType.CLOSED
          : FeedbackEventType.REPLIED,
      fromStatus: null,
      toStatus: feedback.status,
      message: feedback.adminReply,
      metadata: null,
      createdAt: feedback.repliedAt,
      actor: feedback.responder
        ? {
            username: feedback.responder.username,
            email: feedback.responder.email,
            role: feedback.responder.role,
          }
        : null,
    })
  }

  return events.sort((left, right) => {
    return left.createdAt.getTime() - right.createdAt.getTime()
  })
}

async function loadFeedbackDetailRecord(id: string) {
  return prisma.userFeedback.findUnique({
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
      responder: {
        select: {
          username: true,
          email: true,
          role: true,
        },
      },
      events: {
        include: {
          actor: {
            select: {
              username: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })
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
