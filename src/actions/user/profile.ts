'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/user/auth'
import { z } from 'zod'
import { getHandleAvailability } from '@/lib/users/handle-server'
import { normalizeHandle } from '@/lib/users/handle'

const profileSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').optional(),
  handle: z.string().optional(),
  grade: z.coerce.number().min(7).max(9).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  // Preferences
  language: z.enum(['en', 'zh', 'ms']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notificationDaily: z.boolean().optional(),
  notificationWeekly: z.boolean().optional(),
})

export type ProfileFormState = {
  error?: string
  success?: boolean
}

export async function getProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  try {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        settings: true,
        badges: {
          include: {
            badge: true
          }
        },
        _count: {
          select: {
            posts: true,
            leaderboardEntries: true,
          }
        },
        referralsGiven: {
          where: {
            status: 'DEFERRED',
            deferredRewardWeeks: { gt: 0 },
          },
          select: {
            id: true,
            deferredRewardWeeks: true,
            deferredRewardTier: true,
          },
        },
      }
    })

    return profile
  } catch (error) {
    console.warn('[Profile] Falling back to lightweight profile due database schema mismatch:', error)
    return {
      ...user,
      settings: null,
      badges: [],
      _count: {
        posts: 0,
        leaderboardEntries: 0,
      },
      referralsGiven: [],
    }
  }
}

/**
 * Dashboard 首屏仅需用户基础信息 + settings。
 * 使用轻量查询避免拉取 badges/count/referrals 等重数据。
 */
export async function getDashboardProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    })

    return {
      ...user,
      settings,
    }
  } catch (error) {
    console.warn('[Profile] Falling back to dashboard profile due database schema mismatch:', error)
    return {
      ...user,
      settings: null,
    }
  }
}

/**
 * Dashboard 子页面仅需基础用户信息，不需要额外 settings 查询。
 * 直接复用 getCurrentUser 结果，减少重复数据库访问。
 */
export async function getDashboardShellProfile() {
  const user = await getCurrentUser()
  if (!user) return null
  return user
}

export async function updateProfile(prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const username = formData.get('username')
  const grade = formData.get('grade')
  const handle = formData.get('handle')
  const avatar = formData.get('avatar')
  const language = formData.get('language')
  const theme = formData.get('theme')
  const notificationDaily = formData.get('notificationDaily') === 'on'
  const notificationWeekly = formData.get('notificationWeekly') === 'on'

  const rawData = {
    username: username && username !== '' ? username : undefined,
    handle: handle && handle !== '' ? handle : undefined,
    grade: grade && grade !== '' ? grade : undefined,
    avatar: avatar && avatar !== '' ? avatar : undefined,
    language: language || undefined,
    theme: theme || undefined,
    notificationDaily: notificationDaily,
    notificationWeekly: notificationWeekly,
  }

  const result = profileSchema.safeParse(rawData)

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const data = result.data

  try {
    const normalizedHandle = data.handle ? normalizeHandle(data.handle) : undefined

    // Check if username is taken (if changed)
    if (data.username) {
      const existing = await prisma.user.findUnique({
        where: { username: data.username }
      })
      if (existing && existing.id !== user.id) {
        return { error: 'Username already taken' }
      }
    }

    if (normalizedHandle) {
      const availability = await getHandleAvailability(normalizedHandle, user.id)
      if (!availability.available) {
        return { error: availability.reason || '该账号标识暂不可用' }
      }
    }

    // Transaction to update both tables
    await prisma.$transaction(async (tx) => {
      // 1. Update User
      await tx.user.update({
        where: { id: user.id },
        data: {
          ...(data.username && { username: data.username }),
          ...(normalizedHandle && { handle: normalizedHandle }),
          ...(data.grade && { grade: data.grade }),
          ...(data.avatar !== undefined && { avatar: data.avatar || null }),
        }
      })

      // 2. Update Settings
      await tx.userSettings.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          language: data.language || 'en',
          theme: data.theme || 'system',
          notificationDaily: data.notificationDaily || false,
          notificationWeekly: data.notificationWeekly || false,
        },
        update: {
          ...(data.language && { language: data.language }),
          ...(data.theme && { theme: data.theme }),
          notificationDaily: data.notificationDaily,
          notificationWeekly: data.notificationWeekly,
        }
      })
    })

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard') 
    return { success: true }
  } catch (error) {
    console.error('Failed to update profile:', error)
    return { error: 'Failed to update profile' }
  }
}
