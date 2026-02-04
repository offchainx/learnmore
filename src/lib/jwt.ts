/**
 * JWT Utilities for Impersonation
 * Story-046: 用户全生命周期管理后台 - Task B
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

// 使用环境变量中的密钥，回退到 Supabase JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'fallback-secret-for-dev'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface ImpersonationTokenPayload extends JWTPayload {
  sessionId: string
  adminId: string
  targetUserId: string
  type: 'impersonation'
}

/**
 * 签发伪装登录 Token
 */
export async function signImpersonationToken(payload: {
  sessionId: string
  adminId: string
  targetUserId: string
  exp: Date
}): Promise<string> {
  const token = await new SignJWT({
    sessionId: payload.sessionId,
    adminId: payload.adminId,
    targetUserId: payload.targetUserId,
    type: 'impersonation',
  } as ImpersonationTokenPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(payload.exp)
    .setIssuer('learnmore-admin')
    .setSubject(payload.targetUserId)
    .sign(secret)

  return token
}

/**
 * 验证伪装登录 Token
 */
export async function verifyImpersonationToken(
  token: string
): Promise<ImpersonationTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'learnmore-admin',
    })

    // 验证 payload 类型
    if (
      payload.type !== 'impersonation' ||
      !payload.sessionId ||
      !payload.adminId ||
      !payload.targetUserId
    ) {
      return null
    }

    return payload as ImpersonationTokenPayload
  } catch (error) {
    console.error('[verifyImpersonationToken] Error:', error)
    return null
  }
}

/**
 * 从 Cookie 中解析伪装 Token
 */
export function getImpersonationTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    },
    {} as Record<string, string>
  )

  return cookies['impersonation_token'] || null
}
