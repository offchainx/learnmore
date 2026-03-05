import type { ImpersonationTokenPayload } from '@/lib/jwt'

export type ImpersonationSessionSnapshot = {
  id: string
  adminId: string
  targetUserId: string
  token: string
  endedAt: Date | null
  expiresAt: Date
}

export type ImpersonationStatusReason =
  | 'ACTIVE'
  | 'SESSION_NOT_FOUND'
  | 'SESSION_ENDED'
  | 'SESSION_EXPIRED'
  | 'PAYLOAD_MISMATCH'
  | 'TOKEN_MISMATCH'

export function evaluateImpersonationSessionStatus(params: {
  session: ImpersonationSessionSnapshot | null
  payload: ImpersonationTokenPayload
  token: string
  now?: Date
}): { isImpersonating: boolean; reason: ImpersonationStatusReason } {
  const { session, payload, token } = params
  const now = params.now ?? new Date()

  if (!session) {
    return { isImpersonating: false, reason: 'SESSION_NOT_FOUND' }
  }

  if (session.adminId !== payload.adminId || session.targetUserId !== payload.targetUserId) {
    return { isImpersonating: false, reason: 'PAYLOAD_MISMATCH' }
  }

  if (session.token !== token) {
    return { isImpersonating: false, reason: 'TOKEN_MISMATCH' }
  }

  if (session.endedAt) {
    return { isImpersonating: false, reason: 'SESSION_ENDED' }
  }

  if (now > session.expiresAt) {
    return { isImpersonating: false, reason: 'SESSION_EXPIRED' }
  }

  return { isImpersonating: true, reason: 'ACTIVE' }
}
