'use client'

import React, { useMemo } from 'react'
import { Copy, GitCommit } from 'lucide-react'
import { UserDetail, ReferralNode } from '@/types/admin-user'
import { UserTierBadge } from '../UserBadges'
import { generateReferralTree } from '../mock/userMockData'

interface GrowthTabProps {
  user: UserDetail
}

const ReferralNodeView: React.FC<{ node: ReferralNode; depth?: number }> = ({ node, depth = 0 }) => (
  <div className={`${depth > 0 ? 'ml-6 border-l border-slate-800 pl-4' : ''} mt-3`}>
    <div className="flex items-center gap-3 p-2 rounded bg-slate-800/30 border border-slate-800">
      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
        {node.name[0]}
      </div>
      <span className="text-sm text-slate-200 font-medium">{node.name}</span>
      <UserTierBadge tier={node.tier} />
    </div>
    {node.children && node.children.map((child: ReferralNode) => (
      <ReferralNodeView key={child.id} node={child} depth={depth + 1} />
    ))}
  </div>
);

export const GrowthTab: React.FC<GrowthTabProps> = ({ user }) => {
  const referralTree = useMemo(() => generateReferralTree(), []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Stats Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col justify-center gap-8">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">My Referral Code</div>
          <div className="flex items-center gap-3">
             <code className="bg-slate-950 border border-slate-800 px-3 py-2 rounded text-lg font-mono text-emerald-400 tracking-widest">
               REF-MK-2024
             </code>
             <button className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
               <Copy size={18} />
             </button>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Invites</div>
          <div className="text-4xl font-bold text-white">42</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Rewards Earned</div>
          <div className="text-xl font-medium text-slate-200">
            <span className="text-white font-bold">3</span> months / <span className="text-white font-bold">$45</span> credit
          </div>
        </div>
      </div>

      {/* Referral Tree */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[400px]">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <GitCommit size={16} className="text-slate-500" /> Referral Network
        </h3>
        <div className="pl-2">
          <div className="flex items-center gap-3 p-2 rounded bg-slate-800/60 border border-blue-500/30 mb-2">
            <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-200">
              You
            </div>
            <span className="text-sm text-white font-medium">{referralTree.name}</span>
            <UserTierBadge tier={referralTree.tier} />
          </div>
          {/* Render children */}
          {referralTree.children?.map(child => (
            <ReferralNodeView key={child.id} node={child} depth={1} />
          ))}
        </div>
      </div>
    </div>
  )
}
