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
import { SubscriptionTab } from '@/components/admin/users/tabs/SubscriptionTab'
import { ActivityTab } from '@/components/admin/users/tabs/ActivityTab'
import { GrowthTab } from '@/components/admin/users/tabs/GrowthTab'
import { AuditTab } from '@/components/admin/users/tabs/AuditTab'
import type { Admin } from '@/types'
import {
  LayoutDashboard,
  CreditCard,
  Activity,
  TrendingUp,
  FileText,
} from 'lucide-react'

interface UserDetailClientProps {
  user: Admin.UserDetail
  initialTab?: string
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
  { id: 'subscription', label: '订阅', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'activity', label: '学习行为', icon: <Activity className="w-4 h-4" /> },
  { id: 'growth', label: '增长', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'audit', label: '审计', icon: <FileText className="w-4 h-4" /> },
]

function resolveInitialTab(initialTab?: string): TabId {
  return tabs.some((tab) => tab.id === initialTab)
    ? (initialTab as TabId)
    : 'overview'
}

export const UserDetailClient: React.FC<UserDetailClientProps> = ({ user, initialTab }) => {
  const [activeTab, setActiveTab] = useState<TabId>(resolveInitialTab(initialTab))

  return (
    <div className="space-y-6">
      {/* Header */}
      <UserProfileHeader user={user} />

      {/* Tabs */}
      <div className="bg-surface dark:bg-slate-900 border border-borderTone dark:border-slate-800 rounded-xl overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-borderTone dark:border-slate-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-blue-500 border-blue-500 bg-blue-500/5 dark:text-blue-400 dark:border-blue-400'
                  : tab.disabled
                  ? 'text-slate-400 border-transparent cursor-not-allowed dark:text-slate-600'
                  : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-surface-subtle dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.disabled && (
                <span className="text-xs bg-surface-subtle dark:bg-slate-800 text-text-tertiary dark:text-slate-500 px-1.5 py-0.5 rounded">
                  即将推出
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab user={user} />}
          {activeTab === 'subscription' && <SubscriptionTab user={user} />}
          {activeTab === 'activity' && <ActivityTab user={user} />}
          {activeTab === 'growth' && <GrowthTab user={user} />}
          {activeTab === 'audit' && <AuditTab user={user} />}
        </div>
      </div>
    </div>
  )
}
