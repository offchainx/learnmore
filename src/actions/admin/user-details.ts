'use server'

import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/actions/auth'
import { 
  ActionResult, 
  ReferralNode, 
  SubscriptionTier as TierEnum,
  AuditEventType,
  AuditLogItem,
  SecurityAction
} from '@/types/admin-user'

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

// ============ Task D: Growth Tab - Referral Data ============

interface ReferralStats {
  referralCode: string | null
  totalInvites: number
  referralLimit: number
  rewardSummary: string // Mocked for now, or derived
}

export async function getUserReferralData(userId: string): Promise<ActionResult<{ stats: ReferralStats, tree: ReferralNode }>> {
  try {
    await requireAdmin()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        referralCode: true,
        referralCount: true,
        referralLimit: true,
        subscriptionTier: true,
        referralsGiven: {
          include: {
            referee: {
              select: {
                id: true,
                username: true,
                email: true,
                subscriptionTier: true,
                referralsGiven: {
                  include: {
                    referee: {
                      select: {
                        id: true,
                        username: true,
                        email: true,
                        subscriptionTier: true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user) {
      return { success: false, error: '用户不存在' }
    }

    // Build Stats
    const stats: ReferralStats = {
      referralCode: user.referralCode,
      totalInvites: user.referralCount,
      referralLimit: user.referralLimit,
      rewardSummary: '3 months / $45 credit' // TODO: Calculate from Rewards table if exists
    }

    // Build Tree (Depth 2)
    const tree: ReferralNode = {
      id: user.id,
      name: user.username || user.email.split('@')[0],
      tier: (user.subscriptionTier as TierEnum) || TierEnum.STARTER,
      children: user.referralsGiven.map(r1 => ({
        id: r1.referee.id,
        name: r1.referee.username || r1.referee.email.split('@')[0],
        tier: (r1.referee.subscriptionTier as TierEnum) || TierEnum.STARTER,
        children: r1.referee.referralsGiven.map(r2 => ({
          id: r2.referee.id,
          name: r2.referee.username || r2.referee.email.split('@')[0],
          tier: (r2.referee.subscriptionTier as TierEnum) || TierEnum.STARTER,
        }))
      }))
    }

    return { success: true, data: { stats, tree } }

  } catch (error) {
    console.error('[getUserReferralData] Error:', error)
    return { success: false, error: '获取推荐数据失败' }
  }
}

// ============ Task D: Activity Tab - Activity Data ============

interface ActivityStats {
  totalQuestions: number
  accuracy: number
  mistakes: number
  daysActive: number
}

interface ActivityEvent {
  type: string
  color: string
  time: string
  timestamp: Date // for sorting if needed
}

export async function getUserActivityData(userId: string): Promise<ActionResult<{ stats: ActivityStats, timeline: ActivityEvent[], heatmap: number[][] }>> {
  try {
    await requireAdmin()

    // 1. Stats
    const attemptsCount = await prisma.userAttempt.count({ where: { userId } })
    const correctAttempts = await prisma.userAttempt.count({ where: { userId, isCorrect: true } })
    const accuracy = attemptsCount > 0 ? Math.round((correctAttempts / attemptsCount) * 100) : 0
    
    const mistakesCount = await prisma.errorBook.count({ where: { userId } })
    
    // Days Active: derive from DailyTask (LOGIN type) or UserAttempt dates
    // For simplicity, using user.streak or aggregation. Let's use user.streak for now as proxy or count distinct dates in UserAttempt
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { streak: true } })
    const daysActive = user?.streak || 0

    const stats: ActivityStats = {
      totalQuestions: attemptsCount,
      accuracy,
      mistakes: mistakesCount,
      daysActive
    }

    // 2. Timeline (Mix of UserAttempt, SecurityLog(LOGIN), DailyTask)
    const recentAttempts = await prisma.userAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { question: { select: { type: true } } }
    })

    const recentLogins = await prisma.securityLog.findMany({
      where: { userId, action: 'LOGIN' },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Merge and Sort
    const events: ActivityEvent[] = [
      ...recentAttempts.map(a => ({
        type: 'Quiz Completed', // or a.question.type
        color: 'bg-emerald-500',
        time: a.createdAt.toISOString(),
        timestamp: a.createdAt
      })),
      ...recentLogins.map(l => ({
        type: 'Login',
        color: 'bg-blue-500',
        time: l.createdAt.toISOString(),
        timestamp: l.createdAt
      }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
     .slice(0, 10)
     .map(e => ({
       ...e,
       time: formatRelativeTime(e.timestamp)
     }))

    // 3. Heatmap (Last 12 weeks)
    // Seeded pseudo-random based on userId for deterministic output per user
    const heatmap = generateMockHeatmapData(userId)

    return { success: true, data: { stats, timeline: events, heatmap } }

  } catch (error) {
    console.error('[getUserActivityData] Error:', error)
    return { success: false, error: '获取活跃数据失败' }
  }
}

// ============ Task D: Audit Tab - Consolidated Logs ============

export async function getUserAuditLogs(userId: string): Promise<ActionResult<AuditLogItem[]>> {
  try {
    await requireAdmin()

    // 1. Fetch Security Logs (Base)
    const securityLogs = await prisma.securityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    // 2. Fetch Permission Overrides
    const overrides = await prisma.userPermissionOverride.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    })

    // 3. Fetch Impersonation Sessions
    const sessions = await prisma.impersonationSession.findMany({
      where: { targetUserId: userId },
      orderBy: { startedAt: 'desc' }
    })

    // 4. Map to Unified Format
    const items: AuditLogItem[] = []

    // Build a sessionId → session map for enriching IMPERSONATE events
    const sessionMap = new Map<string, typeof sessions[0]>()
    sessions.forEach(s => sessionMap.set(s.id, s))

    // Map Security Logs
    securityLogs.forEach(log => {
      let type = AuditEventType.OTHER
      let title = log.action as string
      let desc = JSON.stringify(log.metadata || {})

      switch(log.action) {
        case 'LOGIN':
        case 'LOGOUT':
          type = AuditEventType.LOGIN; break;
        case 'USER_BANNED':
        case 'USER_UNBANNED':
          type = AuditEventType.STATUS; break;
        case 'PERMISSION_OVERRIDE':
          type = AuditEventType.PERMISSION; break;
        case 'IMPERSONATE_START':
        case 'IMPERSONATE_END':
          type = AuditEventType.IMPERSONATE; break;
        case 'ADMIN_NOTE_ADDED':
        case 'ADMIN_NOTE_DELETED':
          type = AuditEventType.NOTE; break;
      }

      // Parse metadata for better description
      const meta = log.metadata as any
      if (meta?.reason) desc = `Reason: ${meta.reason}`
      if (meta?.adminEmail) desc += ` | By: ${meta.adminEmail}`

      // Enrich IMPERSONATE_END with duration and endReason from session record
      let durationLabel: string | null = null
      let endReason: string | null = null
      if (log.action === 'IMPERSONATE_END') {
        // Find matching session: match by targetUserId + adminId + timing proximity
        const matchedSession = sessions.find(s =>
          s.endedAt &&
          Math.abs(s.endedAt.getTime() - log.createdAt.getTime()) < 5000 // within 5s
        )
        if (matchedSession) {
          const durationMs = matchedSession.endedAt!.getTime() - matchedSession.startedAt.getTime()
          const mins = Math.floor(durationMs / 60000)
          const secs = Math.floor((durationMs % 60000) / 1000)
          durationLabel = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
          endReason = matchedSession.endReason || 'MANUAL_LOGOUT'
        }
      }

      items.push({
        id: log.id,
        type,
        title,
        description: desc,
        timestamp: log.createdAt.toISOString(),
        meta: {
          isSessionStart: log.action === 'IMPERSONATE_START',
          isSessionEnd: log.action === 'IMPERSONATE_END',
          durationLabel,
          endReason,
        }
      })
    })

    // Map Overrides (if not redundant with Security Logs, or to add more detail)
    // SecurityLog usually logs the event, but Override table has the state.
    // We can add them as separate entries if they provide value, or rely on SecurityLog.
    // For now, relying on SecurityLog for the "Event" is safer to avoid duplication if we log properly.
    // However, if SecurityLog is missing (legacy), we might want these.
    // Let's assume SecurityLog is the source of truth for the timeline.

    // Map Sessions (mainly to link start/end or show duration)
    // If SecurityLog covers IMPERSONATE_START/END, we are good.
    // But we might want to enrich the END log with duration if not present.

    // Sort
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return { success: true, data: items }

  } catch (error) {
    console.error('[getUserAuditLogs] Error:', error)
    return { success: false, error: '获取审计日志失败' }
  }
}

// Helpers

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Simple seeded PRNG (xorshift32) — deterministic given the same seed
function seededRandom(seed: number): () => number {
  let state = seed | 0 || 1
  return () => {
    state ^= state << 13
    state ^= state >> 17
    state ^= state << 5
    return (state >>> 0) / 4294967296
  }
}

// Hash a string into a 32-bit integer
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return hash
}

function generateMockHeatmapData(userId: string): number[][] {
  const rand = seededRandom(simpleHash(userId))
  const data: number[][] = [];
  for (let w = 0; w < 12; w++) {
    const week: number[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(Math.floor(rand() * 4)); // 0-3
    }
    data.push(week);
  }
  return data;
}
