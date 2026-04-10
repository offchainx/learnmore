'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '../user/auth';
import { z } from 'zod';
import type { UserSettings } from '@prisma/client';

const notificationPreferencesUpdateSchema = z
  .object({
    inAppSystem: z.boolean().optional(),
    inAppSocial: z.boolean().optional(),
    inAppStudy: z.boolean().optional(),
    inAppAchievement: z.boolean().optional(),
    emailSystem: z.boolean().optional(),
    emailSocial: z.boolean().optional(),
    emailWeekly: z.boolean().optional(),
    emailMarketing: z.boolean().optional(),
  })
  .strict();

function getLegacyBridgeUpdate(
  data: z.infer<typeof notificationPreferencesUpdateSchema>
) {
  return {
    ...(data.inAppStudy !== undefined
      ? { notificationDaily: data.inAppStudy }
      : {}),
    ...(data.emailWeekly !== undefined
      ? { notificationWeekly: data.emailWeekly }
      : {}),
    ...(data.emailMarketing !== undefined
      ? { emailMarketing: data.emailMarketing }
      : {}),
    ...(data.emailSocial !== undefined
      ? { emailActivity: data.emailSocial }
      : {}),
  };
}

function getNotificationPreferenceCreateDataFromLegacySettings(
  userId: string,
  oldSettings: Pick<
    UserSettings,
    | 'notificationDaily'
    | 'notificationWeekly'
    | 'emailMarketing'
    | 'emailActivity'
  > | null
) {
  return {
    userId,
    inAppSystem: true,
    inAppSocial: true,
    inAppStudy: oldSettings?.notificationDaily ?? true,
    inAppAchievement: true,
    emailSystem: true,
    emailSocial: oldSettings?.emailActivity ?? true,
    emailWeekly: oldSettings?.notificationWeekly ?? true,
    emailMarketing: oldSettings?.emailMarketing ?? true,
    emailBilling: true,
  };
}

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
        data: getNotificationPreferenceCreateDataFromLegacySettings(
          user.id,
          oldSettings
        ),
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

    const parsed = notificationPreferencesUpdateSchema.safeParse(data);

    if (!parsed.success) {
      return { success: false, error: 'Invalid notification preferences payload' };
    }

    const normalizedData = parsed.data;
    const legacyBridgeUpdate = getLegacyBridgeUpdate(normalizedData);

    const preferences = await prisma.$transaction(async (tx) => {
      const nextPreferences = await tx.notificationPreference.upsert({
        where: { userId: user.id },
        update: normalizedData,
        create: {
          userId: user.id,
          inAppSystem: normalizedData.inAppSystem ?? true,
          inAppSocial: normalizedData.inAppSocial ?? true,
          inAppStudy: normalizedData.inAppStudy ?? true,
          inAppAchievement: normalizedData.inAppAchievement ?? true,
          emailSystem: normalizedData.emailSystem ?? true,
          emailSocial: normalizedData.emailSocial ?? true,
          emailWeekly: normalizedData.emailWeekly ?? true,
          emailMarketing: normalizedData.emailMarketing ?? true,
          emailBilling: true,
        },
      });

      if (Object.keys(legacyBridgeUpdate).length > 0) {
        await tx.userSettings.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            ...legacyBridgeUpdate,
          },
          update: legacyBridgeUpdate,
        });
      }

      return nextPreferences;
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
