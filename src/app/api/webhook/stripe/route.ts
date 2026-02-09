import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { ReferralStatus, SubscriptionTier } from '@prisma/client';
import { triggerReceiptNotification } from '@/actions/notification/triggers';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // 处理首次付费成功事件
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const planKey = session.metadata?.planKey || session.metadata?.planName; // backward compatible
    const billingCycle = session.metadata?.billingCycle || 'monthly';

    if (!userId || !planKey) {
      return new NextResponse('Webhook Error: Missing metadata', { status: 400 });
    }

    // Idempotency guard: replayed webhook should be ignored safely
    const eventLogLink = `stripe:event:${event.id}`
    const exists = await prisma.notification.findFirst({
      where: {
        userId,
        type: 'BILLING',
        link: eventLogLink,
      },
      select: { id: true },
    })

    if (exists) {
      return new NextResponse(null, { status: 200 })
    }

    // Map plan name to SubscriptionTier
    let tier: SubscriptionTier | undefined;
    const normalizedPlan = planKey.toLowerCase();
    
    if (normalizedPlan === 'standard' || normalizedPlan === 'self-learner') tier = SubscriptionTier.STANDARD;
    else if (normalizedPlan === 'smart_plus' || normalizedPlan === 'scholar') tier = SubscriptionTier.SMART_PLUS;
    else if (normalizedPlan === 'premier' || normalizedPlan === 'ultimate') tier = SubscriptionTier.PREMIER;

    if (tier) {
      const now = new Date();
      const subscriptionDuration = billingCycle === 'annual'
        ? 365 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000
      const email = session.customer_details?.email || '';
      const amount = (session.amount_total || 0) / 100;

      // 1. 更新用户订阅状态
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tier,
          subscriptionStart: now,
          subscriptionEnd: new Date(now.getTime() + subscriptionDuration),
        },
      });

      // 1.5 触发支付收据通知
      try {
        await triggerReceiptNotification(
          userId,
          email,
          amount,
          session.id,
          normalizedPlan
        );
      } catch (e) {
        console.error('[Webhook] Receipt trigger error:', e);
      }

      // 2. 查找是否有待处理的推荐关系
      const referral = await prisma.referral.findUnique({
        where: { refereeId: userId },
        include: { referrer: true },
      });

      if (referral && referral.status === ReferralStatus.PENDING) {
        // 3. 发放推荐奖励
        const referrerExtension = 14 * 24 * 60 * 60 * 1000; // 推荐人 +14 天
        const refereeExtension = 7 * 24 * 60 * 60 * 1000;   // 被推荐人 +7 天

        // 获取被推荐人当前的订阅结束时间（刚刚更新的）
        const referee = await prisma.user.findUnique({
          where: { id: userId },
          select: { subscriptionEnd: true },
        });

        // 推荐人奖励：延长 2 周订阅
        const referrerCurrentEnd = referral.referrer.subscriptionEnd?.getTime() || now.getTime();
        await prisma.user.update({
          where: { id: referral.referrerId },
          data: {
            subscriptionEnd: new Date(referrerCurrentEnd + referrerExtension),
            referralCount: { increment: 1 },
          },
        });

        // 被推荐人奖励：延长 1 周订阅
        const refereeCurrentEnd = referee?.subscriptionEnd?.getTime() || now.getTime();
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionEnd: new Date(refereeCurrentEnd + refereeExtension),
          },
        });

        // 4. 更新推荐记录状态为 COMPLETED
        await prisma.referral.update({
          where: { id: referral.id },
          data: {
            status: ReferralStatus.COMPLETED,
            rewardGranted: true,
            rewardDate: now,
            refereePaidAt: now,
          },
        });

        // Log referral reward (production: use proper logging service)
        // eslint-disable-next-line no-console
        console.log(`[Referral] Reward granted: ${referral.referrerId} -> ${userId}`);
      }

      // 5. 记录 webhook 处理事件（用于幂等追踪）
      await prisma.notification.create({
        data: {
          userId,
          type: 'BILLING',
          title: 'Billing Event Processed',
          content: `Stripe checkout processed (${normalizedPlan}/${billingCycle})`,
          link: eventLogLink,
          isArchived: true,
          metadata: {
            eventId: event.id,
            sessionId: session.id,
            planKey: normalizedPlan,
            billingCycle,
            amount,
          },
        },
      })
    }
  }

  return new NextResponse(null, { status: 200 });
}
