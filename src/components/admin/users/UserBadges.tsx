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
  let surfaceClass = ''

  switch (status) {
    case Admin.UserStatus.ACTIVE:
      dotColor = 'bg-emerald-500'
      textColor = 'text-emerald-300'
      surfaceClass = 'border border-emerald-900/40 bg-emerald-950/30'
      break
    case Admin.UserStatus.BANNED:
      dotColor = 'bg-red-500'
      textColor = 'text-red-300'
      surfaceClass = 'border border-red-900/40 bg-red-950/30'
      break
    case Admin.UserStatus.PAUSED:
      dotColor = 'bg-amber-500'
      textColor = 'text-amber-300'
      surfaceClass = 'border border-amber-900/40 bg-amber-950/30'
      break
    default:
      dotColor = 'bg-slate-500'
      textColor = 'text-slate-300'
      surfaceClass = 'border border-slate-700 bg-slate-900/80'
  }

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${surfaceClass}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${dotColor} shadow-[0_0_8px_rgba(0,0,0,0.3)]`}
      />
      <span className={textColor}>{status}</span>
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
      classes = 'border border-slate-700 bg-slate-900/80 text-slate-300'
      break
    case Admin.SubscriptionTier.STANDARD:
      classes = 'border border-blue-900/40 bg-blue-950/30 text-blue-300'
      break
    case Admin.SubscriptionTier.SMART_PLUS:
      classes = 'border border-violet-900/40 bg-violet-950/30 text-violet-300'
      break
    case Admin.SubscriptionTier.PREMIER:
      classes = 'border border-amber-900/40 bg-amber-950/30 text-amber-300'
      break
    default:
      classes = 'border border-slate-700 bg-slate-900/80 text-slate-400'
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${classes}`}
    >
      {tier}
    </span>
  )
}
