/**
 * Impersonation Status Check Endpoint
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * GET /api/auth/impersonate/status
 * 检查当前是否处于伪装状态
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyImpersonationToken, getImpersonationTokenFromCookie } from '@/lib/jwt'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie')
  const token = getImpersonationTokenFromCookie(cookieHeader)

  if (!token) {
    return NextResponse.json({ isImpersonating: false })
  }

  // 验证 Token
  const payload = await verifyImpersonationToken(token)
  if (!payload) {
    return NextResponse.json({ isImpersonating: false })
  }

  // 获取会话和目标用户信息
  try {
    const session = await prisma.impersonationSession.findUnique({
      where: { id: payload.sessionId },
      include: {
        targetUser: {
          select: { email: true },
        },
      },
    })

    if (!session || session.endedAt) {
      return NextResponse.json({ isImpersonating: false })
    }

    // 检查是否过期
    if (new Date() > session.expiresAt) {
      return NextResponse.json({ isImpersonating: false })
    }

    return NextResponse.json({
      isImpersonating: true,
      targetEmail: session.targetUser.email,
      targetUserId: session.targetUserId,
      expiresAt: session.expiresAt.toISOString(),
      sessionId: session.id,
    })
  } catch (error) {
    console.error('[impersonate/status] Error:', error)
    return NextResponse.json({ isImpersonating: false })
  }
}
