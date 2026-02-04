'use server';

import prisma from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
  metadata?: any;
}

/**
 * 创建站内通知
 * 会检查用户的通知偏好设置，如果对应类型的通知被关闭，则不创建（除非是系统强制通知）
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
    // 1. 获取用户偏好设置
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // 2. 检查偏好开关 (如果偏好设置不存在，默认开启)
    let shouldCreate = true;
    if (preferences) {
      if (type === 'SYSTEM' && !preferences.inAppSystem) shouldCreate = false;
      if (type === 'STUDY_REMINDER' && !preferences.inAppStudy) shouldCreate = false;
      if (type === 'ACHIEVEMENT' && !preferences.inAppAchievement) shouldCreate = false;
    }

    if (!shouldCreate) return { success: true, skipped: true };

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
    });

    revalidatePath('/dashboard'); // 刷新仪表盘相关数据
    return { success: true, data: notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

/**
 * 获取用户的通知列表
 */
export async function getNotifications(userId: string, limit = 20) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        isArchived: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
        isArchived: false,
      },
    });

    return { success: true, data: notifications, unreadCount };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error };
  }
}

/**
 * 标记通知为已读
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
}

/**
 * 标记所有通知为已读
 */
export async function markAllAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }
}
