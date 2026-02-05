'use server';

import prisma from '@/lib/prisma';
import { FeedbackCategory } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';

interface CreateFeedbackParams {
  category: FeedbackCategory;
  title: string;
  content: string;
  email?: string; // 用于匿名反馈
  attachments?: string[];
}

/**
 * 提交用户反馈
 * ⭐ 支持匿名提交：userId 和 email 均可选
 */
export async function submitFeedback({
  category,
  title,
  content,
  email,
  attachments = [],
}: CreateFeedbackParams) {
  try {
    const user = await getCurrentUser();
    
    const feedback = await prisma.userFeedback.create({
      data: {
        userId: user?.id || null, // 如果未登录，则为 null
        email: user?.email || email || null, // 优先使用账户邮箱，否则使用填写的邮箱
        category,
        title,
        content,
        attachments,
      },
    });

    try {
      revalidatePath('/dashboard/support');
    } catch (e) {
      // 忽略
    }

    return { success: true, data: feedback };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error };
  }
}

/**
 * 获取当前用户的反馈历史
 */
export async function getUserFeedbacks() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const feedbacks = await prisma.userFeedback.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: feedbacks };
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return { success: false, error };
  }
}
