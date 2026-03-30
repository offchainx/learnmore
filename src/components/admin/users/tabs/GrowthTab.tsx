'use client'

import React, { useEffect, useState } from 'react'
import { Copy, Check, GitCommit, Loader2 } from 'lucide-react'
import { Admin } from '@/types'
import { UserTierBadge } from '../UserBadges'
import { getUserReferralData } from '@/actions/admin/user-details'
import { toast } from 'sonner'

interface GrowthTabProps {
  user: Admin.UserDetail
}

const ReferralNodeView: React.FC<{ node: Admin.ReferralNode; depth?: number }> = ({ node, depth = 0 }) => (
  <div className={`${depth > 0 ? 'ml-6 border-l border-slate-800 pl-4' : ''} mt-3`}>
    <div className="flex items-center gap-3 p-2 rounded bg-slate-800/30 border border-slate-800">
      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
        {node.name[0]?.toUpperCase()}
      </div>
      <span className="text-sm text-slate-200 font-medium">{node.name}</span>
      <UserTierBadge tier={node.tier} />
    </div>
    {node.children && node.children.map((child: Admin.ReferralNode) => (
      <ReferralNodeView key={child.id} node={child} depth={depth + 1} />
    ))}
  </div>
);

export const GrowthTab: React.FC<GrowthTabProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<{
    stats: {
      referralCode: string | null;
      totalInvites: number;
      rewardSummary: string;
    };
    tree: Admin.ReferralNode | null;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getUserReferralData(user.id);
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    }
    loadData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!data || !data.tree) {
    return <div className="text-slate-500 p-8 text-center">无法加载推荐数据</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2">
      {/* Stats Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col justify-center gap-8">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">My Referral Code</div>
          <div className="flex items-center gap-3">
             <code className="bg-slate-950 border border-slate-800 px-3 py-2 rounded text-lg font-mono text-emerald-400 tracking-widest">
               {data.stats.referralCode || 'NOT_SET'}
             </code>
             <button
               onClick={async () => {
                 if (!data.stats.referralCode) return
                 try {
                   await navigator.clipboard.writeText(data.stats.referralCode)
                   setCopied(true)
                   toast.success('推荐码已复制到剪贴板')
                   setTimeout(() => setCopied(false), 2000)
                 } catch {
                   toast.error('复制失败，请手动复制')
                 }
               }}
               className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
               title="复制推荐码"
             >
               {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
             </button>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Invites</div>
          <div className="text-4xl font-bold text-white">{data.stats.totalInvites}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Rewards Earned</div>
          <div className="text-xl font-medium text-slate-200">
            {data.stats.rewardSummary}
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
            <span className="text-sm text-white font-medium">{data.tree.name}</span>
            <UserTierBadge tier={data.tree.tier} />
          </div>
          {/* Render children */}
          {data.tree.children?.map(child => (
            <ReferralNodeView key={child.id} node={child} depth={1} />
          ))}
          {(!data.tree.children || data.tree.children.length === 0) && (
            <div className="text-slate-500 text-sm italic pl-8 pt-2">暂无推荐记录</div>
          )}
        </div>
      </div>
    </div>
  )
}
