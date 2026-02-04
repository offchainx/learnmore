'use server';

import prisma from '@/lib/prisma';
import { FeedbackCategory } from '@prisma/client';
import { revalidatePath } from 'next/cache';

interface CreateFeedbackParams {
  userId?: string;           // 可选: 支持匿名反馈
  category: FeedbackCategory;
  title: string;
  content: string;
  email?: string;             // 联系邮箱 (匿名时如果想收到确认需要填写)
  attachments?: string[];
}

/**
 * 提交用户反馈
 * ⭐ 支持匿名提交：userId 和 email 均可选
 */
export async function submitFeedback({
  userId,
  category,
  title,
  content,
  email,
  attachments = [],
}: CreateFeedbackParams) {
  try {
    const feedback = await prisma.userFeedback.create({
      data: {
        userId: userId ?? null,
        category,
        title,
        content,
        email: email ?? null,
        attachments,
      },
    });

    try {
      revalidatePath('/dashboard/support');
    } catch (e) {
      // 忽略脚本调用时的 revalidatePath 错误
    }

    return { success: true, data: feedback };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error };
  }
}

/**
 * 获取用户的反馈历史
 */
export async function getUserFeedbacks(userId: string) {
  try {
    const feedbacks = await prisma.userFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: feedbacks };
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return { success: false, error };
  }
}
