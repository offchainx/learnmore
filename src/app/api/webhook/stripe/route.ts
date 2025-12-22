import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';
import { UserRole } from '@prisma/client';

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

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    const userId = session.metadata?.userId;
    const planName = session.metadata?.planName; // 'pro', 'scholar', 'ultimate'

    if (!userId || !planName) {
      return new NextResponse('Webhook Error: Missing metadata', { status: 400 });
    }

    // Map plan name to UserRole
    let role: UserRole | undefined;
    
    // Note: 'pro' in pricing might correspond to 'SELF-LEARNER' plan conceptually, 
    // but in schema we added PRO and ULTIMATE.
    // Let's assume:
    // 'Self-Learner' -> PRO
    // 'Scholar' -> PRO (or maybe just keep PRO for now, or add SCHOLAR role if needed)
    // 'Ultimate' -> ULTIMATE
    
    // For simplicity based on Schema Update:
    // "Self-Learner" -> PRO
    // "Scholar" -> PRO (Higher tier not yet in schema? Or re-use PRO)
    // "Ultimate" -> ULTIMATE

    // Wait, let's look at schema again. 
    // enum UserRole { STUDENT, PRO, ULTIMATE, TEACHER, ADMIN }
    
    if (planName.toLowerCase() === 'self-learner') role = UserRole.PRO;
    else if (planName.toLowerCase() === 'scholar') role = UserRole.PRO; // Or maybe upgrade if we add SCHOLAR later
    else if (planName.toLowerCase() === 'ultimate') role = UserRole.ULTIMATE;

    if (role) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: role },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
