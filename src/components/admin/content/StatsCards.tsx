import React from 'react'
import { Card } from '@/components/ui/card'
import { Layers, AlertTriangle, HardDrive, TrendingUp } from 'lucide-react'
import { StatsData } from '@/types/content-pipeline'

interface StatsCardsProps {
  stats: StatsData
}

export function StatsCards({ stats }: StatsCardsProps) {
  const usagePercent = Math.round((stats.storageUsed / stats.storageLimit) * 100)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Active Batches Card */}
      <Card className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
        <div className="flex justify-between items-start mb-4 relative">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-500/10">
            <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/10 px-2.5 py-1 rounded-full flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            +{stats.activeTrend}%
          </span>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
          {stats.activeBatches}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          活跃导入批次
        </div>
      </Card>

      {/* Flagged Errors Card */}
      <Card className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-red-500/30 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
        <div className="flex justify-between items-start mb-4 relative">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full">
            需审核
          </span>
        </div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
          {stats.flaggedErrors}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          标记错误的题目
        </div>
      </Card>

      {/* Storage Limit Card */}
      <Card className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-purple-500/30 transition-colors">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
        <div className="flex justify-between items-start mb-4 relative">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-500/10">
            <HardDrive className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center">
            {stats.storageLimit}MB 限制
          </span>
        </div>

        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 mb-2 mt-2 border border-slate-300 dark:border-slate-700/50">
          <div
            className="bg-gradient-to-r from-purple-600 to-indigo-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(147,51,234,0.3)] transition-all duration-1000"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 flex justify-between items-center mt-3">
          <span className="font-medium">已使用存储</span>
          <span className="font-bold text-slate-900 dark:text-white">{stats.storageUsed} MB</span>
        </div>
      </Card>
    </div>
  )
}
