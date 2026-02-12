'use server';

import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type NewsletterState = {
  success: boolean;
  message: string;
};

export async function subscribeToNewsletter(
  prevState: NewsletterState | null,
  formData: FormData
): Promise<NewsletterState> {
  const email = formData.get('email') as string;

  const result = subscribeSchema.safeParse({ email });

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0].message,
    };
  }

  try {
    // Check if already subscribed
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      return {
        success: false,
        message: 'You are already subscribed!',
      };
    }

    // Create subscriber
    await prisma.subscriber.create({
      data: { email },
    });

    // Send welcome email
    await sendEmail({
      to: email,
      subject: 'Welcome to Learn More!',
      html: `
        <h1>Welcome to Learn More!</h1>
        <p>Thank you for subscribing to our newsletter. We're excited to have you on board.</p>
        <p>You'll receive updates on new courses, features, and educational content.</p>
        <br />
        <p>Best regards,</p>
        <p>The Learn More Team</p>
      `,
    });

    return {
      success: true,
      message: 'Successfully subscribed! Please check your email.',
    };
  } catch (error) {
    console.error('Subscription error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    };
  }
}

export type PlatformStats = {
  activeStudents: number;
  questionsSolved: number;
};

function isPrismaConnectivityError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const asRecord = error as { name?: string; message?: string; code?: string };
  const message = (asRecord.message || '').toLowerCase();
  const name = (asRecord.name || '').toLowerCase();

  return (
    name.includes('prismaclientinitializationerror') ||
    message.includes('authentication failed against database server') ||
    message.includes("can't reach database server") ||
    message.includes('provided database credentials') ||
    message.includes('database server at the configured address')
  );
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const [userCount, attemptCount] = await Promise.all([
      prisma.user.count(),
      prisma.userAttempt.count(),
    ]);

    return {
      activeStudents: userCount || 0,
      questionsSolved: attemptCount || 0,
    };
  } catch (error) {
    if (isPrismaConnectivityError(error)) {
      console.warn('[PlatformStats] Database unavailable, fallback to zero stats.');
      return {
        activeStudents: 0,
        questionsSolved: 0,
      };
    }

    console.error('Error fetching platform stats:', error);
    return {
      activeStudents: 0,
      questionsSolved: 0,
    };
  }
}
