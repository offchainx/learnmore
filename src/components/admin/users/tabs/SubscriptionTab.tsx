'use client'

import React, { useMemo, useState } from 'react'
import { CreditCard } from 'lucide-react'
import { Admin } from '@/types'
import { UserTierBadge } from '../UserBadges'
import { generatePaymentHistory } from '../mock/userMockData'
import { GrantPermissionDialog } from '../GrantPermissionDialog'
import { StripeHistoryTable } from '../StripeHistoryTable'

interface SubscriptionTabProps {
  user: Admin.UserDetail
}

const PermissionRow: React.FC<{ type: string; duration: string; reason: string; admin: string; time: string }> = ({ type, duration, reason, admin, time }) => (
  <tr className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20">
    <td className="py-2 px-3 text-sm text-slate-200">{type}</td>
    <td className="py-2 px-3 text-sm text-slate-400">{duration}</td>
    <td className="py-2 px-3 text-sm text-slate-400 max-w-[150px] truncate" title={reason}>{reason}</td>
    <td className="py-2 px-3 text-sm text-slate-500">{admin}</td>
    <td className="py-2 px-3 text-sm text-slate-500 text-right">{time}</td>
  </tr>
);

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({ user }) => {
  // Mock Payment Data
  const payments = useMemo(() => generatePaymentHistory(3), []);
  
  // Dialog State
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Current Sub */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CreditCard size={120} className="text-white" />
        </div>
        <div className="relative z-10">
          <div className="mb-4">
            <UserTierBadge tier={user.tier} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Duration</div>
              <div className="text-slate-200 text-sm font-mono">
                {(() => {
                  if (user.tier === Admin.SubscriptionTier.STARTER) return 'Free Tier'
                  const start = new Date(user.joinDate)
                  const end = new Date(start)
                  end.setFullYear(end.getFullYear() + 1)
                  return `${start.toLocaleDateString('zh-CN')} - ${end.toLocaleDateString('zh-CN')}`
                })()}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Auto-Renew</div>
              <div className={`flex items-center gap-2 text-sm font-medium ${user.tier === Admin.SubscriptionTier.STARTER ? 'text-slate-500' : 'text-emerald-400'}`}>
                <div className={`w-8 h-4 rounded-full relative border ${user.tier === Admin.SubscriptionTier.STARTER ? 'bg-slate-800 border-slate-700' : 'bg-emerald-900/50 border-emerald-800'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full shadow-sm transition-all ${user.tier === Admin.SubscriptionTier.STARTER ? 'left-0.5 bg-slate-600' : 'right-0.5 bg-emerald-500'}`}></div>
                </div>
                {user.tier === Admin.SubscriptionTier.STARTER ? 'OFF' : 'ON'}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Remaining</div>
              <div className={`text-sm font-bold ${user.tier === Admin.SubscriptionTier.STARTER ? 'text-slate-500' : 'text-blue-400'}`}>
                {(() => {
                  if (user.tier === Admin.SubscriptionTier.STARTER) return 'N/A'
                  const start = new Date(user.joinDate)
                  const end = new Date(start)
                  end.setFullYear(end.getFullYear() + 1)
                  const remaining = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  return remaining > 0 ? `${remaining} Days` : 'Expired'
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-200">Permission Overrides</h3>
          <button 
            onClick={() => setIsGrantDialogOpen(true)}
            className="text-xs border border-blue-600 text-blue-500 px-3 py-1.5 rounded hover:bg-blue-950/30 transition-colors"
          >
            Grant Permission
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase">
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Duration</th>
              <th className="px-3 py-2 font-medium">Reason</th>
              <th className="px-3 py-2 font-medium">Admin</th>
              <th className="px-3 py-2 font-medium text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            <PermissionRow type="Extended Trial" duration="7 Days" reason="Support Ticket #992" admin="Sarah" time="2h ago" />
            <PermissionRow type="Feature Unlock" duration="Permanent" reason="Beta Tester Program" admin="Mike" time="3mo ago" />
          </tbody>
        </table>
      </div>

      {/* Payments */}
      <StripeHistoryTable payments={payments} />
      
      {/* Dialog */}
      <GrantPermissionDialog 
        isOpen={isGrantDialogOpen} 
        onClose={() => setIsGrantDialogOpen(false)} 
        userId={user.id}
        currentTier={user.tier}
      />
    </div>
  )
}