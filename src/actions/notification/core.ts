'use server'

import prisma from '@/lib/prisma'
import { NotificationType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '../user/auth'

import { NotificationMetadata } from '@/lib/notification/types'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  content: string
  link?: string
  metadata?: NotificationMetadata
}

/**
 * 创建站内通知
 * 会检查用户的通知偏好设置，如果对应类型的通知被关闭，则不创建
 * 例外：BILLING 类型通知不允许用户关闭，始终创建
 */
export async function createInAppNotification({
  userId,
  type,
  title,
  content,
  link,
  metadata,
}: CreateNotificationParams) {
  try {
    // 1. BILLING 类型强制放行，不检查偏好
    if (type !== 'BILLING') {
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      })

      // 2. 检查偏好开关 (如果偏好设置不存在，默认开启)
      let shouldCreate = true
      if (preferences) {
        if (type === 'SYSTEM' && !preferences.inAppSystem) shouldCreate = false
        if (type === 'SOCIAL' && !preferences.inAppSocial) shouldCreate = false
        if (type === 'STUDY_REMINDER' && !preferences.inAppStudy)
          shouldCreate = false
        if (type === 'ACHIEVEMENT' && !preferences.inAppAchievement)
          shouldCreate = false
      }

      if (!shouldCreate) return { success: true, skipped: true }
    }

    // 3. 创建通知
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        link,
        metadata,
      },
    })

    try {
      revalidatePath('/dashboard')
    } catch (e) {
      // 忽略非请求上下文中的 revalidatePath 错误
    }

    return { success: true, data: notification }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error }
  }
}

/**
 * 获取用户的通知列表（带分页和过滤）
 */
export async function getNotifications(
  userId?: string,
  limit = 20,
  offset = 0,
  onlyUnread = false
) {
  try {
    let targetUserId = userId

    // 如果没有传入 userId，从当前会话获取
    if (!targetUserId) {
      const user = await getCurrentUser()
      if (!user) return { success: false, error: 'Unauthorized' }
      targetUserId = user.id
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: targetUserId,
        isArchived: false,
        ...(onlyUnread ? { isRead: false } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    const unreadCount = await getUnreadNotificationCount(targetUserId)

    return {
      success: true,
      data: notifications,
      unreadCount: typeof unreadCount === 'number' ? unreadCount : 0,
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return { success: false, error }
  }
}

/**
 * 独立获取未读通知数
 */
export async function getUnreadNotificationCount(userId?: string) {
  try {
    let targetUserId = userId

    if (!targetUserId) {
      const user = await getCurrentUser()
      if (!user) return null
      targetUserId = user.id
    }

    return await prisma.notification.count({
      where: {
        userId: targetUserId,
        isRead: false,
        isArchived: false,
      },
    })
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
}

/**
 * 标记通知为已读
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // 确保只能修改自己的通知
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    })

    if (!notification || notification.userId !== user.id) {
      return { success: false, error: 'Forbidden' }
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { success: false, error }
  }
}

/**
 * 标记所有通知为已读
 */
export async function markAllAsRead() {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return { success: false, error }
  }
}
