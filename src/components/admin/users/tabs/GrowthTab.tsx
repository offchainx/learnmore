'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import {
  ArrowRight,
  Check,
  Copy,
  GitCommit,
  Loader2,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Admin } from '@/types'
import { UserTierBadge } from '../UserBadges'
import { getUserReferralData } from '@/actions/admin/user-details'
import { toast } from 'sonner'

interface GrowthTabProps {
  user: Admin.UserDetail
}

const ReferralNodeView: React.FC<{
  node: Admin.ReferralNode
  depth?: number
}> = ({ node, depth = 0 }) => (
  <div
    className={`${depth > 0 ? 'ml-6 border-l border-slate-800 pl-4' : ''} mt-3`}
  >
    <div className="flex items-center gap-3 rounded border border-slate-800 bg-slate-800/30 p-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300">
        {node.name[0]?.toUpperCase()}
      </div>
      <span className="text-sm font-medium text-slate-200">{node.name}</span>
      <UserTierBadge tier={node.tier} />
    </div>
    {node.children &&
      node.children.map((child: Admin.ReferralNode) => (
        <ReferralNodeView key={child.id} node={child} depth={depth + 1} />
      ))}
  </div>
)

export const GrowthTab: React.FC<GrowthTabProps> = ({ user }) => {
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [data, setData] = useState<{
    stats: {
      referralCode: string | null
      totalInvites: number
      referralLimit: number
      completedInvites: number
      deferredInvites: number
      pendingInvites: number
      remainingQuota: number
      rewardSummary: string
    }
    tree: Admin.ReferralNode | null
  } | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const res = await getUserReferralData(user.id)
      if (res.success && res.data) {
        setData(res.data)
      } else {
        setData(null)
      }
      setLoading(false)
    }

    void loadData()
  }, [user.id])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!data || !data.tree) {
    return (
      <div className="p-8 text-center text-slate-500">无法加载增长数据</div>
    )
  }

  const statCards = [
    {
      key: 'total',
      label: '累计邀请',
      value: data.stats.totalInvites,
      icon: Users,
      accent: 'text-cyan-300',
    },
    {
      key: 'completed',
      label: '已转化',
      value: data.stats.completedInvites,
      icon: TrendingUp,
      accent: 'text-emerald-300',
    },
    {
      key: 'deferred',
      label: '延迟发放',
      value: data.stats.deferredInvites,
      icon: Ticket,
      accent: 'text-amber-300',
    },
    {
      key: 'pending',
      label: '待完成',
      value: data.stats.pendingInvites,
      icon: GitCommit,
      accent: 'text-slate-200',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 desktop:grid-cols-[1.15fr_1fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex flex-col gap-5 tablet:flex-row tablet:items-start tablet:justify-between">
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">
                  推荐码
                </div>
                <div className="flex items-center gap-3">
                  <code className="rounded border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-lg tracking-[0.25em] text-emerald-400">
                    {data.stats.referralCode || '未配置'}
                  </code>
                  <button
                    onClick={async () => {
                      if (!data.stats.referralCode) return
                      try {
                        await navigator.clipboard.writeText(
                          data.stats.referralCode
                        )
                        setCopied(true)
                        toast.success('推荐码已复制到剪贴板')
                        setTimeout(() => setCopied(false), 2000)
                      } catch {
                        toast.error('复制失败，请手动复制')
                      }
                    }}
                    disabled={!data.stats.referralCode}
                    className="rounded p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    title="复制推荐码"
                  >
                    {copied ? (
                      <Check size={18} className="text-emerald-400" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 tablet:grid-cols-4">
                {statCards.map((card) => {
                  const Icon = card.icon
                  return (
                    <div
                      key={card.key}
                      className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {card.label}
                        </span>
                        <Icon className={`h-4 w-4 ${card.accent}`} />
                      </div>
                      <div className="text-2xl font-semibold text-white">
                        {card.value}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Link
              href="/admin/referrals"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800"
            >
              查看站点增长工具
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 tablet:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                奖励结算
              </div>
              <div className="text-sm font-medium text-slate-200">
                {data.stats.rewardSummary}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
                推荐额度
              </div>
              <div className="text-sm font-medium text-slate-200">
                总额度 {data.stats.referralLimit}，剩余{' '}
                {data.stats.remainingQuota}
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-[400px] rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-200">
            <GitCommit size={16} className="text-slate-500" />
            推荐网络
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            以当前用户为根节点，展示两层推荐关系与当前订阅档位。
          </p>

          <div className="pl-2">
            <div className="mb-2 flex items-center gap-3 rounded border border-blue-500/30 bg-slate-800/60 p-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-blue-200">
                我
              </div>
              <span className="text-sm font-medium text-white">
                {data.tree.name}
              </span>
              <UserTierBadge tier={data.tree.tier} />
            </div>
            {data.tree.children?.map((child) => (
              <ReferralNodeView key={child.id} node={child} depth={1} />
            ))}
            {(!data.tree.children || data.tree.children.length === 0) && (
              <div className="pl-8 pt-2 text-sm italic text-slate-500">
                当前暂无推荐关系
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
