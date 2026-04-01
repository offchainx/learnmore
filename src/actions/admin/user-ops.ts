'use server'

/**
 * Admin User Operations - Server Actions
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * 包含：用户状态管理、备注系统、伪装登录
 */

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { signImpersonationToken } from '@/lib/jwt'
import { Admin } from '@/types'
import { SecurityAction, SubscriptionTier } from '@prisma/client'
import { resolveRequestAdminIdentity } from '@/lib/auth/request-user'

const AVATAR_COLOR_PALETTE = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
]

function buildAvatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % AVATAR_COLOR_PALETTE.length
  return AVATAR_COLOR_PALETTE[index]
}

function mapDbStatusToAdmin(
  status: 'ACTIVE' | 'BANNED' | 'PAUSED'
): Admin.UserStatus {
  if (status === 'BANNED') return Admin.UserStatus.BANNED
  if (status === 'PAUSED') return Admin.UserStatus.PAUSED
  return Admin.UserStatus.ACTIVE
}

function mapAdminStatusToDb(
  status: Admin.UserStatus
): 'ACTIVE' | 'BANNED' | 'PAUSED' {
  if (status === Admin.UserStatus.BANNED) return 'BANNED'
  if (status === Admin.UserStatus.PAUSED) return 'PAUSED'
  return 'ACTIVE'
}

function mapDbTierToAdmin(
  tier: 'STARTER' | 'STANDARD' | 'SMART_PLUS' | 'PREMIER' | null
): Admin.SubscriptionTier {
  if (tier === 'PREMIER') return Admin.SubscriptionTier.PREMIER
  if (tier === 'SMART_PLUS') return Admin.SubscriptionTier.SMART_PLUS
  if (tier === 'STANDARD') return Admin.SubscriptionTier.STANDARD
  return Admin.SubscriptionTier.STARTER
}

function mapAdminTierToDb(
  tier: Admin.SubscriptionTier
): 'STARTER' | 'STANDARD' | 'SMART_PLUS' | 'PREMIER' {
  if (tier === Admin.SubscriptionTier.PREMIER) return 'PREMIER'
  if (tier === Admin.SubscriptionTier.SMART_PLUS) return 'SMART_PLUS'
  if (tier === Admin.SubscriptionTier.STANDARD) return 'STANDARD'
  return 'STARTER'
}

const USER_OVERVIEW_WINDOW_CONFIG: Record<
  Admin.UserOverviewWindow,
  { days: number | null; label: string }
> = {
  '7D': { days: 7, label: '7 Days' },
  '30D': { days: 30, label: '30 Days' },
  ALL: { days: null, label: 'All Time' },
}

// ============ 权限检查 ============

async function requireAdmin() {
  const user = await resolveRequestAdminIdentity()
  if (!user) {
    throw new Error('未登录')
  }
  if (user.role !== 'ADMIN') {
    throw new Error('权限不足：需要管理员权限')
  }
  return user
}

async function requireAdminOrTeacher() {
  const user = await resolveRequestAdminIdentity(undefined, true)
  if (!user) {
    throw new Error('未登录')
  }
  if (user.role !== 'ADMIN' && user.role !== 'TEACHER') {
    throw new Error('权限不足：需要管理员或教师权限')
  }
  return user
}

// ============ 用户列表（真实数据） ============

export async function listAdminUsers(
  filters: Admin.UserFilterState,
  pagination: Admin.PaginationParams
): Promise<Admin.ActionResult<Admin.PaginatedResponse<Admin.UserSummary>>> {
  try {
    await requireAdminOrTeacher()

    const page = Math.max(1, pagination.page || 1)
    const pageSize = Math.max(1, Math.min(100, pagination.pageSize || 20))

    const andConditions: any[] = []
    const search = filters.search?.trim()

    if (search) {
      const orConditions: any[] = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { school: { contains: search, mode: 'insensitive' } },
      ]

      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          search
        )
      ) {
        orConditions.push({ id: search })
      }

      andConditions.push({ OR: orConditions })
    }

    if (filters.status !== 'All') {
      andConditions.push({
        status: mapAdminStatusToDb(filters.status as Admin.UserStatus),
      })
    }

    if (filters.tier !== 'All') {
      andConditions.push({
        subscriptionTier: mapAdminTierToDb(
          filters.tier as Admin.SubscriptionTier
        ),
      })
    }

    const where: any =
      andConditions.length > 0 ? { AND: andConditions } : undefined

    const direction = pagination.sortDirection === 'asc' ? 'asc' : 'desc'
    const orderBy: any = (() => {
      switch (pagination.sortField) {
        case 'name':
          return [{ username: direction }, { email: direction }]
        case 'grade':
          return [{ grade: direction }, { createdAt: 'desc' }]
        case 'tier':
          return [{ subscriptionTier: direction }, { createdAt: 'desc' }]
        case 'status':
          return [{ status: direction }, { createdAt: 'desc' }]
        case 'school':
          return [{ school: direction }, { createdAt: 'desc' }]
        case 'lastActive':
          return [{ lastSignInAt: direction }, { createdAt: 'desc' }]
        default:
          return [{ createdAt: 'desc' }]
      }
    })()

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          status: true,
          subscriptionTier: true,
          subscriptionEnd: true,
          lastSignInAt: true,
          grade: true,
          school: true,
          createdAt: true,
        },
      }),
    ])

    const data: Admin.UserSummary[] = users.map((user) => {
      const lastActiveDate = user.lastSignInAt || user.createdAt
      return {
        id: user.id,
        name: user.username || user.email.split('@')[0],
        email: user.email,
        avatarColor: buildAvatarColor(`${user.id}:${user.email}`),
        role: user.role,
        status: mapDbStatusToAdmin(user.status),
        tier: mapDbTierToAdmin(user.subscriptionTier),
        subscriptionEnd: user.subscriptionEnd?.toISOString() || null,
        lastActive: lastActiveDate.toISOString(),
        lastActiveLabel: formatRelativeTime(lastActiveDate),
        grade: user.grade ? `${user.grade}年级` : '未设置',
        school: user.school || '未设置',
      }
    })

    return {
      success: true,
      data: {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  } catch (error) {
    console.error('[listAdminUsers] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户列表失败',
    }
  }
}

export async function getAdminUserOverview(
  window: Admin.UserOverviewWindow
): Promise<Admin.ActionResult<Admin.UserOverview>> {
  try {
    await requireAdminOrTeacher()

    const safeWindow = USER_OVERVIEW_WINDOW_CONFIG[window] ? window : '30D'
    const config = USER_OVERVIEW_WINDOW_CONFIG[safeWindow]
    const now = new Date()

    const [
      totalUsers,
      standardUsers,
      smartPlusUsers,
      premierUsers,
      bannedUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { subscriptionTier: SubscriptionTier.STANDARD },
      }),
      prisma.user.count({
        where: { subscriptionTier: SubscriptionTier.SMART_PLUS },
      }),
      prisma.user.count({
        where: { subscriptionTier: SubscriptionTier.PREMIER },
      }),
      prisma.user.count({ where: { status: 'BANNED' } }),
    ])

    let metrics: Admin.UserOverviewMetric[]

    if (config.days === null) {
      metrics = [
        {
          id: 'total',
          title: '总用户',
          value: formatNumber(totalUsers),
          caption: '全站累计',
          meta: '当前系统中的累计注册用户规模',
          trend: null,
          trendLabel: '累计视角',
        },
        {
          id: 'standard',
          title: 'Standard 用户',
          value: formatNumber(standardUsers),
          caption: '当前订阅',
          meta: '当前处于 Standard 档位的用户总数',
          trend: null,
          trendLabel: '累计视角',
        },
        {
          id: 'smart-plus',
          title: 'Smart+ 用户',
          value: formatNumber(smartPlusUsers),
          caption: '当前订阅',
          meta: '当前处于 Smart+ 档位的用户总数',
          trend: null,
          trendLabel: '累计视角',
        },
        {
          id: 'premier',
          title: 'Premier 用户',
          value: formatNumber(premierUsers),
          caption: '当前订阅',
          meta: '当前处于 Premier 档位的用户总数',
          trend: null,
          trendLabel: '累计视角',
        },
        {
          id: 'banned',
          title: '封禁用户',
          value: formatNumber(bannedUsers),
          caption: '当前状态',
          meta: '当前仍处于封禁状态的账号数量',
          trend: null,
          trendLabel: '累计视角',
        },
      ]
    } else {
      const currentStart = subtractDays(now, config.days)
      const previousStart = subtractDays(currentStart, config.days)

      const [
        totalCurrent,
        totalPrevious,
        standardCurrent,
        standardPrevious,
        smartPlusCurrent,
        smartPlusPrevious,
        premierCurrent,
        premierPrevious,
        bannedCurrent,
        bannedPrevious,
      ] = await Promise.all([
        prisma.user.count({
          where: { createdAt: { gte: currentStart, lt: now } },
        }),
        prisma.user.count({
          where: { createdAt: { gte: previousStart, lt: currentStart } },
        }),
        prisma.user.count({
          where: {
            subscriptionTier: SubscriptionTier.STANDARD,
            subscriptionStart: { gte: currentStart, lt: now },
          },
        }),
        prisma.user.count({
          where: {
            subscriptionTier: SubscriptionTier.STANDARD,
            subscriptionStart: { gte: previousStart, lt: currentStart },
          },
        }),
        prisma.user.count({
          where: {
            subscriptionTier: SubscriptionTier.SMART_PLUS,
            subscriptionStart: { gte: currentStart, lt: now },
          },
        }),
        prisma.user.count({
          where: {
            subscriptionTier: SubscriptionTier.SMART_PLUS,
            subscriptionStart: { gte: previousStart, lt: currentStart },
          },
        }),
        prisma.user.count({
          where: {
            subscriptionTier: SubscriptionTier.PREMIER,
            subscriptionStart: { gte: currentStart, lt: now },
          },
        }),
        prisma.user.count({
          where: {
            subscriptionTier: SubscriptionTier.PREMIER,
            subscriptionStart: { gte: previousStart, lt: currentStart },
          },
        }),
        prisma.securityLog.count({
          where: {
            action: SecurityAction.USER_BANNED,
            createdAt: { gte: currentStart, lt: now },
          },
        }),
        prisma.securityLog.count({
          where: {
            action: SecurityAction.USER_BANNED,
            createdAt: { gte: previousStart, lt: currentStart },
          },
        }),
      ])

      metrics = [
        {
          id: 'total',
          title: '总用户',
          value: formatNumber(totalUsers),
          caption: config.label,
          meta: `${config.label} 新增 ${formatNumber(totalCurrent)} 位，上一周期 ${formatNumber(totalPrevious)} 位`,
          trend: calcTrend(totalCurrent, totalPrevious),
          trendLabel: '较上窗口新增',
        },
        {
          id: 'standard',
          title: 'Standard 用户',
          value: formatNumber(standardUsers),
          caption: config.label,
          meta: `${config.label} 新增 ${formatNumber(standardCurrent)} 位，上一周期 ${formatNumber(standardPrevious)} 位`,
          trend: calcTrend(standardCurrent, standardPrevious),
          trendLabel: '较上窗口新增',
        },
        {
          id: 'smart-plus',
          title: 'Smart+ 用户',
          value: formatNumber(smartPlusUsers),
          caption: config.label,
          meta: `${config.label} 新增 ${formatNumber(smartPlusCurrent)} 位，上一周期 ${formatNumber(smartPlusPrevious)} 位`,
          trend: calcTrend(smartPlusCurrent, smartPlusPrevious),
          trendLabel: '较上窗口新增',
        },
        {
          id: 'premier',
          title: 'Premier 用户',
          value: formatNumber(premierUsers),
          caption: config.label,
          meta: `${config.label} 新增 ${formatNumber(premierCurrent)} 位，上一周期 ${formatNumber(premierPrevious)} 位`,
          trend: calcTrend(premierCurrent, premierPrevious),
          trendLabel: '较上窗口新增',
        },
        {
          id: 'banned',
          title: '封禁用户',
          value: formatNumber(bannedUsers),
          caption: config.label,
          meta: `${config.label} 新增封禁 ${formatNumber(bannedCurrent)} 次，上一周期 ${formatNumber(bannedPrevious)} 次`,
          trend: calcTrend(bannedCurrent, bannedPrevious),
          trendLabel: '较上窗口封禁',
        },
      ]
    }

    return {
      success: true,
      data: {
        window: safeWindow,
        metrics,
        lastUpdated: now.toISOString(),
      },
    }
  } catch (error) {
    console.error('[getAdminUserOverview] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户概览失败',
    }
  }
}

// ============ 获取用户详情 ============

export async function getUserDetail(
  userId: string
): Promise<Admin.ActionResult<Admin.UserDetail>> {
  try {
    await requireAdmin()

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
      },
    })

    if (!dbUser) {
      return { success: false, error: '用户不存在' }
    }

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

    const recentSecurityLogs: Admin.SecurityLogEntry[] =
      dbUser.securityLogs.map((l) => ({
        id: l.id,
        userId: l.userId,
        action: l.action as Admin.SecurityAction,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        metadata: l.metadata as Record<string, unknown> | null,
        createdAt: l.createdAt.toISOString(),
      }))

    const activeSession = dbUser.impersonationSessions[0]
    const lastActiveDate = dbUser.lastSignInAt || dbUser.createdAt

    const userDetail: Admin.UserDetail = {
      id: dbUser.id,
      name: dbUser.username || dbUser.email.split('@')[0],
      email: dbUser.email,
      avatarColor: buildAvatarColor(`${dbUser.id}:${dbUser.email}`),
      status: mapDbStatusToAdmin(dbUser.status),
      tier: mapDbTierToAdmin(dbUser.subscriptionTier),
      subscriptionEnd: dbUser.subscriptionEnd?.toISOString() || null,
      lastActive: lastActiveDate.toISOString(),
      lastActiveLabel: formatRelativeTime(lastActiveDate),
      grade: dbUser.grade ? `${dbUser.grade}年级` : '未设置',
      school: dbUser.school || '未设置',
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
            endReason: activeSession.endReason as
              | 'MANUAL_LOGOUT'
              | 'TOKEN_EXPIRED'
              | 'ADMIN_REVOKED'
              | null,
          }
        : null,
    }

    return { success: true, data: userDetail }
  } catch (error) {
    console.error('[getAdmin.UserDetail] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户详情失败',
    }
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
    return {
      success: false,
      error: error instanceof Error ? error.message : '操作失败',
    }
  }
}

// ============ Admin Note 系统 ============

export async function addAdminNote(
  userId: string,
  content: string
): Promise<Admin.ActionResult<Admin.AdminNote>> {
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
    return {
      success: false,
      error: error instanceof Error ? error.message : '添加备注失败',
    }
  }
}

export async function softDeleteAdminNote(
  noteId: string
): Promise<Admin.ActionResult> {
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
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除备注失败',
    }
  }
}

export async function restoreAdminNote(
  noteId: string
): Promise<Admin.ActionResult> {
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
    return {
      success: false,
      error: error instanceof Error ? error.message : '恢复备注失败',
    }
  }
}

export async function toggleNotePin(
  noteId: string
): Promise<Admin.ActionResult> {
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
    return {
      success: false,
      error: error instanceof Error ? error.message : '操作失败',
    }
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
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    })
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
    return {
      success: false,
      error: error instanceof Error ? error.message : '伪装登录失败',
    }
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

function subtractDays(base: Date, days: number): Date {
  return new Date(base.getTime() - days * 24 * 60 * 60 * 1000)
}

function calcTrend(current: number, previous: number): number {
  if (previous === 0) {
    if (current === 0) return 0
    return 100
  }

  return Number((((current - previous) / previous) * 100).toFixed(1))
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value)
}
