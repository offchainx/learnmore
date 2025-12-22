'use server';

import { stripe } from '@/lib/stripe';
import { getCurrentUser } from '@/actions/auth';
import { redirect } from 'next/navigation';

export async function createCheckoutSession(priceId: string, planName: string) {
  const user = await getCurrentUser();

  console.warn('[Stripe Debug] Starting checkout for user:', user?.id);
  console.warn('[Stripe Debug] Price ID:', priceId);
  console.warn('[Stripe Debug] API Key present:', !!process.env.STRIPE_SECRET_KEY);

  if (!user || !user.email) {
    console.error('[Stripe Debug] User missing or no email');
    throw new Error('Unauthorized or missing email');
  }

  // 1. Find or Create Stripe Customer
  let customerId: string;
  
  const existingCustomers = await stripe.customers.list({
    email: user.email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    customerId = existingCustomers.data[0].id;
    console.warn('[Stripe Debug] Found existing customer:', customerId);
  } else {
    const newCustomer = await stripe.customers.create({
      email: user.email,
      name: user.username || 'LearnMore User',
      metadata: {
        userId: user.id,
      }
    });
    customerId = newCustomer.id;
    console.warn('[Stripe Debug] Created new customer:', customerId);
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
        planName: planName,
      },
    });

    if (!session.url) {
      console.error('[Stripe Debug] Session created but no URL');
      throw new Error('Failed to create checkout session');
    }

    console.warn('[Stripe Debug] Redirecting to:', session.url);
    redirect(session.url);
  } catch (error) {
    console.error('[Stripe Debug] Stripe API Error:', error);
    throw error; // Re-throw to be caught by client
  }
}
