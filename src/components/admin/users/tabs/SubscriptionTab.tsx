'use client'

import React, { useMemo } from 'react'
import { CreditCard } from 'lucide-react'
import { UserDetail } from '@/types/admin-user'
import { UserTierBadge } from '../UserBadges'
import { generatePaymentHistory } from '../mock/userMockData'

interface SubscriptionTabProps {
  user: UserDetail
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
              <div className="text-slate-200 text-sm font-mono">Oct 24, 2023 - Oct 24, 2024</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Auto-Renew</div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                <div className="w-8 h-4 bg-emerald-900/50 rounded-full relative border border-emerald-800">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
                </div>
                ON
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Remaining</div>
              <div className="text-blue-400 text-sm font-bold">18 Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-200">Permission Overrides</h3>
          <button className="text-xs border border-blue-600 text-blue-500 px-3 py-1.5 rounded hover:bg-blue-950/30 transition-colors">
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
         <h3 className="text-sm font-semibold text-slate-200 mb-4">Payment History</h3>
         <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Amount</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20">
                <td className="py-3 px-3 text-sm text-slate-300 font-mono">{p.date}</td>
                <td className="py-3 px-3 text-sm text-white font-medium">${p.amount}.00</td>
                <td className="py-3 px-3 text-sm text-slate-400">{p.type}</td>
                <td className="py-3 px-3 text-sm text-right">
                  <span className={`px-2 py-0.5 rounded text-xs ${p.status === 'Success' ? 'text-emerald-400 bg-emerald-950/30' : 'text-red-400 bg-red-950/30'}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
         </table>
      </div>
    </div>
  )
}
