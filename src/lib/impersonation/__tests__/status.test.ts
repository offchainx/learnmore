import { describe, expect, it } from 'vitest'
import type { ImpersonationTokenPayload } from '@/lib/jwt'
import { evaluateImpersonationSessionStatus, type ImpersonationSessionSnapshot } from '@/lib/impersonation/status'

function createBasePayload(): ImpersonationTokenPayload {
  return {
    sessionId: 'session-1',
    adminId: 'admin-1',
    targetUserId: 'user-1',
    type: 'impersonation',
  }
}

function createBaseSession(): ImpersonationSessionSnapshot {
  return {
    id: 'session-1',
    adminId: 'admin-1',
    targetUserId: 'user-1',
    token: 'token-abc',
    endedAt: null,
    expiresAt: new Date('2099-01-01T00:00:00.000Z'),
  }
}

describe('evaluateImpersonationSessionStatus', () => {
  it('活跃会话应返回 isImpersonating=true', () => {
    const result = evaluateImpersonationSessionStatus({
      session: createBaseSession(),
      payload: createBasePayload(),
      token: 'token-abc',
      now: new Date('2026-03-05T00:00:00.000Z'),
    })

    expect(result).toEqual({
      isImpersonating: true,
      reason: 'ACTIVE',
    })
  })

  it('会话不存在时返回 false', () => {
    const result = evaluateImpersonationSessionStatus({
      session: null,
      payload: createBasePayload(),
      token: 'token-abc',
    })

    expect(result).toEqual({
      isImpersonating: false,
      reason: 'SESSION_NOT_FOUND',
    })
  })

  it('会话已结束时返回 false', () => {
    const result = evaluateImpersonationSessionStatus({
      session: {
        ...createBaseSession(),
        endedAt: new Date('2026-03-05T00:00:00.000Z'),
      },
      payload: createBasePayload(),
      token: 'token-abc',
    })

    expect(result).toEqual({
      isImpersonating: false,
      reason: 'SESSION_ENDED',
    })
  })

  it('会话过期时返回 false', () => {
    const result = evaluateImpersonationSessionStatus({
      session: {
        ...createBaseSession(),
        expiresAt: new Date('2026-03-05T00:00:00.000Z'),
      },
      payload: createBasePayload(),
      token: 'token-abc',
      now: new Date('2026-03-05T00:00:01.000Z'),
    })

    expect(result).toEqual({
      isImpersonating: false,
      reason: 'SESSION_EXPIRED',
    })
  })

  it('payload 与会话不一致时返回 false', () => {
    const result = evaluateImpersonationSessionStatus({
      session: createBaseSession(),
      payload: {
        ...createBasePayload(),
        targetUserId: 'user-2',
      },
      token: 'token-abc',
    })

    expect(result).toEqual({
      isImpersonating: false,
      reason: 'PAYLOAD_MISMATCH',
    })
  })

  it('token 与会话不一致时返回 false', () => {
    const result = evaluateImpersonationSessionStatus({
      session: createBaseSession(),
      payload: createBasePayload(),
      token: 'token-def',
    })

    expect(result).toEqual({
      isImpersonating: false,
      reason: 'TOKEN_MISMATCH',
    })
  })
})
