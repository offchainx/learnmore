import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { ReferralStatus, SubscriptionTier } from '@prisma/client';
import { triggerReceiptNotification } from '@/actions/notification/triggers';

type NormalizedPlanKey = 'standard' | 'smart_plus' | 'premier';
type NormalizedBillingCycle = 'monthly' | 'annual';

const PLAN_TO_TIER: Record<NormalizedPlanKey, SubscriptionTier> = {
  standard: SubscriptionTier.STANDARD,
  smart_plus: SubscriptionTier.SMART_PLUS,
  premier: SubscriptionTier.PREMIER,
};

function jsonResponse(
  body: {
    ok: boolean;
    code: string;
    message: string;
    eventId?: string;
    userId?: string;
  },
  status = 200,
) {
  return NextResponse.json(body, { status });
}

function auditLog(payload: Record<string, unknown>) {
  console.warn('[WebhookAudit]', JSON.stringify({
    timestamp: new Date().toISOString(),
    ...payload,
  }));
}

function normalizePlanKey(rawPlanKey: string | undefined): NormalizedPlanKey | null {
  if (!rawPlanKey) return null;
  const normalized = rawPlanKey.toLowerCase();
  if (normalized === 'standard' || normalized === 'self-learner') return 'standard';
  if (normalized === 'smart_plus' || normalized === 'scholar') return 'smart_plus';
  if (normalized === 'premier' || normalized === 'ultimate') return 'premier';
  return null;
}

function normalizeBillingCycle(rawCycle: string | undefined): NormalizedBillingCycle | null {
  if (!rawCycle) return 'monthly';
  const normalized = rawCycle.toLowerCase();
  if (normalized === 'monthly' || normalized === 'annual') return normalized;
  return null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (!webhookSecret) {
    auditLog({ action: 'webhook', result: 'missing_webhook_secret' });
    return jsonResponse({
      ok: false,
      code: 'MISSING_WEBHOOK_SECRET',
      message: 'STRIPE_WEBHOOK_SECRET is not configured',
    }, 500);
  }

  if (!signature) {
    auditLog({ action: 'webhook', result: 'missing_signature' });
    return jsonResponse({
      ok: false,
      code: 'MISSING_SIGNATURE',
      message: 'Stripe-Signature header is required',
    }, 400);
  }

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    auditLog({
      action: 'webhook',
      result: 'invalid_signature',
      error: errorMessage,
    });
    return jsonResponse({
      ok: false,
      code: 'INVALID_SIGNATURE',
      message: errorMessage,
    }, 400);
  }

  if (event.type !== 'checkout.session.completed') {
    return jsonResponse({
      ok: true,
      code: 'IGNORED_EVENT',
      message: `Event ${event.type} ignored`,
      eventId: event.id,
    }, 200);
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session.metadata?.userId?.trim() || '';
  const normalizedPlan = normalizePlanKey(session.metadata?.planKey || session.metadata?.planName);
  const billingCycle = normalizeBillingCycle(session.metadata?.billingCycle);

  if (!userId || !isUuid(userId) || !normalizedPlan || !billingCycle) {
    auditLog({
      action: 'webhook',
      result: 'invalid_metadata',
      eventId: event.id,
      userId,
      planKey: session.metadata?.planKey || session.metadata?.planName,
      billingCycle: session.metadata?.billingCycle,
    });
    return jsonResponse({
      ok: false,
      code: 'INVALID_METADATA',
      message: 'Missing or invalid metadata fields',
      eventId: event.id,
      userId,
    }, 400);
  }

  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!userExists) {
    auditLog({
      action: 'webhook',
      result: 'unknown_user',
      eventId: event.id,
      userId,
    });
    return jsonResponse({
      ok: false,
      code: 'UNKNOWN_USER',
      message: 'User not found for webhook metadata',
      eventId: event.id,
      userId,
    }, 400);
  }

  const tier = PLAN_TO_TIER[normalizedPlan];
  const now = new Date();
  const amount = (session.amount_total || 0) / 100;
  const eventLogLink = `stripe:event:${event.id}`;
  const subscriptionDuration =
    billingCycle === 'annual'
      ? 365 * 24 * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000;

  let isDuplicate = false;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${event.id}))`;

      const alreadyProcessed = await tx.notification.findFirst({
        where: {
          userId,
          type: 'BILLING',
          link: eventLogLink,
        },
        select: { id: true },
      });

      if (alreadyProcessed) {
        isDuplicate = true;
        return;
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: tier,
          subscriptionStart: now,
          subscriptionEnd: new Date(now.getTime() + subscriptionDuration),
        },
      });

      const referral = await tx.referral.findUnique({
        where: { refereeId: userId },
        select: {
          id: true,
          status: true,
          referrerId: true,
          referrer: {
            select: {
              subscriptionEnd: true,
            },
          },
        },
      });

      if (referral && referral.status === ReferralStatus.PENDING) {
        const referrerExtensionMs = 14 * 24 * 60 * 60 * 1000;
        const refereeExtensionMs = 7 * 24 * 60 * 60 * 1000;

        const referee = await tx.user.findUnique({
          where: { id: userId },
          select: { subscriptionEnd: true },
        });

        const referrerCurrentEnd =
          referral.referrer.subscriptionEnd?.getTime() || now.getTime();
        await tx.user.update({
          where: { id: referral.referrerId },
          data: {
            subscriptionEnd: new Date(referrerCurrentEnd + referrerExtensionMs),
            referralCount: { increment: 1 },
          },
        });

        const refereeCurrentEnd = referee?.subscriptionEnd?.getTime() || now.getTime();
        await tx.user.update({
          where: { id: userId },
          data: {
            subscriptionEnd: new Date(refereeCurrentEnd + refereeExtensionMs),
          },
        });

        await tx.referral.update({
          where: { id: referral.id },
          data: {
            status: ReferralStatus.COMPLETED,
            rewardGranted: true,
            rewardDate: now,
            refereePaidAt: now,
          },
        });

        console.warn('[WebhookAudit]', JSON.stringify({
          action: 'referral_reward_granted',
          eventId: event.id,
          referrerId: referral.referrerId,
          refereeId: userId,
          timestamp: now.toISOString(),
        }));
      }

      await tx.notification.create({
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
            userId,
            action: 'webhook.checkout.session.completed',
            result: 'processed',
            timestamp: now.toISOString(),
            planKey: normalizedPlan,
            billingCycle,
            amount,
          },
        },
      });
    });
  } catch (error) {
    console.error('[Webhook] Processing Error:', error);
    auditLog({
      action: 'webhook',
      result: 'processing_failed',
      eventId: event.id,
      userId,
    });
    return jsonResponse({
      ok: false,
      code: 'PROCESSING_FAILED',
      message: 'Webhook processing failed',
      eventId: event.id,
      userId,
    }, 500);
  }

  if (isDuplicate) {
    auditLog({
      action: 'webhook',
      result: 'duplicate_event',
      eventId: event.id,
      userId,
    });
    return jsonResponse({
      ok: true,
      code: 'DUPLICATE_EVENT',
      message: 'Event already processed',
      eventId: event.id,
      userId,
    }, 200);
  }

  try {
    const email = session.customer_details?.email || '';
    await triggerReceiptNotification(
      userId,
      email,
      amount,
      session.id,
      normalizedPlan
    );
  } catch (error) {
    console.error('[Webhook] Receipt trigger error:', error);
    auditLog({
      action: 'receipt_notification',
      result: 'failed',
      eventId: event.id,
      userId,
    });
  }

  auditLog({
    action: 'webhook',
    result: 'processed',
    eventId: event.id,
    userId,
    planKey: normalizedPlan,
    billingCycle,
  });

  return jsonResponse({
    ok: true,
    code: 'PROCESSED',
    message: 'Webhook processed successfully',
    eventId: event.id,
    userId,
  }, 200);
}
