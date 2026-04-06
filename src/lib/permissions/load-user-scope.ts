import { cache } from 'react'
import prisma from '@/lib/prisma'
import type { UserWithOverrides } from './engine'

export const loadUserWithOverrides = cache(async function loadUserWithOverrides(
  userId: string
): Promise<UserWithOverrides | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      subscriptionTier: true,
      subscriptionEnd: true,
      permissionOverrides: {
        select: {
          targetField: true,
          newValue: true,
          expiresAt: true,
        },
      },
    },
  })
})
