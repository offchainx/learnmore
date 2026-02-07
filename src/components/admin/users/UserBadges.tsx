'use client'

/**
 * User Status & Tier Badges
 * Story-046: 用户全生命周期管理后台
 */

import React from 'react'
import { Admin } from '@/types'

interface StatusBadgeProps {
  status: Admin.UserStatus
}

export const UserStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let dotColor = ''
  let textColor = ''

  switch (status) {
    case Admin.UserStatus.ACTIVE:
      dotColor = 'bg-emerald-500'
      textColor = 'text-emerald-400'
      break
    case Admin.UserStatus.BANNED:
      dotColor = 'bg-red-500'
      textColor = 'text-red-400'
      break
    case Admin.UserStatus.PAUSED:
      dotColor = 'bg-amber-500'
      textColor = 'text-amber-400'
      break
    default:
      dotColor = 'bg-slate-500'
      textColor = 'text-slate-400'
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dotColor} shadow-[0_0_8px_rgba(0,0,0,0.3)]`} />
      <span className={`text-sm ${textColor} font-medium`}>{status}</span>
    </div>
  )
}

interface TierBadgeProps {
  tier: Admin.SubscriptionTier
}

export const UserTierBadge: React.FC<TierBadgeProps> = ({ tier }) => {
  let classes = ''

  switch (tier) {
    case Admin.SubscriptionTier.STARTER:
      classes = 'bg-slate-800 text-slate-300 border border-slate-700'
      break
    case Admin.SubscriptionTier.STANDARD:
      classes = 'bg-blue-900/40 text-blue-300 border border-blue-800/50'
      break
    case Admin.SubscriptionTier.SMART_PLUS:
      classes = 'bg-purple-900/40 text-purple-300 border border-purple-800/50'
      break
    case Admin.SubscriptionTier.PREMIER:
      classes = 'bg-amber-900/40 text-amber-300 border border-amber-800/50'
      break
    default:
      classes = 'bg-slate-800 text-slate-400'
  }

  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-medium ${classes}`}>
      {tier}
    </span>
  )
}
