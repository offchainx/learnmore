import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { LeaderboardPeriod } from '@prisma/client';
import { subMonths } from 'date-fns';

export async function GET(request: Request) {
  // Simple auth check for Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const threeMonthsAgo = subMonths(new Date(), 3);

    const result = await prisma.leaderboardEntry.deleteMany({
      where: {
        period: LeaderboardPeriod.WEEKLY,
        weekStart: {
          lt: threeMonthsAgo,
        },
      },
    });

    return NextResponse.json({ success: true, deletedCount: result.count });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ success: false, error: 'Failed to cleanup' }, { status: 500 });
  }
}
