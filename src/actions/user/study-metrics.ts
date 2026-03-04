'use server'

import prisma from '@/lib/prisma'

const MAX_STUDY_SECONDS_PER_EVENT = 6 * 60 * 60

function normalizeStudySeconds(rawSeconds: number | null | undefined): number {
  if (typeof rawSeconds !== 'number' || !Number.isFinite(rawSeconds)) return 0
  if (rawSeconds <= 0) return 0

  const rounded = Math.round(rawSeconds)
  return Math.min(rounded, MAX_STUDY_SECONDS_PER_EVENT)
}

export async function incrementTotalStudyTime(
  userId: string,
  rawSeconds: number | null | undefined
): Promise<number> {
  const secondsToAdd = normalizeStudySeconds(rawSeconds)
  if (secondsToAdd <= 0) return 0

  await prisma.user.update({
    where: { id: userId },
    data: {
      totalStudyTime: { increment: secondsToAdd },
    },
  })

  return secondsToAdd
}
