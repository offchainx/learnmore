'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * 获取用户通知偏好
 * 如果不存在，则尝试从旧的 UserSettings 同步并创建
 */
export async function getNotificationPreferences(userId: string) {
  try {
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // 尝试从 UserSettings 获取旧数据
      const oldSettings = await prisma.userSettings.findUnique({
        where: { userId },
      });

      // 创建新的偏好设置
      preferences = await prisma.notificationPreference.create({
        data: {
          userId,
          inAppSystem: true,
          inAppStudy: oldSettings?.notificationDaily ?? true,
          inAppAchievement: true,
          emailSystem: true,
          emailStudy: oldSettings?.emailActivity ?? true,
          emailWeekly: oldSettings?.notificationWeekly ?? true,
          emailMarketing: oldSettings?.emailMarketing ?? true,
        },
      });
    }

    return { success: true, data: preferences };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return { success: false, error };
  }
}

/**
 * 更新用户通知偏好
 */
export async function updateNotificationPreferences(
  userId: string,
  data: Partial<{
    inAppSystem: boolean;
    inAppStudy: boolean;
    inAppAchievement: boolean;
    emailSystem: boolean;
    emailStudy: boolean;
    emailWeekly: boolean;
    emailMarketing: boolean;
  }>
) {
  try {
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        inAppSystem: data.inAppSystem ?? true,
        inAppStudy: data.inAppStudy ?? true,
        inAppAchievement: data.inAppAchievement ?? true,
        emailSystem: data.emailSystem ?? true,
        emailStudy: data.emailStudy ?? true,
        emailWeekly: data.emailWeekly ?? true,
        emailMarketing: data.emailMarketing ?? true,
      },
    });

    revalidatePath('/dashboard/settings');
    return { success: true, data: preferences };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return { success: false, error };
  }
}
