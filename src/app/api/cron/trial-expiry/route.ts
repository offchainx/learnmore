import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { triggerTrialExpiryNotification } from '@/actions/notification-triggers';

/**
 * 定时任务：扫描并发送试用期过期通知
 * 建议执行频率：每天 08:00
 * 安全：验证 CRON_SECRET 请求头
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    // 找出试用即将到期（未来3天内）或刚刚到期（过去24小时内）的用户
    // 且当前等级是 STANDARD (通常是试用用户)
    const usersToNotify = await prisma.user.findMany({
      where: {
        subscriptionTier: 'STANDARD',
        subscriptionEnd: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 过去1天
          lte: threeDaysLater, // 未来3天
        },
      },
      select: {
        id: true,
        email: true,
        subscriptionEnd: true,
      }
    });

    let notifiedCount = 0;
    let skippedCount = 0;

    for (const user of usersToNotify) {
      if (!user.email || !user.subscriptionEnd) continue;

      const diffTime = user.subscriptionEnd.getTime() - now.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 仅在 3天前、1天前、或过期当天发送通知
      if (daysLeft === 3 || daysLeft === 1 || daysLeft <= 0) {
        const result = await triggerTrialExpiryNotification(user.id, user.email, daysLeft);
        if (result.success && !result.skipped) {
          notifiedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: usersToNotify.length,
      notified: notifiedCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error('[Cron] Trial Expiry scanning failed:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
