import { Prisma, PrismaClient, ReferralAttributionEventType } from '@prisma/client'
import prisma from '@/lib/prisma'

export type ReferralAttributionClient = Prisma.TransactionClient | PrismaClient

export type ReferralAttributionEventInput = {
  referralCode: string
  eventType: ReferralAttributionEventType
  referralId?: string | null
  referrerId?: string | null
  refereeId?: string | null
  sourcePath?: string | null
  destinationPath?: string | null
  success?: boolean
  errorCode?: string | null
  metadata?: Prisma.InputJsonValue
}

export function normalizeReferralCode(value?: string | null) {
  const normalized = value?.trim().toUpperCase()
  return normalized || null
}

export async function recordReferralAttributionEvent(
  tx: ReferralAttributionClient,
  input: ReferralAttributionEventInput,
) {
  const normalizedCode = normalizeReferralCode(input.referralCode)
  if (!normalizedCode) {
    return null
  }

  return tx.referralAttributionEvent.create({
    data: {
      referralCode: normalizedCode,
      eventType: input.eventType,
      success: input.success ?? true,
      errorCode: input.errorCode ?? null,
      referralId: input.referralId ?? null,
      referrerId: input.referrerId ?? null,
      refereeId: input.refereeId ?? null,
      sourcePath: input.sourcePath ?? null,
      destinationPath: input.destinationPath ?? null,
      metadata: input.metadata,
    },
  })
}

export async function lookupReferrerByReferralCode(referralCode: string) {
  const normalizedCode = normalizeReferralCode(referralCode)
  if (!normalizedCode) {
    return null
  }

  return prisma.user.findUnique({
    where: { referralCode: normalizedCode },
    select: {
      id: true,
      referralCode: true,
    },
  })
}
