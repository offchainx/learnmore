'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '../user/auth';

/**
 * 获取当前用户通知偏好
 * 如果不存在，则尝试从旧的 UserSettings 同步并创建
 * ⚠️ emailBilling 始终为 true，不可修改
 */
export async function getNotificationPreferences() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: user.id },
    });

    if (!preferences) {
      // 尝试从 UserSettings 获取旧数据 (用于平滑迁移)
      const oldSettings = await prisma.userSettings.findUnique({
        where: { userId: user.id },
      });

      // 创建新的偏好设置，同步旧字段值
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: user.id,
          inAppSystem: true,
          inAppSocial: true,
          inAppStudy: oldSettings?.notificationDaily ?? true,
          inAppAchievement: true,
          emailSystem: true,
          emailSocial: true,
          emailWeekly: oldSettings?.notificationWeekly ?? true,
          emailMarketing: oldSettings?.emailMarketing ?? true,
          emailBilling: true,
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
 * 更新当前用户通知偏好
 * ⚠️ emailBilling 不允许修改（始终为 true）
 */
export async function updateNotificationPreferences(
  data: Partial<{
    inAppSystem: boolean;
    inAppSocial: boolean;
    inAppStudy: boolean;
    inAppAchievement: boolean;
    emailSystem: boolean;
    emailSocial: boolean;
    emailWeekly: boolean;
    emailMarketing: boolean;
  }>
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: data,
      create: {
        userId: user.id,
        inAppSystem: data.inAppSystem ?? true,
        inAppSocial: data.inAppSocial ?? true,
        inAppStudy: data.inAppStudy ?? true,
        inAppAchievement: data.inAppAchievement ?? true,
        emailSystem: data.emailSystem ?? true,
        emailSocial: data.emailSocial ?? true,
        emailWeekly: data.emailWeekly ?? true,
        emailMarketing: data.emailMarketing ?? true,
        emailBilling: true, // 强制为 true
      },
    });

    try {
      revalidatePath('/dashboard/settings');
    } catch (e) {
      // 忽略脚本调用时的 revalidatePath 错误
    }
    
    return { success: true, data: preferences };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return { success: false, error };
  }
}
