'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { z } from 'zod'

const aiConfigSchema = z.object({
  aiPersonality: z.enum(['ENCOURAGING', 'SOCRATIC', 'STRICT']),
  difficultyCalibration: z.coerce.number().min(0).max(100),
})

const preferencesSchema = z.object({
  language: z.enum(['en', 'zh', 'ms']),
  theme: z.enum(['light', 'dark', 'system']),
  notificationDaily: z.boolean().optional(),
  notificationWeekly: z.boolean().optional(),
})

export type SettingsFormState = {
  error?: string
  success?: boolean
}

export async function updateAIConfig(prevState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const rawData = {
    aiPersonality: formData.get('aiPersonality'),
    difficultyCalibration: formData.get('difficultyCalibration'),
  }

  const result = aiConfigSchema.safeParse(rawData)

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  try {
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        aiPersonality: result.data.aiPersonality,
        difficultyCalibration: result.data.difficultyCalibration,
      },
      update: {
        aiPersonality: result.data.aiPersonality,
        difficultyCalibration: result.data.difficultyCalibration,
      },
    })

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (error) {
    console.error('Failed to update AI config:', error)
    return { error: 'Failed to update AI settings' }
  }
}

export async function updatePreferences(prevState: SettingsFormState, formData: FormData): Promise<SettingsFormState> {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const rawData = {
    language: formData.get('language'),
    theme: formData.get('theme'),
    notificationDaily: formData.get('notificationDaily') === 'on',
    notificationWeekly: formData.get('notificationWeekly') === 'on',
  }

  const result = preferencesSchema.safeParse(rawData)

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  try {
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        language: result.data.language,
        theme: result.data.theme,
        notificationDaily: result.data.notificationDaily || false,
        notificationWeekly: result.data.notificationWeekly || false,
      },
      update: {
        language: result.data.language,
        theme: result.data.theme,
        notificationDaily: result.data.notificationDaily || false,
        notificationWeekly: result.data.notificationWeekly || false,
      },
    })

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (error) {
    console.error('Failed to update preferences:', error)
    return { error: 'Failed to update preferences' }
  }
}

export async function getUserSettings() {
  const user = await getCurrentUser()
  if (!user) return null

  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  })

  return settings
}
