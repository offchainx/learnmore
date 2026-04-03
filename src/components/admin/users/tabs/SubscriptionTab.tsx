'use client'

import React, { useEffect, useState } from 'react'
import { CreditCard, Clock3, ShieldCheck, Repeat } from 'lucide-react'
import { Admin } from '@/types'
import { UserTierBadge } from '../UserBadges'
import { GrantPermissionDialog } from '../GrantPermissionDialog'
import { getOverrideHistory } from '@/actions/admin/permission-override'
import type { OverrideHistoryItem } from '@/actions/admin/permission-override'

interface SubscriptionTabProps {
  user: Admin.UserDetail
}

function formatRelativeTime(dateIso: string): string {
  const date = new Date(dateIso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString('zh-CN')
}

function formatDuration(item: OverrideHistoryItem): string {
  if (!item.expiresAt) return '永久'
  return `至 ${new Date(item.expiresAt).toLocaleDateString('zh-CN')}`
}

function formatOverrideType(item: OverrideHistoryItem): string {
  const nextValue = item.newValue || 'N/A'
  if (item.targetField === 'subscriptionTier') {
    return `Tier -> ${nextValue}`
  }
  return `${item.targetField} -> ${nextValue}`
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({ user }) => {
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [overrideHistory, setOverrideHistory] = useState<OverrideHistoryItem[]>([])

  const subscriptionEndDate = user.subscriptionEnd
    ? new Date(user.subscriptionEnd)
    : null
  const hasSubscriptionEnd = Boolean(subscriptionEndDate)
  const remainingDays = subscriptionEndDate
    ? Math.ceil((subscriptionEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null
  const remainingLabel =
    remainingDays === null
      ? '未设置'
      : remainingDays > 0
        ? `${remainingDays} 天`
        : '已到期'

  useEffect(() => {
    async function loadHistory() {
      setHistoryLoading(true)
      try {
        const history = await getOverrideHistory(user.id)
        setOverrideHistory(history)
      } finally {
        setHistoryLoading(false)
      }
    }

    void loadHistory()
  }, [user.id])

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CreditCard size={120} className="text-white" />
        </div>
        <div className="relative z-10">
          <div className="mb-4">
            <UserTierBadge tier={user.tier} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">当前等级</div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                {user.tier}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">到期时间</div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Clock3 className="h-4 w-4 text-blue-400" />
                {hasSubscriptionEnd
                  ? subscriptionEndDate!.toLocaleDateString('zh-CN')
                  : '未设置'}
              </div>
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">剩余天数</div>
              <div className={`flex items-center gap-2 text-sm font-bold ${remainingDays === null ? 'text-slate-500' : remainingDays > 0 ? 'text-blue-400' : 'text-red-400'}`}>
                <Repeat className="h-4 w-4" />
                {remainingLabel}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-200">权限覆写历史</h3>
          <button
            onClick={() => setIsGrantDialogOpen(true)}
            className="text-xs border border-blue-600 text-blue-500 px-3 py-1.5 rounded hover:bg-blue-950/30 transition-colors"
          >
            发起覆写
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase">
              <th className="px-3 py-2 font-medium">类型</th>
              <th className="px-3 py-2 font-medium">有效期</th>
              <th className="px-3 py-2 font-medium">原因</th>
              <th className="px-3 py-2 font-medium">管理员</th>
              <th className="px-3 py-2 font-medium text-right">时间</th>
            </tr>
          </thead>
          <tbody>
            {historyLoading ? (
              <tr>
                <td colSpan={5} className="py-6 px-3 text-center text-slate-500 text-sm">
                  加载中...
                </td>
              </tr>
            ) : overrideHistory.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 px-3 text-center text-slate-500 text-sm">
                  暂无覆写记录
                </td>
              </tr>
            ) : (
              overrideHistory.map((item) => (
                <tr key={item.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20">
                  <td className="py-2 px-3 text-sm text-slate-200">{formatOverrideType(item)}</td>
                  <td className="py-2 px-3 text-sm text-slate-400">{formatDuration(item)}</td>
                  <td className="py-2 px-3 text-sm text-slate-400 max-w-[150px] truncate" title={item.reason}>{item.reason}</td>
                  <td className="py-2 px-3 text-sm text-slate-500">{item.admin?.username || item.admin?.email || item.overriddenBy}</td>
                  <td className="py-2 px-3 text-sm text-slate-500 text-right">{formatRelativeTime(item.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <GrantPermissionDialog
        isOpen={isGrantDialogOpen}
        onClose={() => setIsGrantDialogOpen(false)}
        userId={user.id}
        currentTier={user.tier}
      />
    </div>
  )
}
