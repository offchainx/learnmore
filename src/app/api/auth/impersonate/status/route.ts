/**
 * Impersonation Status Check Endpoint
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * GET /api/auth/impersonate/status
 * 检查当前是否处于伪装状态
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyImpersonationToken } from '@/lib/jwt'
import prisma from '@/lib/prisma'
import { evaluateImpersonationSessionStatus } from '@/lib/impersonation/status'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('impersonation_token')?.value

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
      select: {
        id: true,
        adminId: true,
        targetUserId: true,
        token: true,
        endedAt: true,
        expiresAt: true,
        targetUser: {
          select: { email: true },
        },
      },
    })

    const status = evaluateImpersonationSessionStatus({
      session,
      payload,
      token,
    })

    if (!status.isImpersonating || !session) {
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
