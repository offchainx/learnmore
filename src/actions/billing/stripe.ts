'use server';

import { stripe } from '@/lib/stripe';
import { getCurrentUser } from '@/actions/user/auth';
import { redirect } from 'next/navigation';

type PlanKey = 'starter' | 'standard' | 'smart_plus' | 'premier'
type BillingCycle = 'monthly' | 'annual'

function resolvePriceId(planKey: Exclude<PlanKey, 'starter'>, cycle: BillingCycle) {
  const map = {
    standard: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SELF_LEARNER_MONTHLY || '',
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_SELF_LEARNER_ANNUAL || '',
    },
    smart_plus: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOLAR_MONTHLY || '',
      annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCHOLAR_ANNUAL || '',
    },
    premier: {
      monthly:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_MONTHLY ||
        process.env.NEXT_PUBLIC_STRIPE_PRICE_CHAMPION_MONTHLY ||
        '',
      annual:
        process.env.NEXT_PUBLIC_STRIPE_PRICE_ULTIMATE_ANNUAL ||
        process.env.NEXT_PUBLIC_STRIPE_PRICE_CHAMPION_ANNUAL ||
        '',
    },
  } as const

  return map[planKey][cycle]
}

export async function createCheckoutSession(planKey: PlanKey, billingCycle: BillingCycle) {
  const user = await getCurrentUser();

  if (!user || !user.email) {
    throw new Error('Unauthorized or missing email');
  }

  if (planKey === 'starter') {
    redirect('/register')
  }

  const safePlanKey: Exclude<PlanKey, 'starter'> = planKey
  const priceId = resolvePriceId(safePlanKey, billingCycle)
  if (!priceId) {
    throw new Error(`Price not configured for ${safePlanKey}:${billingCycle}`)
  }

  // 1. Find or Create Stripe Customer
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
      }
    });
    customerId = newCustomer.id;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId, // Use explicit Customer ID
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?payment=cancelled`,
      // Remove customer_email since we are providing customer ID
      metadata: {
        userId: user.id,
        planKey: safePlanKey,
        billingCycle,
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    redirect(session.url);
  } catch (error) {
    console.error('[Stripe] Checkout Error:', error);
    throw error; // Re-throw to be caught by client
  }
}
