'use server'

import { getCurrentUser } from '@/actions/auth'
import prisma from '@/lib/prisma'
import { SubscriptionTier, SecurityAction } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// 将 duration 字符串转换为过期时间戳
function calcExpiresAt(duration: string): Date | null {
  const now = Date.now()
  switch (duration) {
    case '7_days':  return new Date(now + 7  * 24 * 60 * 60 * 1000)
    case '30_days': return new Date(now + 30 * 24 * 60 * 60 * 1000)
    case '90_days': return new Date(now + 90 * 24 * 60 * 60 * 1000)
    case 'permanent': return null // permanent → expiresAt 为 null
    default: return new Date(now + 7 * 24 * 60 * 60 * 1000) // fallback 7天
  }
}

export async function applyAdminOverride(data: {
  userId: string
  tier: SubscriptionTier
  reason: string
  duration?: string // '7_days' | '30_days' | '90_days' | 'permanent'
}) {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== 'ADMIN') {
    throw new Error('Unauthorized: Only admins can perform this action')
  }

  const expiresAt = data.duration ? calcExpiresAt(data.duration) : null

  // Handle Mock Users (Story-046 Dev Mode)
  if (data.userId.startsWith('usr_')) {
    console.log(`[Mock Override] Granting ${data.tier} to ${data.userId} | duration: ${data.duration} | expiresAt: ${expiresAt} | reason: ${data.reason}`)
    await new Promise(resolve => setTimeout(resolve, 500))
    return { success: true }
  }

  // 1. Log the override in UserPermissionOverride（含 expiresAt）
  await prisma.userPermissionOverride.create({
    data: {
      userId: data.userId,
      overriddenBy: currentUser.id,
      targetField: 'subscriptionTier',
      newValue: data.tier,
      reason: data.reason,
      expiresAt,
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
        duration: data.duration || 'permanent',
        expiresAt: expiresAt?.toISOString() || null,
        reason: data.reason,
      },
    },
  })

  // 5. Revalidate
  revalidatePath(`/admin/users/${data.userId}`)
  return { success: true }
}
