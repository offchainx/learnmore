import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  Prisma,
  ReferralStatus,
  SubscriptionStatus,
  SubscriptionTier,
} from '@prisma/client';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { triggerReceiptNotification } from '@/actions/notification/triggers';
import { runAfterTask } from '@/lib/server/run-after-task';
import { recordReferralAttributionEvent } from '@/lib/referrals/attribution';

type NormalizedPlanKey = 'standard' | 'smart_plus' | 'premier';
type NormalizedBillingCycle = 'monthly' | 'annual';

const PLAN_TO_TIER: Record<NormalizedPlanKey, SubscriptionTier> = {
  standard: SubscriptionTier.STANDARD,
  smart_plus: SubscriptionTier.SMART_PLUS,
  premier: SubscriptionTier.PREMIER,
};

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const EIGHT_DAYS_MS = 8 * 24 * 60 * 60 * 1000;

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
  console.warn(
    '[WebhookAudit]',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...payload,
    })
  );
}

function normalizePlanKey(rawPlanKey?: string): NormalizedPlanKey | null {
  if (!rawPlanKey) return null;
  const normalized = rawPlanKey.toLowerCase();
  if (normalized === 'standard' || normalized === 'self-learner') return 'standard';
  if (normalized === 'smart_plus' || normalized === 'smartplus' || normalized === 'scholar') return 'smart_plus';
  if (normalized === 'premier' || normalized === 'ultimate' || normalized === 'champion') return 'premier';
  return null;
}

function normalizeBillingCycle(rawCycle?: string): NormalizedBillingCycle | null {
  if (!rawCycle) return 'monthly';
  const normalized = rawCycle.toLowerCase();
  if (normalized === 'monthly' || normalized === 'annual') return normalized;
  return null;
}

function normalizeVoucherCode(rawVoucherCode?: string | null): string | null {
  const normalized = rawVoucherCode?.trim().toUpperCase();
  return normalized ? normalized : null;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function fromUnixTimestamp(timestamp?: number | null): Date | null {
  if (!timestamp || Number.isNaN(timestamp)) return null;
  return new Date(timestamp * 1000);
}

function extendSubscriptionEnd(currentEnd: Date | null | undefined, now: Date, extensionMs: number): Date {
  const base = currentEnd && currentEnd.getTime() > now.getTime() ? currentEnd.getTime() : now.getTime();
  return new Date(base + extensionMs);
}

function mapStripeStatus(
  status: Stripe.Subscription.Status,
  cancelAtPeriodEnd: boolean
): SubscriptionStatus {
  if (status === 'trialing') return SubscriptionStatus.TRIALING;
  if (status === 'active') {
    return cancelAtPeriodEnd
      ? SubscriptionStatus.CANCEL_AT_PERIOD_END
      : SubscriptionStatus.ACTIVE;
  }
  if (status === 'past_due' || status === 'unpaid' || status === 'incomplete') {
    return SubscriptionStatus.PAST_DUE;
  }
  return SubscriptionStatus.CANCELED;
}

async function acquireBillingSubjectLock(
  tx: Prisma.TransactionClient,
  input: {
    userId?: string | null;
    subscriptionId?: string | null;
    customerId?: string | null;
  }
) {
  const key = input.subscriptionId
    ? `stripe:sub:${input.subscriptionId}`
    : input.userId
      ? `user:${input.userId}`
      : input.customerId
        ? `stripe:cus:${input.customerId}`
        : null;

  if (!key) return;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
}

async function lookupUserByStripeIdentifiers(
  input: {
    customerId?: string | null;
    subscriptionId?: string | null;
    metadataUserId?: string | null;
  },
  tx: Prisma.TransactionClient
) {
  const { customerId, subscriptionId, metadataUserId } = input;

  if (metadataUserId && isUuid(metadataUserId)) {
    const byId = await tx.user.findUnique({ where: { id: metadataUserId } });
    if (byId) return byId;
  }

  if (subscriptionId) {
    const bySubscription = await tx.user.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });
    if (bySubscription) return bySubscription;
  }

  if (customerId) {
    const byCustomer = await tx.user.findFirst({
      where: { stripeCustomerId: customerId },
    });
    if (byCustomer) return byCustomer;
  }

  return null;
}

function isStaleSubscriptionEvent(
  user: {
    stripeSubscriptionId: string | null;
  },
  subscriptionId?: string | null
) {
  if (!subscriptionId) return false;
  if (!user.stripeSubscriptionId) return false;
  return user.stripeSubscriptionId !== subscriptionId;
}

async function hasProcessedEvent(
  tx: Prisma.TransactionClient,
  userId: string,
  eventLink: string
) {
  const existing = await tx.notification.findFirst({
    where: {
      userId,
      type: 'BILLING',
      link: eventLink,
    },
    select: { id: true },
  });
  return !!existing;
}

async function createBillingNotification(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    eventId: string;
    title: string;
    content: string;
    metadata: Prisma.InputJsonValue;
  }
) {
  await tx.notification.create({
    data: {
      userId: input.userId,
      type: 'BILLING',
      title: input.title,
      content: input.content,
      link: `stripe:event:${input.eventId}`,
      isArchived: true,
      metadata: input.metadata,
    },
  });
}

async function settleReferralOnFirstPaid(
  tx: Prisma.TransactionClient,
  input: {
    refereeId: string;
    now: Date;
  }
) {
  const { refereeId, now } = input;

  const referral = await tx.referral.findUnique({
    where: { refereeId },
    include: {
      referrer: {
        select: {
          id: true,
          subscriptionTier: true,
          subscriptionEnd: true,
        },
      },
      referee: {
        select: {
          id: true,
          subscriptionEnd: true,
        },
      },
    },
  });

  if (!referral || referral.status !== ReferralStatus.PENDING) {
    return {
      didSettle: false,
      updatedRefereeEnd: null as Date | null,
    };
  }

  const refereeExtendedEnd = extendSubscriptionEnd(referral.referee.subscriptionEnd, now, TWO_WEEKS_MS);
  await tx.user.update({
    where: { id: refereeId },
    data: { subscriptionEnd: refereeExtendedEnd },
  });

  const referrerTier = referral.referrer.subscriptionTier || SubscriptionTier.STARTER;
  if (referrerTier === SubscriptionTier.STARTER) {
    await tx.user.update({
      where: { id: referral.referrerId },
      data: { referralCount: { increment: 1 } },
    });

    await tx.referral.update({
      where: { id: referral.id },
      data: {
        status: ReferralStatus.DEFERRED,
        refereePaidAt: now,
        refereeRewardGrantedAt: now,
        deferredRewardTier: SubscriptionTier.STANDARD,
        deferredRewardWeeks: 2,
        rewardGranted: false,
      },
    });

    await recordReferralAttributionEvent(tx, {
      referralCode: referral.referralCode,
      referralId: referral.id,
      referrerId: referral.referrerId,
      refereeId: referral.refereeId,
      eventType: 'SETTLE',
      success: true,
      metadata: {
        result: 'DEFERRED',
        referrerTier,
        refereeExtendedEnd: refereeExtendedEnd.toISOString(),
        rewardGranted: false,
      },
    });

    return {
      didSettle: true,
      updatedRefereeEnd: refereeExtendedEnd,
    };
  }

  const referrerExtendedEnd = extendSubscriptionEnd(referral.referrer.subscriptionEnd, now, TWO_WEEKS_MS);
  await tx.user.update({
    where: { id: referral.referrerId },
    data: {
      subscriptionEnd: referrerExtendedEnd,
      referralCount: { increment: 1 },
    },
  });

  await tx.referral.update({
    where: { id: referral.id },
    data: {
      status: ReferralStatus.COMPLETED,
      rewardGranted: true,
      rewardDate: now,
      refereePaidAt: now,
      refereeRewardGrantedAt: now,
      referrerRewardGrantedAt: now,
      deferredRewardWeeks: 0,
      deferredSettledAt: now,
    },
  });

  await recordReferralAttributionEvent(tx, {
    referralCode: referral.referralCode,
    referralId: referral.id,
    referrerId: referral.referrerId,
    refereeId: referral.refereeId,
    eventType: 'SETTLE',
    success: true,
    metadata: {
      result: 'COMPLETED',
      referrerTier,
      refereeExtendedEnd: refereeExtendedEnd.toISOString(),
      rewardGranted: true,
    },
  });

  await recordReferralAttributionEvent(tx, {
    referralCode: referral.referralCode,
    referralId: referral.id,
    referrerId: referral.referrerId,
    refereeId: referral.refereeId,
    eventType: 'REWARD_GRANT',
    success: true,
    metadata: {
      result: 'IMMEDIATE',
      referrerTier,
      rewardGranted: true,
    },
  });

  return {
    didSettle: true,
    updatedRefereeEnd: refereeExtendedEnd,
  };
}

async function settleDeferredRewardsForReferrer(
  tx: Prisma.TransactionClient,
  input: {
    referrerId: string;
    referrerTier: SubscriptionTier | null;
    currentSubscriptionEnd: Date | null;
    now: Date;
  }
) {
  const { referrerId, referrerTier, currentSubscriptionEnd, now } = input;

  if (!referrerTier || referrerTier === SubscriptionTier.STARTER) {
    return {
      settledCount: 0,
      updatedSubscriptionEnd: currentSubscriptionEnd,
    };
  }

  const deferredList = await tx.referral.findMany({
    where: {
      referrerId,
      status: ReferralStatus.DEFERRED,
      deferredRewardWeeks: { gt: 0 },
    },
    select: {
      id: true,
      referralCode: true,
      deferredRewardWeeks: true,
    },
  });

  if (deferredList.length === 0) {
    return {
      settledCount: 0,
      updatedSubscriptionEnd: currentSubscriptionEnd,
    };
  }

  let extendedEnd = currentSubscriptionEnd;
  for (const deferred of deferredList) {
    const extensionMs = deferred.deferredRewardWeeks * 7 * 24 * 60 * 60 * 1000;
    extendedEnd = extendSubscriptionEnd(extendedEnd, now, extensionMs);
  }

  if (extendedEnd) {
    await tx.user.update({
      where: { id: referrerId },
      data: { subscriptionEnd: extendedEnd },
    });
  }

  for (const deferred of deferredList) {
    await tx.referral.update({
      where: { id: deferred.id },
      data: {
        status: ReferralStatus.COMPLETED,
        rewardGranted: true,
        rewardDate: now,
        referrerRewardGrantedAt: now,
        deferredSettledAt: now,
        deferredRewardWeeks: 0,
      },
    });

    await recordReferralAttributionEvent(tx, {
      referralCode: deferred.referralCode,
      referralId: deferred.id,
      referrerId,
      eventType: 'REWARD_GRANT',
      success: true,
      metadata: {
        result: 'DEFERRED',
        deferredRewardWeeks: deferred.deferredRewardWeeks,
      },
    });
  }

  return {
    settledCount: deferredList.length,
    updatedSubscriptionEnd: extendedEnd,
  };
}

async function applyVoucherRedemptionOnFirstPaid(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    invoiceId: string;
    voucherCode?: string | null;
    discountAmountMinor: number;
  }
) {
  const normalizedVoucherCode = normalizeVoucherCode(input.voucherCode);
  if (!normalizedVoucherCode) {
    return {
      redeemed: false,
      reason: 'NO_VOUCHER_CODE',
      voucherCode: null,
    };
  }

  const voucher = await tx.voucherCode.findUnique({
    where: { code: normalizedVoucherCode },
    select: {
      id: true,
      code: true,
      isActive: true,
      maxRedemptions: true,
      redeemedCount: true,
    },
  });

  if (!voucher || !voucher.isActive) {
    return {
      redeemed: false,
      reason: 'INVALID_OR_INACTIVE',
      voucherCode: normalizedVoucherCode,
    };
  }

  if (voucher.maxRedemptions !== null && voucher.redeemedCount >= voucher.maxRedemptions) {
    return {
      redeemed: false,
      reason: 'EXHAUSTED',
      voucherCode: voucher.code,
    };
  }

  const existing = await tx.voucherRedemption.findFirst({
    where: {
      userId: input.userId,
      voucherId: voucher.id,
    },
    select: { id: true },
  });

  if (existing) {
    return {
      redeemed: false,
      reason: 'ALREADY_REDEEMED',
      voucherCode: voucher.code,
    };
  }

  const incrementResult = await tx.voucherCode.updateMany({
    where: {
      id: voucher.id,
      isActive: true,
      ...(voucher.maxRedemptions !== null
        ? { redeemedCount: { lt: voucher.maxRedemptions } }
        : {}),
    },
    data: {
      redeemedCount: { increment: 1 },
    },
  });

  if (incrementResult.count === 0) {
    const existingAfterLimitCheck = await tx.voucherRedemption.findFirst({
      where: {
        userId: input.userId,
        voucherId: voucher.id,
      },
      select: { id: true },
    });

    if (existingAfterLimitCheck) {
      return {
        redeemed: false,
        reason: 'ALREADY_REDEEMED',
        voucherCode: voucher.code,
      };
    }

    return {
      redeemed: false,
      reason: 'EXHAUSTED',
      voucherCode: voucher.code,
    };
  }

  try {
    await tx.voucherRedemption.create({
      data: {
        voucherId: voucher.id,
        userId: input.userId,
        stripeSessionId: input.invoiceId,
        appliedAmount: Math.max(0, Math.trunc(input.discountAmountMinor)),
      },
    });
  } catch (error) {
    await tx.voucherCode.update({
      where: { id: voucher.id },
      data: {
        redeemedCount: { decrement: 1 },
      },
    });

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return {
        redeemed: false,
        reason: 'ALREADY_REDEEMED',
        voucherCode: voucher.code,
      };
    }

    throw error;
  }

  return {
    redeemed: true,
    reason: 'REDEEMED',
    voucherCode: voucher.code,
  };
}

async function handleCheckoutSessionCompleted(event: Stripe.Event, session: Stripe.Checkout.Session) {
  const metadataUserId = session.metadata?.userId?.trim() || '';
  const normalizedPlan = normalizePlanKey(session.metadata?.planKey || session.metadata?.planName);
  const billingCycle = normalizeBillingCycle(session.metadata?.billingCycle);

  if (!metadataUserId || !isUuid(metadataUserId) || !normalizedPlan || !billingCycle) {
    auditLog({
      action: 'webhook.checkout.session.completed',
      result: 'invalid_metadata',
      eventId: event.id,
      userId: metadataUserId,
      planKey: session.metadata?.planKey || session.metadata?.planName,
      billingCycle: session.metadata?.billingCycle,
    });
    return jsonResponse(
      {
        ok: false,
        code: 'INVALID_METADATA',
        message: 'Missing or invalid metadata fields',
        eventId: event.id,
        userId: metadataUserId,
      },
      400
    );
  }

  const stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null;
  const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
  const tier = PLAN_TO_TIER[normalizedPlan];
  const now = new Date();
  let stripeSubscription: Stripe.Subscription | null = null;

  if (stripeSubscriptionId) {
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    } catch (error) {
      console.error('[Webhook] failed to fetch subscription', error);
    }
  }

  const trialEnd = stripeSubscription ? fromUnixTimestamp(stripeSubscription.trial_end) : null;
  const periodStart =
    (stripeSubscription && fromUnixTimestamp(stripeSubscription.items.data[0]?.current_period_start)) || now;
  const fallbackPeriodEnd = new Date(
    now.getTime() + (billingCycle === 'annual' ? 365 * 24 * 60 * 60 * 1000 : MONTH_MS)
  );
  const periodEnd =
    (stripeSubscription && fromUnixTimestamp(stripeSubscription.items.data[0]?.current_period_end)) ||
    trialEnd ||
    fallbackPeriodEnd;
  const subscriptionStatus =
    stripeSubscription?.status === 'trialing' || (!!trialEnd && trialEnd.getTime() > now.getTime())
      ? SubscriptionStatus.TRIALING
      : SubscriptionStatus.ACTIVE;
  const eventLogLink = `stripe:event:${event.id}`;

  let duplicate = false;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${event.id}))`;
      await acquireBillingSubjectLock(tx, {
        userId: metadataUserId,
        subscriptionId: stripeSubscriptionId,
        customerId: stripeCustomerId,
      });

      const user = await tx.user.findUnique({
        where: { id: metadataUserId },
        select: { id: true },
      });

      if (!user) {
        throw new Error('UNKNOWN_USER');
      }

      if (await hasProcessedEvent(tx, metadataUserId, eventLogLink)) {
        duplicate = true;
        return;
      }

      await tx.user.update({
        where: { id: metadataUserId },
        data: {
          subscriptionTier: tier,
          subscriptionStatus,
          subscriptionStart: periodStart,
          subscriptionEnd: periodEnd,
          cancelAtPeriodEnd: false,
          ...(stripeCustomerId ? { stripeCustomerId } : {}),
          ...(stripeSubscriptionId ? { stripeSubscriptionId } : {}),
        },
      });

      await createBillingNotification(tx, {
        userId: metadataUserId,
        eventId: event.id,
        title: 'Billing Event Processed',
        content: `Stripe checkout processed (${normalizedPlan}/${billingCycle})`,
        metadata: {
          eventId: event.id,
          sessionId: session.id,
          userId: metadataUserId,
          action: 'webhook.checkout.session.completed',
          result: duplicate ? 'duplicate' : 'processed',
          timestamp: now.toISOString(),
          planKey: normalizedPlan,
          billingCycle,
          subscriptionStatus,
          trialEndsAt: trialEnd?.toISOString() || null,
          amount: (session.amount_total || 0) / 100,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNKNOWN_USER') {
      return jsonResponse(
        {
          ok: false,
          code: 'UNKNOWN_USER',
          message: 'User not found for webhook metadata',
          eventId: event.id,
          userId: metadataUserId,
        },
        400
      );
    }

    console.error('[Webhook] checkout.session.completed failed', error);
    return jsonResponse(
      {
        ok: false,
        code: 'PROCESSING_FAILED',
        message: 'Webhook processing failed',
        eventId: event.id,
        userId: metadataUserId,
      },
      500
    );
  }

  if (duplicate) {
    return jsonResponse({
      ok: true,
      code: 'DUPLICATE_EVENT',
      message: 'Event already processed',
      eventId: event.id,
      userId: metadataUserId,
    });
  }

  auditLog({
    action: 'webhook.checkout.session.completed',
    result: 'processed',
    eventId: event.id,
    userId: metadataUserId,
    planKey: normalizedPlan,
    billingCycle,
  });

  return jsonResponse({
    ok: true,
    code: 'PROCESSED',
    message: 'Webhook processed successfully',
    eventId: event.id,
    userId: metadataUserId,
  });
}

async function handleInvoicePaymentSucceeded(event: Stripe.Event, invoice: Stripe.Invoice) {
  const now = new Date();
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || null;
  const subscriptionIdRaw = invoice.parent?.subscription_details?.subscription;
  const subscriptionId =
    typeof subscriptionIdRaw === 'string' ? subscriptionIdRaw : subscriptionIdRaw?.id || null;
  const metadataUserId =
    invoice.metadata?.userId ||
    invoice.parent?.subscription_details?.metadata?.userId ||
    null;
  const amountPaid = invoice.amount_paid || 0;
  const amount = amountPaid / 100;
  const isRealCharge = amountPaid > 0;
  const discountAmountMinor = invoice.total_discount_amounts?.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  ) || 0;
  const voucherCode =
    invoice.metadata?.voucherCode ||
    invoice.parent?.subscription_details?.metadata?.voucherCode ||
    null;
  const eventLogLink = `stripe:event:${event.id}`;
  let invoiceSubscription: Stripe.Subscription | null = null;

  if (subscriptionId) {
    try {
      invoiceSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      console.error('[Webhook] failed to fetch invoice subscription', error);
    }
  }

  let userId = '';
  let duplicate = false;
  let staleIgnored = false;
  let planForReceipt = 'standard';

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${event.id}))`;

      const user = await lookupUserByStripeIdentifiers(
        {
          customerId,
          subscriptionId,
          metadataUserId,
        },
        tx
      );

      if (!user) {
        throw new Error('UNKNOWN_USER');
      }
      userId = user.id;
      planForReceipt = (user.subscriptionTier || SubscriptionTier.STANDARD).toLowerCase();

      await acquireBillingSubjectLock(tx, {
        userId: user.id,
        subscriptionId,
        customerId,
      });

      if (await hasProcessedEvent(tx, user.id, eventLogLink)) {
        duplicate = true;
        return;
      }

      if (isStaleSubscriptionEvent(user, subscriptionId)) {
        staleIgnored = true;
        return;
      }

      const periodStart =
        fromUnixTimestamp(invoice.lines.data[0]?.period?.start) ||
        user.subscriptionStart ||
        now;
      let periodEnd =
        fromUnixTimestamp(invoice.lines.data[0]?.period?.end) ||
        user.subscriptionEnd ||
        new Date(now.getTime() + MONTH_MS);
      const mappedStatusFromStripe = invoiceSubscription
        ? mapStripeStatus(
            invoiceSubscription.status,
            !!invoiceSubscription.cancel_at_period_end
          )
        : null;
      const periodWindowMs = Math.max(0, periodEnd.getTime() - periodStart.getTime());
      const fallbackNoChargeStatus =
        !isRealCharge && !mappedStatusFromStripe
          ? periodWindowMs <= EIGHT_DAYS_MS
            ? SubscriptionStatus.TRIALING
            : SubscriptionStatus.ACTIVE
          : null;
      const derivedStatus = isRealCharge
        ? SubscriptionStatus.ACTIVE
        : mappedStatusFromStripe || fallbackNoChargeStatus;

      await tx.user.update({
        where: { id: user.id },
        data: {
          ...(derivedStatus ? { subscriptionStatus: derivedStatus } : {}),
          subscriptionStart: periodStart,
          subscriptionEnd: periodEnd,
          cancelAtPeriodEnd: invoiceSubscription
            ? !!invoiceSubscription.cancel_at_period_end
            : false,
          ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
          ...(customerId ? { stripeCustomerId: customerId } : {}),
          ...(isRealCharge && !user.firstPaidAt ? { firstPaidAt: now } : {}),
        },
      });

      let referralResult = {
        didSettle: false,
        updatedRefereeEnd: null as Date | null,
      };
      let deferredSettle = {
        settledCount: 0,
        updatedSubscriptionEnd: null as Date | null,
      };
      let voucherResult = {
        redeemed: false,
        reason: 'SKIPPED',
        voucherCode: null as string | null,
      };

      if (isRealCharge) {
        const purchasedTier = user.subscriptionTier || SubscriptionTier.STANDARD;
        referralResult = await settleReferralOnFirstPaid(tx, {
          refereeId: user.id,
          now,
        });
        if (referralResult.updatedRefereeEnd) {
          periodEnd = referralResult.updatedRefereeEnd;
        }

        deferredSettle = await settleDeferredRewardsForReferrer(tx, {
          referrerId: user.id,
          referrerTier: purchasedTier,
          currentSubscriptionEnd: periodEnd,
          now,
        });
        if (deferredSettle.updatedSubscriptionEnd) {
          periodEnd = deferredSettle.updatedSubscriptionEnd;
        }

        voucherResult = await applyVoucherRedemptionOnFirstPaid(tx, {
          userId: user.id,
          invoiceId: invoice.id,
          voucherCode,
          discountAmountMinor,
        });
      }

      await createBillingNotification(tx, {
        userId: user.id,
        eventId: event.id,
        title: 'Billing Event Processed',
        content: 'Stripe invoice payment succeeded',
        metadata: {
          eventId: event.id,
          invoiceId: invoice.id,
          userId: user.id,
          action: 'webhook.invoice.payment_succeeded',
          result: isRealCharge ? 'processed' : 'processed_no_charge',
          timestamp: now.toISOString(),
          amount,
          isRealCharge,
          currency: invoice.currency,
          mappedSubscriptionStatus: derivedStatus,
          fallbackStatusApplied: !isRealCharge && !mappedStatusFromStripe && !!fallbackNoChargeStatus,
          voucherCode: normalizeVoucherCode(voucherCode),
          voucherRedeemed: voucherResult.redeemed,
          voucherResult: voucherResult.reason,
          discountAmountMinor,
          settledReferral: referralResult.didSettle,
          settledDeferredCount: deferredSettle.settledCount,
          subscriptionEnd: periodEnd?.toISOString() || null,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNKNOWN_USER') {
      return jsonResponse(
        {
          ok: false,
          code: 'UNKNOWN_USER',
          message: 'User not found for invoice event',
          eventId: event.id,
        },
        400
      );
    }

    console.error('[Webhook] invoice.payment_succeeded failed', error);
    return jsonResponse(
      {
        ok: false,
        code: 'PROCESSING_FAILED',
        message: 'Webhook processing failed',
        eventId: event.id,
        userId,
      },
      500
    );
  }

  if (duplicate) {
    return jsonResponse({
      ok: true,
      code: 'DUPLICATE_EVENT',
      message: 'Event already processed',
      eventId: event.id,
      userId,
    });
  }

  if (staleIgnored) {
    runAfterTask(() => {
      auditLog({
        action: 'webhook.invoice.payment_succeeded',
        result: 'ignored_stale_subscription',
        eventId: event.id,
        userId,
        subscriptionId: subscriptionId || undefined,
      });
    }, 'stripe-invoice-stale-audit');

    return jsonResponse({
      ok: true,
      code: 'IGNORED_STALE_SUBSCRIPTION',
      message: 'Stale subscription event ignored',
      eventId: event.id,
      userId,
    });
  }

  if (userId && amount > 0) {
    try {
      const email = invoice.customer_email || '';
      await triggerReceiptNotification(userId, email, amount, invoice.id, planForReceipt);
    } catch (error) {
      console.error('[Webhook] receipt notification failed', error);
    }
  }

  runAfterTask(() => {
    auditLog({
      action: 'webhook.invoice.payment_succeeded',
      result: 'processed',
      eventId: event.id,
      userId,
      isRealCharge,
      amount,
    });
  }, 'stripe-invoice-audit');

  return jsonResponse({
    ok: true,
    code: 'PROCESSED',
    message: 'Webhook processed successfully',
    eventId: event.id,
    userId,
  });
}

async function handleSubscriptionUpdated(event: Stripe.Event, subscription: Stripe.Subscription) {
  const now = new Date();
  const eventLogLink = `stripe:event:${event.id}`;
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null;
  const subscriptionId = subscription.id;
  let userId = '';
  let duplicate = false;
  let staleIgnored = false;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${event.id}))`;

      const user = await lookupUserByStripeIdentifiers(
        { customerId, subscriptionId, metadataUserId: subscription.metadata?.userId || null },
        tx
      );
      if (!user) {
        throw new Error('UNKNOWN_USER');
      }
      userId = user.id;
      await acquireBillingSubjectLock(tx, {
        userId: user.id,
        subscriptionId,
        customerId,
      });

      if (await hasProcessedEvent(tx, user.id, eventLogLink)) {
        duplicate = true;
        return;
      }

      if (isStaleSubscriptionEvent(user, subscriptionId)) {
        staleIgnored = true;
        return;
      }

      const cancelAtPeriodEnd = !!subscription.cancel_at_period_end;
      const subscriptionStatus = mapStripeStatus(subscription.status, cancelAtPeriodEnd);
      const periodStart = fromUnixTimestamp(subscription.items.data[0]?.current_period_start);
      const periodEnd = fromUnixTimestamp(subscription.items.data[0]?.current_period_end);

      await tx.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus,
          cancelAtPeriodEnd,
          ...(periodStart ? { subscriptionStart: periodStart } : {}),
          ...(periodEnd ? { subscriptionEnd: periodEnd } : {}),
          ...(customerId ? { stripeCustomerId: customerId } : {}),
          stripeSubscriptionId: subscription.id,
        },
      });

      await createBillingNotification(tx, {
        userId: user.id,
        eventId: event.id,
        title: 'Subscription Updated',
        content: `Stripe subscription updated (${subscription.status})`,
        metadata: {
          eventId: event.id,
          action: 'webhook.customer.subscription.updated',
          result: 'processed',
          timestamp: now.toISOString(),
          cancelAtPeriodEnd,
          stripeStatus: subscription.status,
          mappedStatus: subscriptionStatus,
          periodEnd: periodEnd?.toISOString() || null,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNKNOWN_USER') {
      return jsonResponse(
        {
          ok: false,
          code: 'UNKNOWN_USER',
          message: 'User not found for subscription update event',
          eventId: event.id,
        },
        400
      );
    }

    console.error('[Webhook] customer.subscription.updated failed', error);
    return jsonResponse(
      {
        ok: false,
        code: 'PROCESSING_FAILED',
        message: 'Webhook processing failed',
        eventId: event.id,
        userId,
      },
      500
    );
  }

  if (duplicate) {
    return jsonResponse({
      ok: true,
      code: 'DUPLICATE_EVENT',
      message: 'Event already processed',
      eventId: event.id,
      userId,
    });
  }

  if (staleIgnored) {
    auditLog({
      action: 'webhook.customer.subscription.updated',
      result: 'ignored_stale_subscription',
      eventId: event.id,
      userId,
      subscriptionId,
    });

    return jsonResponse({
      ok: true,
      code: 'IGNORED_STALE_SUBSCRIPTION',
      message: 'Stale subscription event ignored',
      eventId: event.id,
      userId,
    });
  }

  return jsonResponse({
    ok: true,
    code: 'PROCESSED',
    message: 'Webhook processed successfully',
    eventId: event.id,
    userId,
  });
}

async function handleSubscriptionDeleted(event: Stripe.Event, subscription: Stripe.Subscription) {
  const now = new Date();
  const eventLogLink = `stripe:event:${event.id}`;
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null;
  const subscriptionId = subscription.id;
  let userId = '';
  let duplicate = false;
  let staleIgnored = false;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${event.id}))`;

      const user = await lookupUserByStripeIdentifiers(
        { customerId, subscriptionId, metadataUserId: subscription.metadata?.userId || null },
        tx
      );
      if (!user) {
        throw new Error('UNKNOWN_USER');
      }
      userId = user.id;
      await acquireBillingSubjectLock(tx, {
        userId: user.id,
        subscriptionId,
        customerId,
      });

      if (await hasProcessedEvent(tx, user.id, eventLogLink)) {
        duplicate = true;
        return;
      }

      if (isStaleSubscriptionEvent(user, subscriptionId)) {
        staleIgnored = true;
        return;
      }

      await tx.user.update({
        where: { id: user.id },
        data: {
          subscriptionTier: SubscriptionTier.STARTER,
          subscriptionStatus: SubscriptionStatus.CANCELED,
          subscriptionStart: null,
          subscriptionEnd: null,
          cancelAtPeriodEnd: false,
          stripeSubscriptionId: null,
          ...(customerId ? { stripeCustomerId: customerId } : {}),
        },
      });

      await createBillingNotification(tx, {
        userId: user.id,
        eventId: event.id,
        title: 'Subscription Canceled',
        content: 'Stripe subscription deleted, downgraded to Starter',
        metadata: {
          eventId: event.id,
          action: 'webhook.customer.subscription.deleted',
          result: 'processed',
          timestamp: now.toISOString(),
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNKNOWN_USER') {
      return jsonResponse(
        {
          ok: false,
          code: 'UNKNOWN_USER',
          message: 'User not found for subscription deleted event',
          eventId: event.id,
        },
        400
      );
    }

    console.error('[Webhook] customer.subscription.deleted failed', error);
    return jsonResponse(
      {
        ok: false,
        code: 'PROCESSING_FAILED',
        message: 'Webhook processing failed',
        eventId: event.id,
        userId,
      },
      500
    );
  }

  if (duplicate) {
    return jsonResponse({
      ok: true,
      code: 'DUPLICATE_EVENT',
      message: 'Event already processed',
      eventId: event.id,
      userId,
    });
  }

  if (staleIgnored) {
    auditLog({
      action: 'webhook.customer.subscription.deleted',
      result: 'ignored_stale_subscription',
      eventId: event.id,
      userId,
      subscriptionId,
    });

    return jsonResponse({
      ok: true,
      code: 'IGNORED_STALE_SUBSCRIPTION',
      message: 'Stale subscription event ignored',
      eventId: event.id,
      userId,
    });
  }

  return jsonResponse({
    ok: true,
    code: 'PROCESSED',
    message: 'Webhook processed successfully',
    eventId: event.id,
    userId,
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  if (!webhookSecret) {
    auditLog({ action: 'webhook', result: 'missing_webhook_secret' });
    return jsonResponse(
      {
        ok: false,
        code: 'MISSING_WEBHOOK_SECRET',
        message: 'STRIPE_WEBHOOK_SECRET is not configured',
      },
      500
    );
  }

  if (!signature) {
    auditLog({ action: 'webhook', result: 'missing_signature' });
    return jsonResponse(
      {
        ok: false,
        code: 'MISSING_SIGNATURE',
        message: 'Stripe-Signature header is required',
      },
      400
    );
  }

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    auditLog({
      action: 'webhook',
      result: 'invalid_signature',
      error: errorMessage,
    });
    return jsonResponse(
      {
        ok: false,
        code: 'INVALID_SIGNATURE',
        message: errorMessage,
      },
      400
    );
  }

  switch (event.type) {
    case 'checkout.session.completed':
      return handleCheckoutSessionCompleted(event, event.data.object as Stripe.Checkout.Session);
    case 'invoice.payment_succeeded':
      return handleInvoicePaymentSucceeded(event, event.data.object as Stripe.Invoice);
    case 'customer.subscription.updated':
      return handleSubscriptionUpdated(event, event.data.object as Stripe.Subscription);
    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(event, event.data.object as Stripe.Subscription);
    default:
      return jsonResponse({
        ok: true,
        code: 'IGNORED_EVENT',
        message: `Event ${event.type} ignored`,
        eventId: event.id,
      });
  }
}
