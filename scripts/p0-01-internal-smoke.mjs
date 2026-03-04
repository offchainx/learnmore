import assert from 'node:assert/strict';
import process from 'node:process';
import { PrismaClient, ReferralStatus, SubscriptionStatus, SubscriptionTier } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

function req(v, msg) {
  if (!v) throw new Error(msg);
  return v;
}

function makeEvent({ id, type, object }) {
  return {
    id,
    object: 'event',
    api_version: '2024-06-20',
    created: Math.floor(Date.now() / 1000),
    data: { object },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type,
  };
}

async function sendWebhook(eventPayload, webhookSecret, endpoint) {
  const payload = JSON.stringify(eventPayload);
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret,
  });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': signature,
    },
    body: payload,
  });

  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`Webhook failed: ${res.status} ${JSON.stringify(json)}`);
  }

  return json;
}

async function cleanupSmokeArtifacts({ referrerId, refereeId, voucherCode }) {
  await prisma.$transaction(async (tx) => {
    await tx.notification.deleteMany({
      where: { OR: [{ userId: referrerId }, { userId: refereeId }] },
    });
    await tx.referral.deleteMany({
      where: { OR: [{ referrerId }, { refereeId }] },
    });
    await tx.voucherRedemption.deleteMany({
      where: { OR: [{ userId: referrerId }, { userId: refereeId }] },
    });
    await tx.user.deleteMany({ where: { id: { in: [referrerId, refereeId] } } });
    await tx.voucherCode.deleteMany({ where: { code: voucherCode } });
  });
}

async function main() {
  const webhookSecret = req(process.env.STRIPE_WEBHOOK_SECRET, 'Missing STRIPE_WEBHOOK_SECRET');
  const endpoint = process.env.P001_WEBHOOK_ENDPOINT || 'http://localhost:3000/api/webhook/stripe';
  const keepSmokeData = process.env.P001_KEEP_SMOKE_DATA === '1';

  const suffix = Date.now().toString().slice(-8);
  const referrerEmail = `smoke-referrer-${suffix}@example.com`;
  const refereeEmail = `smoke-referee-${suffix}@example.com`;
  const referrerId = crypto.randomUUID();
  const refereeId = crypto.randomUUID();
  const referrerCode = `R${suffix.slice(0, 7)}`.toUpperCase();
  const voucherCode = `V${suffix}`.toUpperCase();

  const referrerCustomerId = `cus_smoke_referrer_${suffix}`;
  const refereeCustomerId = `cus_smoke_referee_${suffix}`;
  const referrerSubscriptionId = `sub_smoke_referrer_${suffix}`;
  const refereeSubscriptionId = `sub_smoke_referee_${suffix}`;

  await prisma.$transaction(async (tx) => {
    await tx.notification.deleteMany({
      where: {
        OR: [
          { userId: referrerId },
          { userId: refereeId },
        ],
      },
    });
    await tx.referral.deleteMany({
      where: {
        OR: [
          { referrerId },
          { refereeId },
        ],
      },
    });
    await tx.voucherRedemption.deleteMany({
      where: {
        OR: [
          { userId: referrerId },
          { userId: refereeId },
        ],
      },
    });
    await tx.user.deleteMany({ where: { id: { in: [referrerId, refereeId] } } });
    await tx.voucherCode.deleteMany({ where: { code: voucherCode } });

    await tx.user.create({
      data: {
        id: referrerId,
        email: referrerEmail,
        username: `ref-${suffix}`,
        referralCode: referrerCode,
        subscriptionTier: SubscriptionTier.STARTER,
        subscriptionStatus: SubscriptionStatus.CANCELED,
        stripeCustomerId: referrerCustomerId,
        stripeSubscriptionId: referrerSubscriptionId,
      },
    });

    await tx.user.create({
      data: {
        id: refereeId,
        email: refereeEmail,
        username: `ree-${suffix}`,
        subscriptionTier: SubscriptionTier.STARTER,
        subscriptionStatus: SubscriptionStatus.CANCELED,
        stripeCustomerId: refereeCustomerId,
        stripeSubscriptionId: refereeSubscriptionId,
      },
    });

    await tx.referral.create({
      data: {
        referrerId,
        refereeId,
        referralCode: referrerCode,
        refereeEmail,
        status: ReferralStatus.PENDING,
      },
    });

    await tx.voucherCode.create({
      data: {
        code: voucherCode,
        discountType: 'AMOUNT',
        discountValue: 10,
        stripeCouponId: `cpn_${suffix}`,
      },
    });
  });

  const nowSec = Math.floor(Date.now() / 1000);

  const checkoutEventId = `evt_smoke_checkout_${suffix}`;
  await sendWebhook(
    makeEvent({
      id: checkoutEventId,
      type: 'checkout.session.completed',
      object: {
        id: `cs_smoke_${suffix}`,
        object: 'checkout.session',
        customer: refereeCustomerId,
        subscription: refereeSubscriptionId,
        amount_total: 0,
        metadata: {
          userId: refereeId,
          planKey: 'standard',
          billingCycle: 'monthly',
          voucherCode,
        },
      },
    }),
    webhookSecret,
    endpoint
  );

  const zeroInvoiceEventId = `evt_smoke_invoice_zero_${suffix}`;
  await sendWebhook(
    makeEvent({
      id: zeroInvoiceEventId,
      type: 'invoice.payment_succeeded',
      object: {
        id: `in_smoke_zero_${suffix}`,
        object: 'invoice',
        customer: refereeCustomerId,
        amount_paid: 0,
        currency: 'myr',
        metadata: { userId: refereeId, voucherCode },
        lines: {
          data: [
            {
              period: { start: nowSec, end: nowSec + 30 * 24 * 3600 },
            },
          ],
        },
        parent: {
          subscription_details: {
            subscription: refereeSubscriptionId,
            metadata: { userId: refereeId, voucherCode },
          },
        },
      },
    }),
    webhookSecret,
    endpoint
  );

  let referral = await prisma.referral.findUnique({ where: { refereeId } });
  assert.equal(referral?.status, ReferralStatus.PENDING, '0金额发票不应结算 referral');

  const firstPaidEventId = `evt_smoke_invoice_paid_${suffix}`;
  await sendWebhook(
    makeEvent({
      id: firstPaidEventId,
      type: 'invoice.payment_succeeded',
      object: {
        id: `in_smoke_paid_${suffix}`,
        object: 'invoice',
        customer: refereeCustomerId,
        amount_paid: 6000,
        currency: 'myr',
        total_discount_amounts: [{ amount: 1000 }],
        metadata: { userId: refereeId, voucherCode },
        lines: {
          data: [
            {
              period: { start: nowSec, end: nowSec + 30 * 24 * 3600 },
            },
          ],
        },
        parent: {
          subscription_details: {
            subscription: refereeSubscriptionId,
            metadata: { userId: refereeId, voucherCode },
          },
        },
      },
    }),
    webhookSecret,
    endpoint
  );

  const refereeAfterFirstPaid = await prisma.user.findUnique({ where: { id: refereeId } });
  const referrerAfterFirstPaid = await prisma.user.findUnique({ where: { id: referrerId } });
  referral = await prisma.referral.findUnique({ where: { refereeId } });
  const voucherRedemption = await prisma.voucherRedemption.findFirst({
    where: { userId: refereeId },
  });
  const voucher = await prisma.voucherCode.findUnique({ where: { code: voucherCode } });

  assert.equal(refereeAfterFirstPaid?.subscriptionStatus, SubscriptionStatus.ACTIVE, '首扣后应为 ACTIVE');
  assert.ok(refereeAfterFirstPaid?.firstPaidAt, '首扣后应写入 firstPaidAt');
  assert.equal(referral?.status, ReferralStatus.DEFERRED, 'Starter 推荐人应进入 DEFERRED');
  assert.equal(referral?.deferredRewardWeeks, 2, '延迟奖励应为 2 周');
  assert.equal(referrerAfterFirstPaid?.referralCount, 1, '推荐人 referral_count 应 +1');
  assert.ok(voucherRedemption, '真实扣款应写入 voucher_redemptions');
  assert.equal(voucher?.redeemedCount, 1, 'voucher redeemed_count 应 +1');

  await prisma.user.update({
    where: { id: referrerId },
    data: {
      subscriptionTier: SubscriptionTier.STANDARD,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionEnd: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    },
  });

  const referrerPaidEventId = `evt_smoke_referrer_paid_${suffix}`;
  await sendWebhook(
    makeEvent({
      id: referrerPaidEventId,
      type: 'invoice.payment_succeeded',
      object: {
        id: `in_smoke_referrer_paid_${suffix}`,
        object: 'invoice',
        customer: referrerCustomerId,
        amount_paid: 6000,
        currency: 'myr',
        metadata: { userId: referrerId },
        lines: {
          data: [
            {
              period: { start: nowSec, end: nowSec + 30 * 24 * 3600 },
            },
          ],
        },
        parent: {
          subscription_details: {
            subscription: referrerSubscriptionId,
            metadata: { userId: referrerId },
          },
        },
      },
    }),
    webhookSecret,
    endpoint
  );

  const referrerAfterDeferredSettle = await prisma.user.findUnique({ where: { id: referrerId } });
  referral = await prisma.referral.findUnique({ where: { refereeId } });
  assert.equal(referral?.status, ReferralStatus.COMPLETED, '推荐人扣款后 DEFERRED 应补发并 COMPLETED');
  assert.equal(referral?.deferredRewardWeeks, 0, '补发后 deferredRewardWeeks 应清零');
  assert.ok(referral?.deferredSettledAt, '补发后应有 deferredSettledAt');
  assert.ok(referrerAfterDeferredSettle?.subscriptionEnd, '推荐人应有新的 subscriptionEnd');

  await sendWebhook(
    makeEvent({
      id: firstPaidEventId,
      type: 'invoice.payment_succeeded',
      object: {
        id: `in_smoke_paid_${suffix}`,
        object: 'invoice',
        customer: refereeCustomerId,
        amount_paid: 6000,
        currency: 'myr',
        total_discount_amounts: [{ amount: 1000 }],
        metadata: { userId: refereeId, voucherCode },
        lines: {
          data: [
            {
              period: { start: nowSec, end: nowSec + 30 * 24 * 3600 },
            },
          ],
        },
        parent: {
          subscription_details: {
            subscription: refereeSubscriptionId,
            metadata: { userId: refereeId, voucherCode },
          },
        },
      },
    }),
    webhookSecret,
    endpoint
  );

  const redemptionCountAfterReplay = await prisma.voucherRedemption.count({ where: { userId: refereeId } });
  assert.equal(redemptionCountAfterReplay, 1, '重放事件不应重复写 voucher_redemptions');

  const billingNotifications = await prisma.notification.findMany({
    where: {
      userId: refereeId,
      type: 'BILLING',
      link: { startsWith: 'stripe:event:' },
    },
  });
  const uniqueLinks = new Set(billingNotifications.map((item) => item.link));
  assert.equal(uniqueLinks.size, billingNotifications.length, '同 event 不应重复通知落库');

  console.log(JSON.stringify({
    ok: true,
    referrerId,
    refereeId,
    referralStatus: referral?.status,
    voucherCode,
    billingNotificationCount: billingNotifications.length,
  }, null, 2));

  if (!keepSmokeData) {
    await cleanupSmokeArtifacts({ referrerId, refereeId, voucherCode });
    console.log('[p0-01-smoke] cleaned up smoke artifacts');
  } else {
    console.log('[p0-01-smoke] skip cleanup because P001_KEEP_SMOKE_DATA=1');
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('[p0-01-smoke] failed', error);
  await prisma.$disconnect();
  process.exit(1);
});
