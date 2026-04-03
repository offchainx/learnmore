'use server'

import prisma from '@/lib/prisma'
import { SubscriptionTier, SecurityAction, UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { resolveRequestAdminIdentity } from '@/lib/auth/request-user'
import { invalidateAdminDashboardOverview } from '@/lib/cache/sitewide'
import { buildSecurityLogMetadata } from '@/lib/admin/security-log'

export type PermissionSearchUser = {
  id: string
  email: string
  username: string | null
  subscriptionTier: SubscriptionTier | null
  subscriptionEnd: string | null
  role: UserRole
}

export type OverrideHistoryItem = {
  id: string
  userId: string
  overriddenBy: string
  targetField: string
  newValue: string | null
  reason: string
  expiresAt: string | null
  createdAt: string
  admin?: {
    id: string
    username: string | null
    email: string
  }
}

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

function isSameDateTime(left: Date | null, right: Date | null): boolean {
  if (!left || !right) {
    return left === right
  }
  return left.getTime() === right.getTime()
}

export async function applyAdminOverride(data: {
  userId: string
  tier: SubscriptionTier
  reason: string
  duration?: string // '7_days' | '30_days' | '90_days' | 'permanent'
}) {
  const currentUser = await resolveRequestAdminIdentity()
  if (!currentUser) {
    throw new Error('Unauthorized: Only admins can perform this action')
  }

  const reason = data.reason.trim()
  if (reason.length < 10) {
    throw new Error('原因至少需要10个字符')
  }

  const expiresAt = data.duration ? calcExpiresAt(data.duration) : null

  const targetUser = await prisma.user.findUnique({
    where: { id: data.userId },
    select: {
      id: true,
      email: true,
      username: true,
      subscriptionTier: true,
      subscriptionEnd: true,
    },
  })

  if (!targetUser) {
    throw new Error('目标用户不存在')
  }

  const sameStateAlreadyApplied =
    targetUser.subscriptionTier === data.tier &&
    isSameDateTime(targetUser.subscriptionEnd, expiresAt)

  if (sameStateAlreadyApplied) {
    revalidatePath(`/admin/users/${data.userId}`)
    revalidatePath('/admin/users')
    revalidatePath('/admin')
    invalidateAdminDashboardOverview()
    return { success: true }
  }

  await prisma.$transaction(async (tx) => {
    await tx.userPermissionOverride.create({
      data: {
        userId: data.userId,
        overriddenBy: currentUser.id,
        targetField: 'subscriptionTier',
        previousValue: targetUser.subscriptionTier,
        newValue: data.tier,
        reason,
        expiresAt,
      },
    })

    await tx.user.update({
      where: { id: data.userId },
      data: {
        subscriptionTier: data.tier,
        subscriptionEnd: expiresAt,
      },
    })

    await tx.securityLog.create({
      data: {
        userId: data.userId,
        action: SecurityAction.PERMISSION_OVERRIDE,
        metadata: buildSecurityLogMetadata({
          operator: {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.username || currentUser.email,
          },
          target: {
            id: targetUser.id,
            email: targetUser.email ?? null,
          },
          reason,
          changes: [
            {
              field: 'subscriptionTier',
              before: targetUser.subscriptionTier ?? null,
              after: data.tier,
            },
            {
              field: 'subscriptionEnd',
              before: targetUser.subscriptionEnd?.toISOString() ?? null,
              after: expiresAt?.toISOString() ?? null,
            },
          ],
          extra: {
            duration: data.duration || 'permanent',
            expiresAt: expiresAt?.toISOString() || null,
          },
        }),
      },
    })
  })

  revalidatePath(`/admin/users/${data.userId}`)
  revalidatePath('/admin/users')
  revalidatePath('/admin')
  invalidateAdminDashboardOverview()
  return { success: true }
}

/**
 * 搜索用户以便进行权限覆写
 */
export async function searchUsersForOverride(query: string): Promise<PermissionSearchUser[]> {
  const currentUser = await resolveRequestAdminIdentity()
  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  if (!query || query.length < 2) {
    return []
  }

  // 检查是否为合法的 UUID 格式，如果是则进行精确匹配
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query)

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: 'insensitive' } },
        { username: { contains: query, mode: 'insensitive' } },
        ...(isUuid ? [{ id: query }] : []),
      ],
    },
    select: {
      id: true,
      email: true,
      username: true,
      subscriptionTier: true,
      subscriptionEnd: true,
      role: true,
    },
    take: 10,
  })

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    subscriptionTier: user.subscriptionTier,
    subscriptionEnd: user.subscriptionEnd?.toISOString() || null,
    role: user.role,
  }))
}

/**
 * 获取用户的权限覆写历史
 */
export async function getOverrideHistory(userId: string): Promise<OverrideHistoryItem[]> {
  const currentUser = await resolveRequestAdminIdentity()
  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  const history = await prisma.userPermissionOverride.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  // 由于 Schema 中未定义 admin 关系，手动获取管理员信息
  const adminIds = Array.from(new Set(history.map((h) => h.overriddenBy)))
  const admins = await prisma.user.findMany({
    where: { id: { in: adminIds } },
    select: {
      id: true,
      username: true,
      email: true,
    },
  })

  const adminMap = new Map(admins.map((a) => [a.id, a]))

  return history.map((h) => ({
    id: h.id,
    userId: h.userId,
    overriddenBy: h.overriddenBy,
    targetField: h.targetField,
    newValue: h.newValue,
    reason: h.reason,
    expiresAt: h.expiresAt?.toISOString() || null,
    createdAt: h.createdAt.toISOString(),
    admin: adminMap.get(h.overriddenBy),
  }))
}
