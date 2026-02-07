'use server'

/**
 * Admin User Operations - Server Actions
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * 包含：用户状态管理、备注系统、伪装登录
 */

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/user/auth'
import { revalidatePath } from 'next/cache'
import { signImpersonationToken } from '@/lib/jwt'
import { Admin } from '@/types'
import { getUserById } from '@/components/admin/users/mock/userMockData'

// ============ 权限检查 ============

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('未登录')
  }
  if (user.role !== 'ADMIN') {
    throw new Error('权限不足：需要管理员权限')
  }
  return user
}

// ============ 获取用户详情 ============

export async function getUserDetail(userId: string): Promise<Admin.ActionResult<Admin.UserDetail>> {
  try {
    await requireAdmin()

    let userDetail: Admin.UserDetail | null = null

    // 如果 ID 是 Mock 格式（以 usr_ 开头），直接使用 Mock 数据，不查询数据库
    // 否则 Prisma 会抛出 UUID 格式错误
    if (userId.startsWith('usr_')) {
      const mockUser = getUserById(userId)
      if (mockUser) {
        userDetail = {
          ...mockUser,
          notes: [],
          recentSecurityLogs: [],
          activeImpersonationSession: null,
        }
      }
    } else {
      // 尝试从数据库查询
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            adminNotes: {
              orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
              take: 50,
            },
            securityLogs: {
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
            impersonationSessions: {
              where: { endedAt: null },
              orderBy: { startedAt: 'desc' },
              take: 1,
            },
            settings: true,
          },
        })

        if (dbUser) {
          // 转换为前端类型
          const notes: Admin.AdminNote[] = dbUser.adminNotes.map((n) => ({
            id: n.id,
            userId: n.userId,
            authorId: n.authorId,
            content: n.content,
            isPinned: n.isPinned,
            createdAt: n.createdAt.toISOString(),
            updatedAt: n.updatedAt.toISOString(),
            deletedAt: n.deletedAt?.toISOString() || null,
          }))

          const recentSecurityLogs: Admin.SecurityLogEntry[] = dbUser.securityLogs.map((l) => ({
            id: l.id,
            userId: l.userId,
            action: l.action as Admin.SecurityAction,
            ipAddress: l.ipAddress,
            userAgent: l.userAgent,
            metadata: l.metadata as Record<string, unknown> | null,
            createdAt: l.createdAt.toISOString(),
          }))

          const activeSession = dbUser.impersonationSessions[0]

          // 映射 DB status → 前端 Admin.UserStatus 枚举
          const statusMap: Record<string, Admin.UserStatus> = {
            ACTIVE: Admin.UserStatus.ACTIVE,
            BANNED: Admin.UserStatus.BANNED,
            PAUSED: Admin.UserStatus.PAUSED,
          }

          userDetail = {
            id: dbUser.id,
            name: dbUser.username || dbUser.email.split('@')[0],
            email: dbUser.email,
            avatarColor: 'bg-blue-500',
            status: statusMap[dbUser.status] || Admin.UserStatus.ACTIVE,
            tier: (dbUser.subscriptionTier as Admin.SubscriptionTier) || Admin.SubscriptionTier.STARTER,
            lastActive: dbUser.lastSignInAt?.toISOString() || dbUser.createdAt.toISOString(),
            lastActiveLabel: formatRelativeTime(dbUser.lastSignInAt || dbUser.createdAt),
            grade: dbUser.grade ? `${dbUser.grade}年级` : '未设置',
            school: '未设置',
            role: dbUser.role,
            location: '未设置',
            phone: '未设置',
            joinDate: dbUser.createdAt.toISOString(),
            joinSource: dbUser.utmSource || '直接访问',
            totalSpend: 0,
            projectsCount: 0,
            apiCalls: 0,
            activeDeviceCount: 1,
            learningStats: {
              totalQuestions: 0,
              accuracy: 0,
              mistakes: 0,
              daysActive: dbUser.streak || 0,
            },
            notes,
            recentSecurityLogs,
            activeImpersonationSession: activeSession
              ? {
                  id: activeSession.id,
                  adminId: activeSession.adminId,
                  targetUserId: activeSession.targetUserId,
                  startedAt: activeSession.startedAt.toISOString(),
                  expiresAt: activeSession.expiresAt.toISOString(),
                  endedAt: activeSession.endedAt?.toISOString() || null,
                  endReason: activeSession.endReason as 'MANUAL_LOGOUT' | 'TOKEN_EXPIRED' | 'ADMIN_REVOKED' | null,
                }
              : null,
          }
        }
      } catch (dbError) {
        // 如果数据库查询出错（例如非法 UUID），记录错误但不中断，尝试 Mock（虽然上面已经处理了 Mock ID）
        console.error('[getAdmin.UserDetail] DB Query skipped or failed:', dbError)
      }
    }

    if (!userDetail) {
      return { success: false, error: '用户不存在' }
    }

    return { success: true, data: userDetail }
  } catch (error) {
    console.error('[getAdmin.UserDetail] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : '获取用户详情失败' }
  }
}

// ============ 用户状态管理 ============

export async function toggleUserStatus(
  userId: string,
  action: 'ban' | 'unban',
  reason: string
): Promise<Admin.ActionResult> {
  try {
    const admin = await requireAdmin()

    if (reason.length < 10) {
      return { success: false, error: '原因至少需要10个字符' }
    }

    // 使用事务确保审计日志和状态变更原子性
    await prisma.$transaction(async (tx) => {
      // 1. 写入审计日志（先写审计，保证痕迹不丢失）
      await tx.securityLog.create({
        data: {
          userId,
          action: action === 'ban' ? 'USER_BANNED' : 'USER_UNBANNED',
          metadata: {
            adminId: admin.id,
            adminEmail: admin.email,
            reason,
          },
        },
      })

      // 2. 更新用户状态
      await tx.user.update({
        where: { id: userId },
        data: {
          status: action === 'ban' ? 'BANNED' : 'ACTIVE',
        },
      })
    })

    revalidatePath(`/admin/users/${userId}`)
    return { success: true }
  } catch (error) {
    console.error('[toggleAdmin.UserStatus] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : '操作失败' }
  }
}

// ============ Admin Note 系统 ============

export async function addAdminNote(userId: string, content: string): Promise<Admin.ActionResult<Admin.AdminNote>> {
  try {
    const admin = await requireAdmin()

    if (!content.trim()) {
      return { success: false, error: '备注内容不能为空' }
    }

    const [note] = await prisma.$transaction([
      prisma.adminNote.create({
        data: {
          userId,
          authorId: admin.id,
          content: content.trim(),
        },
      }),
      prisma.securityLog.create({
        data: {
          userId,
          action: 'ADMIN_NOTE_ADDED',
          metadata: {
            adminId: admin.id,
            adminEmail: admin.email,
          },
        },
      }),
    ])

    revalidatePath(`/admin/users/${userId}`)
    return {
      success: true,
      data: {
        id: note.id,
        userId: note.userId,
        authorId: note.authorId,
        content: note.content,
        isPinned: note.isPinned,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        deletedAt: null,
      },
    }
  } catch (error) {
    console.error('[addAdmin.AdminNote] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : '添加备注失败' }
  }
}

export async function softDeleteAdminNote(noteId: string): Promise<Admin.ActionResult> {
  try {
    const admin = await requireAdmin()

    const note = await prisma.adminNote.findUnique({ where: { id: noteId } })
    if (!note) {
      return { success: false, error: '备注不存在' }
    }

    await prisma.$transaction([
      prisma.adminNote.update({
        where: { id: noteId },
        data: { deletedAt: new Date() },
      }),
      prisma.securityLog.create({
        data: {
          userId: note.userId,
          action: 'ADMIN_NOTE_DELETED',
          metadata: {
            adminId: admin.id,
            adminEmail: admin.email,
            noteId,
          },
        },
      }),
    ])

    revalidatePath(`/admin/users/${note.userId}`)
    return { success: true }
  } catch (error) {
    console.error('[softDeleteAdmin.AdminNote] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : '删除备注失败' }
  }
}

export async function restoreAdminNote(noteId: string): Promise<Admin.ActionResult> {
  try {
    const admin = await requireAdmin()

    const note = await prisma.adminNote.findUnique({ where: { id: noteId } })
    if (!note) {
      return { success: false, error: '备注不存在' }
    }

    await prisma.$transaction([
      prisma.adminNote.update({
        where: { id: noteId },
        data: { deletedAt: null },
      }),
      prisma.securityLog.create({
        data: {
          userId: note.userId,
          action: 'ADMIN_NOTE_RESTORED',
          metadata: {
            adminId: admin.id,
            adminEmail: admin.email,
            noteId,
          },
        },
      }),
    ])

    revalidatePath(`/admin/users/${note.userId}`)
    return { success: true }
  } catch (error) {
    console.error('[restoreAdmin.AdminNote] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : '恢复备注失败' }
  }
}

export async function toggleNotePin(noteId: string): Promise<Admin.ActionResult> {
  try {
    await requireAdmin()

    const note = await prisma.adminNote.findUnique({ where: { id: noteId } })
    if (!note) {
      return { success: false, error: '备注不存在' }
    }

    await prisma.adminNote.update({
      where: { id: noteId },
      data: { isPinned: !note.isPinned },
    })

    revalidatePath(`/admin/users/${note.userId}`)
    return { success: true }
  } catch (error) {
    console.error('[toggleNotePin] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : '操作失败' }
  }
}

// ============ 伪装登录 ============

export async function impersonateUser(
  targetUserId: string,
  reason: string
): Promise<Admin.ActionResult<{ redirectUrl: string }>> {
  try {
    const admin = await requireAdmin()

    if (reason.length < 10) {
      return { success: false, error: '原因至少需要10个字符' }
    }

    // 检查目标用户是否存在
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } })
    if (!targetUser) {
      return { success: false, error: '目标用户不存在' }
    }

    // 不能伪装自己
    if (admin.id === targetUserId) {
      return { success: false, error: '不能伪装自己' }
    }

    // 不能伪装其他管理员
    if (targetUser.role === 'ADMIN') {
      return { success: false, error: '不能伪装其他管理员' }
    }

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 小时后过期

    // 使用事务
    const session = await prisma.$transaction(async (tx) => {
      // 1. 写入审计日志
      await tx.securityLog.create({
        data: {
          userId: targetUserId,
          action: 'IMPERSONATE_START',
          metadata: {
            adminId: admin.id,
            adminEmail: admin.email,
            reason,
          },
        },
      })

      // 2. 创建伪装会话（先不填 token）
      const newSession = await tx.impersonationSession.create({
        data: {
          adminId: admin.id,
          targetUserId,
          token: '', // 先占位
          expiresAt,
        },
      })

      return newSession
    })

    // 3. 签发 JWT
    const token = await signImpersonationToken({
      sessionId: session.id,
      adminId: admin.id,
      targetUserId,
      exp: expiresAt,
    })

    // 4. 回填 token
    await prisma.impersonationSession.update({
      where: { id: session.id },
      data: { token },
    })

    return {
      success: true,
      data: { redirectUrl: `/api/auth/impersonate?token=${token}` },
    }
  } catch (error) {
    console.error('[impersonateUser] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : '伪装登录失败' }
  }
}

// ============ 工具函数 ============

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}
