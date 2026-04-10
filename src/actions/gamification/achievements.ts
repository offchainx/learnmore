'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/user/auth'
import { calculateLevel, calculateNextLevelXp } from '@/lib/gamification'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badge-definitions'
import { revalidateTag } from 'next/cache'
import type {
  AchievementOverview,
  BadgeWithUnlockStatus,
} from '@/lib/gamification/achievements-types'
import { logPerf } from '@/lib/perf-log'

export type { AchievementOverview, BadgeWithUnlockStatus }

async function resolveUserId(inputUserId?: string) {
  if (inputUserId) return inputUserId
  const user = await getCurrentUser()
  return user?.id || null
}

export async function ensureDefaultBadges() {
  await prisma.badge.createMany({
    data: BADGE_DEFINITIONS.map((badge) => ({
      code: badge.code,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      condition: badge.condition,
    })),
    skipDuplicates: true,
  })
}

export async function getAchievementOverview(
  inputUserId?: string
): Promise<AchievementOverview | null> {
  const startedAt = performance.now()
  const userId = await resolveUserId(inputUserId)
  if (!userId) {
    logPerf('getAchievementOverview', startedAt, { status: 'no-user' })
    return null
  }

  const [user, totalAttempts, correctAttempts, posts, comments] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true, totalStudyTime: true, xp: true },
      }),
      prisma.userAttempt.count({ where: { userId } }),
      prisma.userAttempt.count({ where: { userId, isCorrect: true } }),
      prisma.post.count({ where: { authorId: userId } }),
      prisma.comment.count({ where: { authorId: userId } }),
    ])

  if (!user) return null

  const level = calculateLevel(user.xp)
  const nextLevelXp = calculateNextLevelXp(level)

  const result = {
    streak: user.streak,
    questions: totalAttempts,
    correctAnswers: correctAttempts,
    accuracy:
      totalAttempts > 0
        ? Math.round((correctAttempts / totalAttempts) * 100)
        : 0,
    hours: (user.totalStudyTime / 3600).toFixed(1),
    level,
    xp: user.xp,
    nextLevelXp,
    posts,
    comments,
  }
  logPerf('getAchievementOverview', startedAt, {
    userId,
    status: 'ok',
  })
  return result
}

export async function listUserBadges(
  inputUserId?: string
): Promise<BadgeWithUnlockStatus[]> {
  const startedAt = performance.now()
  const userId = await resolveUserId(inputUserId)
  if (!userId) {
    logPerf('listUserBadges', startedAt, { status: 'no-user' })
    return []
  }

  await ensureDefaultBadges()

  const [badges, userBadges] = await Promise.all([
    prisma.badge.findMany({
      orderBy: { createdAt: 'asc' },
    }),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true, awardedAt: true },
    }),
  ])

  const userBadgeMap = new Map(
    userBadges.map((item) => [item.badgeId, item.awardedAt])
  )

  const result = badges.map((badge) => ({
    id: badge.id,
    code: badge.code,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    condition: badge.condition,
    unlocked: userBadgeMap.has(badge.id),
    awardedAt: userBadgeMap.get(badge.id) ?? null,
  }))
  logPerf('listUserBadges', startedAt, {
    userId,
    badgeCount: result.length,
  })
  return result
}

export async function awardBadgeIfEligible(
  userId: string,
  trigger: 'PRACTICE' | 'COMMUNITY' | 'STREAK'
) {
  if (!userId) {
    return { awardedCodes: [] as string[] }
  }

  await ensureDefaultBadges()

  const [user, totalAttempts, correctAttempts, postCount, commentCount] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { streak: true },
      }),
      prisma.userAttempt.count({ where: { userId } }),
      prisma.userAttempt.count({ where: { userId, isCorrect: true } }),
      prisma.post.count({ where: { authorId: userId } }),
      prisma.comment.count({ where: { authorId: userId } }),
    ])

  if (!user) {
    return { awardedCodes: [] as string[] }
  }

  const communityInteractions = postCount + commentCount

  const eligibility: Record<string, boolean> = {
    first_practice: totalAttempts >= 1,
    practice_master_100: correctAttempts >= 100,
    streak_7_days: user.streak >= 7,
    community_helper_10: communityInteractions >= 10,
  }

  const candidateCodes = Object.entries(eligibility)
    .filter(([, ok]) => ok)
    .map(([code]) => code)

  if (candidateCodes.length === 0) {
    return { awardedCodes: [] as string[] }
  }

  const badges = await prisma.badge.findMany({
    where: {
      code: { in: candidateCodes },
    },
    select: { id: true, code: true, name: true },
  })

  if (badges.length === 0) {
    return { awardedCodes: [] as string[] }
  }

  const existing = await prisma.userBadge.findMany({
    where: {
      userId,
      badgeId: { in: badges.map((b) => b.id) },
    },
    select: { badgeId: true },
  })

  const existingSet = new Set(existing.map((item) => item.badgeId))
  const newBadges = badges.filter((badge) => !existingSet.has(badge.id))

  if (newBadges.length === 0) {
    return { awardedCodes: [] as string[] }
  }

  await prisma.$transaction(async (tx) => {
    await tx.userBadge.createMany({
      data: newBadges.map((badge) => ({ userId, badgeId: badge.id })),
      skipDuplicates: true,
    })

    await tx.notification.createMany({
      data: newBadges.map((badge) => ({
        userId,
        type: 'ACHIEVEMENT',
        title: '成就已解锁',
        content: `你已解锁成就：${badge.name}`,
        metadata: {
          badgeCode: badge.code,
          source: trigger,
        },
      })),
      skipDuplicates: false,
    })
  })

  try {
    revalidateTag(`achievement-overview:${userId}`, 'quick')
    revalidateTag(`user-badges:${userId}`, 'quick')
  } catch (error) {
    console.warn('[Achievements] Cache invalidation skipped outside request context:', error)
  }

  return { awardedCodes: newBadges.map((badge) => badge.code) }
}
