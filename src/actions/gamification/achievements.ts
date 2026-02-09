'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/user/auth'
import { calculateLevel, calculateNextLevelXp } from '@/lib/gamification'
import type {
  AchievementOverview,
  BadgeWithUnlockStatus,
} from '@/lib/gamification/achievements-types'

const BADGE_DEFINITIONS = [
  {
    code: 'first_practice',
    name: 'First Blood',
    description: '完成首次练习提交',
    icon: 'Target',
    condition: '累计提交练习 >= 1',
  },
  {
    code: 'practice_master_100',
    name: 'Practice Master',
    description: '累计正确题数达到 100 题',
    icon: 'Brain',
    condition: '累计答对 >= 100',
  },
  {
    code: 'streak_7_days',
    name: '7-Day Streak',
    description: '连续学习达到 7 天',
    icon: 'Flame',
    condition: 'streak >= 7',
  },
  {
    code: 'community_helper_10',
    name: 'Community Helper',
    description: '社区发帖与评论总计达到 10 次',
    icon: 'MessageSquare',
    condition: 'posts + comments >= 10',
  },
] as const

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

export async function getAchievementOverview(inputUserId?: string): Promise<AchievementOverview | null> {
  const userId = await resolveUserId(inputUserId)
  if (!userId) return null

  const [user, totalAttempts, correctAttempts, posts, comments] = await Promise.all([
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

  return {
    streak: user.streak,
    questions: totalAttempts,
    accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
    hours: (user.totalStudyTime / 3600).toFixed(1),
    level,
    xp: user.xp,
    nextLevelXp,
    posts,
    comments,
  }
}

export async function listUserBadges(inputUserId?: string): Promise<BadgeWithUnlockStatus[]> {
  const userId = await resolveUserId(inputUserId)
  if (!userId) return []

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

  const userBadgeMap = new Map(userBadges.map((item) => [item.badgeId, item.awardedAt]))

  return badges.map((badge) => ({
    id: badge.id,
    code: badge.code,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    condition: badge.condition,
    unlocked: userBadgeMap.has(badge.id),
    awardedAt: userBadgeMap.get(badge.id) ?? null,
  }))
}

export async function awardBadgeIfEligible(userId: string, trigger: 'PRACTICE' | 'COMMUNITY' | 'STREAK') {
  if (!userId) {
    return { awardedCodes: [] as string[] }
  }

  await ensureDefaultBadges()

  const [user, totalAttempts, correctAttempts, postCount, commentCount] = await Promise.all([
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

  return { awardedCodes: newBadges.map((badge) => badge.code) }
}
