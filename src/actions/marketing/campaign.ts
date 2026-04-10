'use server';

import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});

type NewsletterResultCode =
  | 'IDLE'
  | 'INVALID_EMAIL'
  | 'ALREADY_SUBSCRIBED'
  | 'SUBSCRIBED'
  | 'SUBSCRIBED_WITH_EMAIL_WARNING'
  | 'SUBSCRIBE_FAILED';

export type NewsletterState = {
  success: boolean;
  code: NewsletterResultCode;
  message: string;
};

function isPrismaErrorWithCode(error: unknown, code: string): boolean {
  if (!error || typeof error !== 'object') return false;
  if (!('code' in error)) return false;
  return String((error as { code?: unknown }).code) === code;
}

export async function subscribeToNewsletter(
  prevState: NewsletterState | null,
  formData: FormData
): Promise<NewsletterState> {
  const rawEmail = formData.get('email');
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

  const result = subscribeSchema.safeParse({ email });

  if (!result.success) {
    return {
      success: false,
      code: 'INVALID_EMAIL',
      message: result.error.issues[0].message,
    };
  }

  try {
    // Check if already subscribed
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email: result.data.email },
      select: { id: true },
    });

    if (existingSubscriber) {
      return {
        success: true,
        code: 'ALREADY_SUBSCRIBED',
        message: 'You are already subscribed.',
      };
    }

    try {
      await prisma.subscriber.create({
        data: { email: result.data.email },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError ||
        isPrismaErrorWithCode(error, 'P2002')
      ) {
        return {
          success: true,
          code: 'ALREADY_SUBSCRIBED',
          message: 'You are already subscribed.',
        };
      }

      throw error;
    }

    // Send welcome email
    const emailResult = await sendEmail({
      to: result.data.email,
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

    if (!emailResult.success) {
      console.warn('[Newsletter] welcome email failed:', emailResult.error);
      return {
        success: true,
        code: 'SUBSCRIBED_WITH_EMAIL_WARNING',
        message:
          'Successfully subscribed, but the welcome email could not be sent right now.',
      };
    }

    return {
      success: true,
      code: 'SUBSCRIBED',
      message: 'Successfully subscribed! Please check your email.',
    };
  } catch (error) {
    console.error('Subscription error:', error);
    return {
      success: false,
      code: 'SUBSCRIBE_FAILED',
      message: 'Something went wrong. Please try again later.',
    };
  }
}

export type PlatformStats = {
  activeStudents: number;
  questionsSolved: number;
};

async function queryPlatformStats(): Promise<PlatformStats> {
  const [userCount, attemptCount] = await Promise.all([
    prisma.user.count(),
    prisma.userAttempt.count(),
  ]);

  return {
    activeStudents: userCount || 0,
    questionsSolved: attemptCount || 0,
  };
}

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
    return await queryPlatformStats();
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
