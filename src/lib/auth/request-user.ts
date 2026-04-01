import { headers } from 'next/headers'
import { UserRole } from '@prisma/client'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { INTERNAL_AUTH_USER_ID_HEADER } from './request-context'

export type RequestUserIdentity = {
  id: string
  email: string | null
  username: string | null
  role: UserRole | null
}

function readForwardedUserId(requestHeaders?: Headers): string | null {
  return requestHeaders?.get(INTERNAL_AUTH_USER_ID_HEADER)?.trim() || null
}

async function readSupabaseUserId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user?.id ?? null
}

async function resolveHeaderUserId(): Promise<string | null> {
  const incomingHeaders = await headers()
  return readForwardedUserId(incomingHeaders)
}

export async function resolveRequestUserId(
  requestHeaders?: Headers
): Promise<string | null> {
  const forwardedUserId = readForwardedUserId(requestHeaders)
  if (forwardedUserId) return forwardedUserId

  if (!requestHeaders) {
    const headerUserId = await resolveHeaderUserId()
    if (headerUserId) return headerUserId
  }

  return readSupabaseUserId()
}

export async function resolveRequestUserIdentity(
  requestHeaders?: Headers
): Promise<RequestUserIdentity | null> {
  const userId = await resolveRequestUserId(requestHeaders)
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    },
  })

  return user
}

export async function resolveRequestAdminIdentity(
  requestHeaders?: Headers,
  allowTeacher = false
): Promise<RequestUserIdentity | null> {
  const user = await resolveRequestUserIdentity(requestHeaders)
  if (!user) return null

  if (user.role === 'ADMIN') return user
  if (allowTeacher && user.role === 'TEACHER') return user

  return null
}
