'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { z } from 'zod'

const profileSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').optional(),
  grade: z.coerce.number().min(7).max(9).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
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

  const rawData = {
    username: username && username !== '' ? username : undefined,
    grade: grade && grade !== '' ? grade : undefined,
    avatar: avatar && avatar !== '' ? avatar : undefined,
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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.username && { username: data.username }),
        ...(data.grade && { grade: data.grade }),
        ...(data.avatar !== undefined && { avatar: data.avatar || null }),
      }
    })

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard') // Update sidebar avatar if changed
    return { success: true }
  } catch (error) {
    console.error('Failed to update profile:', error)
    return { error: 'Failed to update profile' }
  }
}
