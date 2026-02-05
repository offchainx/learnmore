'use server';

import prisma from '@/lib/prisma';
import { createInAppNotification } from './notification';
import { sendEmail } from '@/lib/email/resend';
import React from 'react';

// Import Email Templates
import WelcomeEmail from '@/lib/email/templates/WelcomeEmail';
import ReceiptEmail from '@/lib/email/templates/ReceiptEmail';
import TrialExpiryEmail from '@/lib/email/templates/TrialExpiryEmail';
import { NotificationMetadata } from '@/lib/notification/types';

/**
 * 触发欢迎通知 (注册成功后)
 */
export async function triggerWelcomeNotification(userId: string, email: string, username?: string) {
  // 1. 发送站内通知 (createInAppNotification 内部会处理偏好检查)
  await createInAppNotification({
    userId,
    type: 'SYSTEM',
    title: '欢迎加入 LearnMore!',
    content: `你好 ${username || '同学'}，很高兴见到你！快去开启你的智慧学习之旅吧。`,
    link: '/dashboard',
  });

  // 2. 发送欢迎邮件 (检查邮件偏好)
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (!prefs || prefs.emailSystem) {
    await sendEmail({
      to: email,
      subject: '欢迎加入 LearnMore!',
      react: React.createElement(WelcomeEmail, { username: username || '同学' }),
    });
  }
}

/**
 * 触发收据通知 (支付成功后)
 */
export async function triggerReceiptNotification(
  userId: string, 
  email: string, 
  amount: number, 
  orderId: string,
  planName: string
) {
  // 1. 发送站内通知 (BILLING 类型强制发送)
  await createInAppNotification({
    userId,
    type: 'BILLING',
    title: '支付成功确认',
    content: `你已成功支付 ${amount} 元订阅 ${planName}。`,
    link: '/dashboard/settings/billing',
    metadata: { orderId, amount, planName } as NotificationMetadata,
  });

  // 2. 发送收据邮件 (BILLING 邮件强制发送)
  await sendEmail({
    to: email,
    subject: `LearnMore 订单收据 - ${orderId}`,
    react: React.createElement(ReceiptEmail, { 
      orderId, 
      amount: `RM ${amount.toFixed(2)}`, 
      planName,
      date: new Date().toLocaleDateString()
    }),
  });
}

/**
 * 触发试用过期通知 (Cron 扫描时调用)
 * 包含幂等性检查：同一天内仅发送一次
 */
export async function triggerTrialExpiryNotification(
  userId: string,
  email: string,
  daysLeft: number
) {
  // 1. 幂等性检查：查询该用户今天是否已经收到过 TRIAL_EXPIRY 通知的 metadata
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type: 'SYSTEM',
      createdAt: { gte: today },
      title: { contains: '试用期' }
    }
  });

  if (existing) {
    console.log(`User ${userId} already notified about trial today. Skipping.`);
    return { success: true, skipped: true };
  }

  // 2. 发送站内通知
  await createInAppNotification({
    userId,
    type: 'SYSTEM',
    title: daysLeft <= 0 ? '你的试用期已结束' : `你的试用期还剩 ${daysLeft} 天`,
    content: daysLeft <= 0 
      ? '你的高级会员试用已到期，请及时续费以继续使用所有功能。'
      : `你的试用期即将结束。升级到正式版，保留你的学习记录和进度！`,
    link: '/pricing',
    metadata: { daysLeft } as NotificationMetadata,
  });

  // 3. 发送邮件
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (!prefs || prefs.emailSystem) {
    await sendEmail({
      to: email,
      subject: daysLeft <= 0 ? 'LearnMore 试用期到期提醒' : `LearnMore 试用期还剩 ${daysLeft} 天`,
      react: React.createElement(TrialExpiryEmail, { daysLeft }),
    });
  }

  return { success: true };
}

/**
 * 触发社交通知 (社区回复时调用)
 */
export async function triggerSocialReplyNotification(
  targetUserId: string,
  actorName: string,
  postId: string,
  postTitle: string,
  replyContent: string
) {
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { email: true }
  });

  if (!targetUser) return;

  // 1. 发送站内通知
  await createInAppNotification({
    userId: targetUserId,
    type: 'SOCIAL',
    title: `${actorName} 回复了你的帖子`,
    content: replyContent.length > 50 ? replyContent.substring(0, 50) + '...' : replyContent,
    link: `/dashboard/community/posts/${postId}`,
    metadata: { actorName, postId, postTitle } as NotificationMetadata,
  });

  // 2. 发送邮件
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId: targetUserId } });
  if (prefs?.emailSocial) {
    // 假设以后有 SocialReplyEmail 模板，目前可以用通用模板或简单的 text
    await sendEmail({
      to: targetUser.email || '',
      subject: `${actorName} 在社区中回复了你`,
      text: `${actorName} 回复了你的帖子 "${postTitle}": 

 ${replyContent} 

 查看详情: /dashboard/community/posts/${postId}`,
    });
  }
}
