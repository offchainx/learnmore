/**
 * Impersonation Exit Endpoint
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * POST /api/auth/impersonate/end
 * 结束伪装会话，清除 Cookie，重定向回 Admin 页面
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyImpersonationToken, getImpersonationTokenFromCookie } from '@/lib/jwt'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie')
  const token = getImpersonationTokenFromCookie(cookieHeader)

  if (!token) {
    return NextResponse.json({ error: 'No impersonation session' }, { status: 400 })
  }

  // 验证 Token
  const payload = await verifyImpersonationToken(token)
  if (!payload) {
    // Token 无效，直接清除 Cookie
    const response = NextResponse.redirect(new URL('/admin/users', request.url))
    response.cookies.set('impersonation_token', '', { maxAge: 0, path: '/' })
    return response
  }

  // 更新会话记录
  try {
    await prisma.$transaction([
      prisma.impersonationSession.update({
        where: { id: payload.sessionId },
        data: {
          endedAt: new Date(),
          endReason: 'MANUAL_LOGOUT',
        },
      }),
      prisma.securityLog.create({
        data: {
          userId: payload.targetUserId,
          action: 'IMPERSONATE_END',
          metadata: {
            sessionId: payload.sessionId,
            adminId: payload.adminId,
            endReason: 'MANUAL_LOGOUT',
          },
        },
      }),
    ])
  } catch (error) {
    console.error('[impersonate/end] Error updating session:', error)
  }

  // 清除 Cookie 并重定向
  const response = NextResponse.redirect(
    new URL(`/admin/users/${payload.targetUserId}`, request.url)
  )
  response.cookies.set('impersonation_token', '', { maxAge: 0, path: '/' })

  return response
}

// 支持 GET 请求（从 Banner 点击链接退出）
export async function GET(request: NextRequest) {
  return POST(request)
}
