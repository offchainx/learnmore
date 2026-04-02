/**
 * Impersonation Entry Endpoint
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * GET /api/auth/impersonate?token=xxx
 * 验证 Token 并设置伪装 Cookie，重定向到 Dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyImpersonationToken } from '@/lib/jwt'
import prisma from '@/lib/prisma'
import { runAfterTask } from '@/lib/server/run-after-task'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/admin/users?error=missing_token', request.url))
  }

  // 验证 Token
  const payload = await verifyImpersonationToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/admin/users?error=invalid_token', request.url))
  }

  // 检查会话是否有效
  const session = await prisma.impersonationSession.findUnique({
    where: { id: payload.sessionId },
  })

  if (!session || session.endedAt) {
    return NextResponse.redirect(new URL('/admin/users?error=session_ended', request.url))
  }

  // 检查是否过期
  if (new Date() > session.expiresAt) {
    // 标记会话过期
    await prisma.impersonationSession.update({
      where: { id: session.id },
      data: {
        endedAt: new Date(),
        endReason: 'TOKEN_EXPIRED',
      },
    })

    runAfterTask(async () => {
      await prisma.securityLog.create({
        data: {
          userId: session.targetUserId,
          action: 'IMPERSONATE_END',
          metadata: {
            sessionId: session.id,
            endReason: 'TOKEN_EXPIRED',
          },
        },
      })
    }, 'impersonate-token-expired-audit')

    return NextResponse.redirect(new URL('/admin/users?error=token_expired', request.url))
  }

  // 设置伪装 Cookie 并重定向到 Dashboard
  const response = NextResponse.redirect(new URL('/dashboard', request.url))

  response.cookies.set('impersonation_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor((session.expiresAt.getTime() - Date.now()) / 1000), // 剩余秒数
  })

  return response
}
