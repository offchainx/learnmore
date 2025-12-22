'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/actions/auth';
import { UserRole } from '@prisma/client';

export async function checkAndDeductAiToken() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { aiTokenBalance: true, role: true }
  });

  if (!dbUser) return { success: false, error: 'User not found' };

  // Unlimited for ULTIMATE
  if (dbUser.role === UserRole.ULTIMATE || dbUser.role === UserRole.ADMIN) {
    return { success: true, remaining: 9999 };
  }

  if (dbUser.aiTokenBalance <= 0) {
    return { success: false, error: 'Insufficient AI tokens' };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { aiTokenBalance: { decrement: 1 } }
  });

  return { success: true, remaining: dbUser.aiTokenBalance - 1 };
}
