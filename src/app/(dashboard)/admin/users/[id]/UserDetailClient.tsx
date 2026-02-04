'use client'

/**
 * User Detail Client Component
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * 用户详情页客户端组件，包含 Tab 切换
 */

import React, { useState } from 'react'
import { UserProfileHeader } from '@/components/admin/users/UserProfileHeader'
import { OverviewTab } from '@/components/admin/users/tabs/OverviewTab'
import type { UserDetail } from '@/types/admin-user'
import {
  LayoutDashboard,
  CreditCard,
  Activity,
  TrendingUp,
  FileText,
} from 'lucide-react'

interface UserDetailClientProps {
  user: UserDetail
}

type TabId = 'overview' | 'subscription' | 'activity' | 'growth' | 'audit'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
  disabled?: boolean
}

const tabs: Tab[] = [
  { id: 'overview', label: '概览', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'subscription', label: '订阅', icon: <CreditCard className="w-4 h-4" />, disabled: true },
  { id: 'activity', label: '学习行为', icon: <Activity className="w-4 h-4" />, disabled: true },
  { id: 'growth', label: '增长', icon: <TrendingUp className="w-4 h-4" />, disabled: true },
  { id: 'audit', label: '审计', icon: <FileText className="w-4 h-4" />, disabled: true },
]

export const UserDetailClient: React.FC<UserDetailClientProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  return (
    <div className="space-y-6">
      {/* Header */}
      <UserProfileHeader user={user} />

      {/* Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-slate-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-blue-400 border-blue-400 bg-blue-500/5'
                  : tab.disabled
                  ? 'text-slate-600 border-transparent cursor-not-allowed'
                  : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.disabled && (
                <span className="text-xs bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">
                  即将推出
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab user={user} />}
          {activeTab === 'subscription' && (
            <PlaceholderTab title="订阅管理" description="订阅状态、Stripe 支付历史、权限覆写功能将在 Task C 中实现" />
          )}
          {activeTab === 'activity' && (
            <PlaceholderTab title="学习行为" description="答题统计、学习时间线将在 Task D 中实现" />
          )}
          {activeTab === 'growth' && (
            <PlaceholderTab title="增长数据" description="邀请统计、推荐树将在 Task D 中实现" />
          )}
          {activeTab === 'audit' && (
            <PlaceholderTab title="审计日志" description="完整审计时间线将在 Task D 中实现" />
          )}
        </div>
      </div>
    </div>
  )
}

// --- Placeholder Component ---

interface PlaceholderTabProps {
  title: string
  description: string
}

const PlaceholderTab: React.FC<PlaceholderTabProps> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
      <FileText className="w-8 h-8 text-slate-600" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-500 max-w-md">{description}</p>
  </div>
)
