'use server';

import { stripe } from '@/lib/stripe';
import { getCurrentUser } from '@/actions/user/auth';
import { z } from 'zod';

const checkoutInputSchema = z.object({
  planKey: z.enum(['starter', 'standard', 'smart_plus', 'premier']),
  billingCycle: z.enum(['monthly', 'annual']),
});

type PlanKey = z.infer<typeof checkoutInputSchema>['planKey'];
type BillingCycle = z.infer<typeof checkoutInputSchema>['billingCycle'];
type PaidPlanKey = Exclude<PlanKey, 'starter'>;

type CheckoutActionErrorCode =
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED'
  | 'UNSUPPORTED_PLAN'
  | 'MISSING_PRICE_CONFIG'
  | 'INVALID_APP_URL'
  | 'STRIPE_ERROR';

type CheckoutActionResult =
  | {
      ok: true;
      checkoutUrl: string;
    }
  | {
      ok: false;
      error: {
        code: CheckoutActionErrorCode;
        message: string;
      };
    };

function resolvePriceId(planKey: PaidPlanKey, cycle: BillingCycle) {
  const map = {
    standard: {
      monthly:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_MONTHLY ||
        process.env.NEXT_PUBLIC_STRIPE_PRICE_SELF_LEARNER_MONTHLY ||
        '',
      annual:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD_ANNUAL ||
        process.env.NEXT_PUBLIC_STRIPE_PRICE_SELF_LEARNER_ANNUAL ||
        '',
    },
    smart_plus: {
      monthly:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_SMARTPLUS_MONTHLY ||
        process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_PLUS_MONTHLY ||
        process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOLAR_MONTHLY ||
        '',
      annual:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_SMARTPLUS_ANNUAL ||
        process.env.NEXT_PUBLIC_STRIPE_PRICE_SMART_PLUS_ANNUAL ||
        process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOLAR_ANNUAL ||
        '',
    },
    premier: {
      monthly:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIER_MONTHLY ||
        process.env.NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_MONTHLY ||
        process.env.NEXT_PUBLIC_STRIPE_PRICE_CHAMPION_MONTHLY ||
        '',
      annual:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIER_ANNUAL ||
        process.env.NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_ANNUAL ||
        process.env.NEXT_PUBLIC_STRIPE_PRICE_CHAMPION_ANNUAL ||
        '',
    },
  } as const

  return map[planKey][cycle]
}

function resolveAppBaseUrl(): string | null {
  const fallback = 'http://localhost:3000';
  const candidate = process.env.NEXT_PUBLIC_APP_URL || fallback;

  try {
    const url = new URL(candidate);
    return url.origin;
  } catch {
    return null;
  }
}

function fail(code: CheckoutActionErrorCode, message: string): CheckoutActionResult {
  return {
    ok: false,
    error: {
      code,
      message,
    },
  };
}

export async function createCheckoutSession(planKey: PlanKey, billingCycle: BillingCycle): Promise<CheckoutActionResult> {
  const parsedInput = checkoutInputSchema.safeParse({ planKey, billingCycle });
  if (!parsedInput.success) {
    return fail('INVALID_INPUT', 'Invalid planKey or billingCycle');
  }

  const user = await getCurrentUser();
  const timestamp = new Date().toISOString();
  const actionName = 'createCheckoutSession';

  if (!user || !user.email) {
    console.warn('[BillingAudit]', JSON.stringify({
      action: actionName,
      result: 'unauthorized',
      userId: user?.id ?? 'anonymous',
      timestamp,
    }));
    return fail('UNAUTHORIZED', 'Unauthorized or missing email');
  }

  if (planKey === 'starter') {
    return fail('UNSUPPORTED_PLAN', 'Starter plan does not require checkout');
  }

  const safePlanKey: PaidPlanKey = planKey;
  const priceId = resolvePriceId(safePlanKey, billingCycle)
  if (!priceId) {
    console.error('[BillingAudit]', JSON.stringify({
      action: actionName,
      result: 'missing_price_config',
      userId: user.id,
      planKey: safePlanKey,
      billingCycle,
      timestamp,
    }));
    return fail('MISSING_PRICE_CONFIG', `Price not configured for ${safePlanKey}:${billingCycle}`);
  }

  const appBaseUrl = resolveAppBaseUrl();
  if (!appBaseUrl) {
    return fail('INVALID_APP_URL', 'NEXT_PUBLIC_APP_URL is invalid');
  }

  // 1. Find or Create Stripe Customer
  try {
    let customerId: string;
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        name: user.username || 'LearnMore User',
        metadata: {
          userId: user.id,
        },
      });
      customerId = newCustomer.id;
    }

    // Use a short rolling window to collapse duplicated clicks/retries for the same plan.
    const idempotencyKey = [
      'checkout',
      user.id,
      safePlanKey,
      billingCycle,
      String(Math.floor(Date.now() / 60000)),
    ].join(':');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appBaseUrl}/dashboard?payment=success`,
      cancel_url: `${appBaseUrl}/pricing?payment=cancelled`,
      metadata: {
        userId: user.id,
        planKey: safePlanKey,
        billingCycle,
      },
    }, {
      idempotencyKey,
    });

    if (!session.url) {
      return fail('STRIPE_ERROR', 'Failed to create checkout session');
    }

    console.warn('[BillingAudit]', JSON.stringify({
      action: actionName,
      result: 'success',
      userId: user.id,
      planKey: safePlanKey,
      billingCycle,
      customerId,
      sessionId: session.id,
      timestamp,
    }));

    return {
      ok: true,
      checkoutUrl: session.url,
    };
  } catch (error) {
    console.error('[Stripe] Checkout Error:', error);
    console.error('[BillingAudit]', JSON.stringify({
      action: actionName,
      result: 'stripe_error',
      userId: user.id,
      planKey: safePlanKey,
      billingCycle,
      timestamp,
    }));
    return fail('STRIPE_ERROR', 'Failed to create checkout session');
  }
}
