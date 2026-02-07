'use server';

import prisma from '@/lib/prisma';
import { FeedbackCategory, FeedbackStatus } from '@prisma/client';
import { getCurrentUser } from '../user/auth';
import { sendEmail } from '@/lib/email/resend';
import { createInAppNotification } from '../notification/core';
import { revalidatePath } from 'next/cache';

export interface SubmitFeedbackParams {
  category: FeedbackCategory;
  title: string;
  content: string;
  email?: string; // For anonymous users
  attachments?: string[];
}

/**
 * 提交用户反馈
 */
export async function submitFeedback(params: SubmitFeedbackParams) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    const userEmail = user?.email || params.email;

    if (!userEmail) {
      return { success: false, error: 'Email is required for feedback submission' };
    }

    // 1. 创建反馈记录
    const feedback = await prisma.userFeedback.create({
      data: {
        userId: userId || null,
        email: userEmail,
        category: params.category,
        title: params.title,
        content: params.content,
        attachments: params.attachments || [],
        status: FeedbackStatus.PENDING,
      },
    });

    // 2. 发送确认邮件给用户 (fire-and-forget, 不阻塞主流程 — ADR-004)
    sendEmail({
      to: userEmail,
      subject: `We've received your feedback: ${params.title}`,
      text: `Hi,\n\nThank you for reaching out to LearnMore. We've received your feedback regarding "${params.category}" and our team will look into it as soon as possible.\n\nYour Feedback:\n${params.content}\n\nBest regards,\nLearnMore Support Team`,
    }).catch(err => console.error('Feedback ack email failed:', err));

    // 3. 站内通知用户（如果是登录用户）
    if (userId) {
      await createInAppNotification({
        userId,
        type: 'SYSTEM',
        title: 'Feedback Received',
        content: `Your feedback "${params.title}" has been received. Thank you for helping us improve!`,
        link: `/dashboard/settings?tab=feedback`, // Assuming there's a feedback tab in settings or similar
      });
    }

    revalidatePath('/admin/feedback');

    return { success: true, data: feedback };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: 'Failed to submit feedback' };
  }
}

/**
 * 获取反馈列表 (Admin)
 */
export async function getFeedbackList(params: {
  status?: FeedbackStatus;
  category?: FeedbackCategory;
  limit?: number;
  offset?: number;
}) {
  try {
    const user = await getCurrentUser();
    if (user?.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const { status, category, limit = 20, offset = 0 } = params;

    const [feedbacks, total] = await Promise.all([
      prisma.userFeedback.findMany({
        where: {
          ...(status ? { status } : {}),
          ...(category ? { category } : {}),
        },
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
        where: {
          ...(status ? { status } : {}),
          ...(category ? { category } : {}),
        },
      }),
    ]);

    return { success: true, data: feedbacks, total };
  } catch (error) {
    console.error('Error fetching feedback list:', error);
    return { success: false, error: 'Failed to fetch feedback' };
  }
}

/**
 * 回复反馈 (Admin)
 */
export async function replyToFeedback(feedbackId: string, reply: string, status: FeedbackStatus = FeedbackStatus.RESOLVED) {
  try {
    const admin = await getCurrentUser();
    if (admin?.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const feedback = await prisma.userFeedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      return { success: false, error: 'Feedback not found' };
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
    });

    // 2. 发送邮件通知用户 (fire-and-forget, 不阻塞主流程 — ADR-004)
    sendEmail({
      to: feedback.email || '',
      subject: `Update on your feedback: ${feedback.title}`,
      text: `Hi,\n\nOur team has responded to your feedback:\n\nResponse:\n${reply}\n\nStatus: ${status}\n\nThank you for being part of LearnMore.\n\nBest regards,\nLearnMore Support Team`,
    }).catch(err => console.error('Feedback reply email failed:', err));

    // 3. 如果是登录用户，发送站内通知
    if (feedback.userId) {
      await createInAppNotification({
        userId: feedback.userId,
        type: 'FEEDBACK_REPLY',
        title: 'Feedback Replied',
        content: `Your feedback "${feedback.title}" has been replied to by our support team.`,
        link: `/dashboard/settings?tab=feedback`,
      });
    }

    revalidatePath('/admin/feedback');
    revalidatePath(`/admin/feedback/${feedbackId}`);

    return { success: true, data: updatedFeedback };
  } catch (error) {
    console.error('Error replying to feedback:', error);
    return { success: false, error: 'Failed to reply to feedback' };
  }
}

/**
 * 获取反馈详情
 */
export async function getFeedbackDetail(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Unauthorized' };

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
    });

    if (!feedback) return { success: false, error: 'Feedback not found' };

    // 权限检查：只有作者或 ADMIN 可以查看
    if (user.role !== 'ADMIN' && feedback.userId !== user.id) {
      return { success: false, error: 'Forbidden' };
    }

    return { success: true, data: feedback };
  } catch (error) {
    console.error('Error fetching feedback detail:', error);
    return { success: false, error: 'Failed to fetch feedback' };
  }
}
