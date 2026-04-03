'use client'

/**
 * Overview Tab Component
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * 身份与安全概览：身份卡片、安全日志、备注区域
 */

import React from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Shield,
  Clock,
} from 'lucide-react'
import { AdminNoteList } from '../AdminNoteList'
import type { Admin } from '@/types'
import { formatSecurityLogSummary } from '@/lib/admin/security-log'

interface OverviewTabProps {
  user: Admin.UserDetail
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ user }) => {
  return (
    <div className="grid grid-cols-1 gap-6 desktop:grid-cols-3">
      {/* Left Column - Identity & Security */}
      <div className="space-y-6 desktop:col-span-2">
        {/* Identity Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">身份信息</h3>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <InfoItem
                icon={<Mail className="w-4 h-4" />}
                label="邮箱"
                value={user.email}
              />
              <InfoItem
                icon={<Phone className="w-4 h-4" />}
                label="手机号"
                value={user.phone}
              />
              <InfoItem
                icon={<MapPin className="w-4 h-4" />}
                label="位置"
                value={user.location}
              />
              <InfoItem
                icon={<Calendar className="w-4 h-4" />}
                label="注册时间"
                value={new Date(user.joinDate).toLocaleDateString('zh-CN')}
              />
              <InfoItem
                icon={<Globe className="w-4 h-4" />}
                label="注册来源"
                value={user.joinSource}
              />
              <InfoItem
                icon={<Clock className="w-4 h-4" />}
                label="账号到期"
                value={
                  user.subscriptionEnd
                    ? new Date(user.subscriptionEnd).toLocaleDateString('zh-CN')
                    : '未设置'
                }
              />
            </div>
          </div>
        </div>

        {/* Security Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-white">安全日志</h3>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
              最近 20 条
            </span>
          </div>

          <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto">
            {user.recentSecurityLogs.length === 0 ? (
              <div className="py-12 text-center">
                <Shield className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">暂无安全日志</p>
              </div>
            ) : (
              user.recentSecurityLogs.map((log) => (
                <SecurityLogItem key={log.id} log={log} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Admin Notes */}
      <div className="desktop:col-span-1">
        <AdminNoteList userId={user.id} notes={user.notes} />
      </div>
    </div>
  )
}

// --- Helper Components ---

interface InfoItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
    <div className="text-slate-400 mt-0.5">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm text-white truncate">{value}</p>
    </div>
  </div>
)

interface SecurityLogItemProps {
  log: Admin.SecurityLogEntry
}

const actionLabels: Record<Admin.SecurityAction, { label: string; color: string }> = {
  LOGIN: { label: '登录', color: 'text-green-400' },
  LOGOUT: { label: '登出', color: 'text-slate-400' },
  PASSWORD_RESET: { label: '密码重置', color: 'text-amber-400' },
  IMPERSONATE_START: { label: '伪装登录-进入', color: 'text-purple-400' },
  IMPERSONATE_END: { label: '伪装登录-退出', color: 'text-purple-400' },
  USER_BANNED: { label: '账户封禁', color: 'text-red-400' },
  USER_UNBANNED: { label: '解除封禁', color: 'text-green-400' },
  PERMISSION_OVERRIDE: { label: '权限覆写', color: 'text-blue-400' },
  ADMIN_NOTE_ADDED: { label: '添加备注', color: 'text-slate-400' },
  ADMIN_NOTE_PINNED: { label: '置顶备注', color: 'text-slate-400' },
  ADMIN_NOTE_DELETED: { label: '删除备注', color: 'text-slate-400' },
  ADMIN_NOTE_RESTORED: { label: '恢复备注', color: 'text-slate-400' },
}

const SecurityLogItem: React.FC<SecurityLogItemProps> = ({ log }) => {
  const actionInfo = actionLabels[log.action] || { label: log.action, color: 'text-slate-400' }

  return (
    <div className="flex items-start gap-3 p-4 hover:bg-slate-800/30 transition-colors">
      <div className="flex-shrink-0 mt-0.5">
        <Clock className="w-4 h-4 text-slate-500" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${actionInfo.color}`}>
            {actionInfo.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
          <span>{new Date(log.createdAt).toLocaleString('zh-CN')}</span>
          {log.ipAddress && <span>IP: {log.ipAddress}</span>}
        </div>

        <div className="mt-2 space-y-1.5">
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
            <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2 py-0.5">
              {formatSecurityLogSummary(log.metadata, {
                operator: 'system',
                target: log.userId,
              })}
            </span>
          </div>
          {log.metadata && (
            <div className="rounded-lg border border-slate-800 bg-slate-800/40 px-3 py-2 text-xs text-slate-400">
              {formatMetadata(log.metadata)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatMetadata(metadata: Record<string, unknown>): string {
  const entries = Object.entries(metadata)
    .filter(([key]) => !['adminId', 'operatorId', 'targetId'].includes(key)) // 隐藏敏感字段
    .map(([key, value]) => {
      if (key === 'changes' && Array.isArray(value)) {
        const formatted = value
          .filter((item) => item && typeof item === 'object')
          .map((item) => {
            const record = item as Record<string, unknown>
            return `${String(record.field ?? 'field')}: ${String(record.before ?? '-')} → ${String(record.after ?? '-')}`
          })
          .join(' | ')
        return `${key}: ${formatted || '-'}`
      }

      if (value && typeof value === 'object') {
        return `${key}: ${JSON.stringify(value)}`
      }

      return `${key}: ${String(value)}`
    })

  return entries.join(' | ') || '-'
}
