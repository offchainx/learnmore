'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { z } from 'zod'

const profileSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').optional(),
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
          errorBook: true,
          posts: true,
          leaderboardEntries: true,
        }
      }
    }
  })

  return profile
}

export async function updateProfile(prevState: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const username = formData.get('username')
  const grade = formData.get('grade')
  const avatar = formData.get('avatar')
  const language = formData.get('language')
  const theme = formData.get('theme')
  const notificationDaily = formData.get('notificationDaily') === 'on'
  const notificationWeekly = formData.get('notificationWeekly') === 'on'

  const rawData = {
    username: username && username !== '' ? username : undefined,
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
    // Check if username is taken (if changed)
    if (data.username) {
      const existing = await prisma.user.findUnique({
        where: { username: data.username }
      })
      if (existing && existing.id !== user.id) {
        return { error: 'Username already taken' }
      }
    }

    // Transaction to update both tables
    await prisma.$transaction(async (tx) => {
      // 1. Update User
      await tx.user.update({
        where: { id: user.id },
        data: {
          ...(data.username && { username: data.username }),
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