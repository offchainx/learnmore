'use server'

import { getCurrentUser } from '@/actions/auth'
import prisma from '@/lib/prisma'
import { SubscriptionTier, SecurityAction } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function applyAdminOverride(data: {
  userId: string
  tier: SubscriptionTier
  reason: string
}) {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== 'ADMIN') {
    throw new Error('Unauthorized: Only admins can perform this action')
  }

  // Handle Mock Users (Story-046 Dev Mode)
  if (data.userId.startsWith('usr_')) {
    console.log(`[Mock Override] Granting ${data.tier} to ${data.userId} because: ${data.reason}`)
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500))
    // Return successfully
    return { success: true }
  }

  // 1. Log the override in UserPermissionOverride
  await prisma.userPermissionOverride.create({
    data: {
      userId: data.userId,
      overriddenBy: currentUser.id,
      targetField: 'subscriptionTier',
      newValue: data.tier,
      reason: data.reason,
    },
  })

  // 2. Get previous tier for logging
  const previousUser = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { subscriptionTier: true },
  })

  // 3. Update User's subscriptionTier
  await prisma.user.update({
    where: { id: data.userId },
    data: {
      subscriptionTier: data.tier,
    },
  })

  // 4. Log to SecurityLog (Associated with the Target User so it shows in their logs)
  await prisma.securityLog.create({
    data: {
      userId: data.userId, 
      action: SecurityAction.PERMISSION_OVERRIDE,
      metadata: {
        actorId: currentUser.id,
        actorName: currentUser.username || currentUser.email,
        previousTier: previousUser?.subscriptionTier,
        newTier: data.tier,
        reason: data.reason,
      },
    },
  })

  // 5. Revalidate
  revalidatePath(`/admin/users/${data.userId}`)
  return { success: true }
}
