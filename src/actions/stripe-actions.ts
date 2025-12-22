'use server';

import { stripe } from '@/lib/stripe';
import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';

export async function createCheckoutSession(priceId: string, planName: string) {
  const user = await getCurrentUser();

  if (!user || !user.email) {
    throw new Error('Unauthorized or missing email');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?payment=cancelled`,
    customer_email: user.email,
    metadata: {
      userId: user.id,
      planName: planName, // 'pro', 'scholar', 'ultimate'
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  redirect(session.url);
}
