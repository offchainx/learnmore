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

type NormalizedPlanKey = 'standard' | 'smart_plus' | 'premier';
type NormalizedBillingCycle = 'monthly' | 'annual';

const PLAN_TO_TIER: Record<NormalizedPlanKey, SubscriptionTier> = {
  standard: SubscriptionTier.STANDARD,
  smart_plus: SubscriptionTier.SMART_PLUS,
  premier: SubscriptionTier.PREMIER,
};

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

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
    const byId = await tx.user.findUnique({
      where: { id: metadataUserId },
    });
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
    purchasedTier: SubscriptionTier;
    now: Date;
  }
) {
  const { refereeId, purchasedTier, now } = input;

  const referral = await tx.referral.findUnique({
    where: { refereeId },
    include: {
      referrer: {
        select: {
          id: true,
          subscriptionTier: true,
          subscriptionEnd: true,
          referralCount: true,
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
  }

  return {
    settledCount: deferredList.length,
    updatedSubscriptionEnd: extendedEnd,
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
  const amount = invoice.amount_paid / 100;
  const eventLogLink = `stripe:event:${event.id}`;

  let userId = '';
  let duplicate = false;
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

      if (await hasProcessedEvent(tx, user.id, eventLogLink)) {
        duplicate = true;
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

      await tx.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          subscriptionStart: periodStart,
          subscriptionEnd: periodEnd,
          cancelAtPeriodEnd: false,
          ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
          ...(customerId ? { stripeCustomerId: customerId } : {}),
          ...(user.firstPaidAt ? {} : { firstPaidAt: now }),
        },
      });

      const purchasedTier = user.subscriptionTier || SubscriptionTier.STANDARD;
      const referralResult = await settleReferralOnFirstPaid(tx, {
        refereeId: user.id,
        purchasedTier,
        now,
      });
      if (referralResult.updatedRefereeEnd) {
        periodEnd = referralResult.updatedRefereeEnd;
      }

      const deferredSettle = await settleDeferredRewardsForReferrer(tx, {
        referrerId: user.id,
        referrerTier: purchasedTier,
        currentSubscriptionEnd: periodEnd,
        now,
      });
      if (deferredSettle.updatedSubscriptionEnd) {
        periodEnd = deferredSettle.updatedSubscriptionEnd;
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
          result: 'processed',
          timestamp: now.toISOString(),
          amount,
          currency: invoice.currency,
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

  if (userId && amount > 0) {
    try {
      const email = invoice.customer_email || '';
      await triggerReceiptNotification(userId, email, amount, invoice.id, planForReceipt);
    } catch (error) {
      console.error('[Webhook] receipt notification failed', error);
    }
  }

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

      if (await hasProcessedEvent(tx, user.id, eventLogLink)) {
        duplicate = true;
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

      if (await hasProcessedEvent(tx, user.id, eventLogLink)) {
        duplicate = true;
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
