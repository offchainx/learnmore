/**
 * Impersonation Exit Endpoint
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * POST /api/auth/impersonate/end
 * 结束伪装会话，清除 Cookie，重定向回 Admin 页面
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyImpersonationToken, getImpersonationTokenFromCookie, decodeTokenPayload } from '@/lib/jwt'
import prisma from '@/lib/prisma'
import { runAfterTask } from '@/lib/server/run-after-task'
import { buildSecurityLogMetadata } from '@/lib/admin/security-log'
import { invalidateAdminDashboardOverview } from '@/lib/cache/sitewide'

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie')
  const token = getImpersonationTokenFromCookie(cookieHeader)

  if (!token) {
    return NextResponse.json({ error: 'No impersonation session' }, { status: 400 })
  }

  // 验证 Token
  const payload = await verifyImpersonationToken(token)
  if (!payload) {
    const reason = request.nextUrl.searchParams.get('reason')

    // Token 过期（由 middleware 检测并重定向至此）→ 解码 payload 做审计清理
    if (reason === 'TOKEN_EXPIRED' && token) {
      const decoded = decodeTokenPayload(token)
      if (decoded) {
        try {
          await prisma.$transaction([
            prisma.impersonationSession.update({
              where: { id: decoded.sessionId },
              data: {
                endedAt: new Date(),
                endReason: 'TOKEN_EXPIRED',
              },
            }),
          ])
          runAfterTask(async () => {
            await prisma.securityLog.create({
              data: {
                userId: decoded.targetUserId,
                action: 'IMPERSONATE_END',
                metadata: buildSecurityLogMetadata({
                  operator: {
                    id: decoded.adminId,
                  },
                  target: {
                    id: decoded.targetUserId,
                  },
                  extra: {
                    sessionId: decoded.sessionId,
                    endReason: 'TOKEN_EXPIRED',
                  },
                }),
              },
            })
            invalidateAdminDashboardOverview()
          }, 'impersonate-end-expired-audit')
        } catch (error) {
          console.error('[impersonate/end] TOKEN_EXPIRED 审计清理失败:', error)
        }
      }
      // 清除 Cookie → 重定向登录页
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.set('impersonation_token', '', { maxAge: 0, path: '/' })
      return response
    }

    // 其他无效 Token（签名篡改等）→ 直接清除 Cookie
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
    ])
    runAfterTask(async () => {
      await prisma.securityLog.create({
        data: {
          userId: payload.targetUserId,
          action: 'IMPERSONATE_END',
          metadata: buildSecurityLogMetadata({
            operator: {
              id: payload.adminId,
            },
            target: {
              id: payload.targetUserId,
            },
            extra: {
              sessionId: payload.sessionId,
              endReason: 'MANUAL_LOGOUT',
            },
          }),
        },
      })
      invalidateAdminDashboardOverview()
    }, 'impersonate-end-manual-audit')
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
