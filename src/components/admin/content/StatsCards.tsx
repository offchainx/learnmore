import React from 'react'
import { Card } from '@/components/ui/card'
import {
  CalendarDays,
  CheckCircle2,
  ClipboardClock,
  HardDrive,
  Loader2,
  TriangleAlert,
} from 'lucide-react'
import { StatsData } from '@/types/content-pipeline'

interface StatsCardsProps {
  stats: StatsData
}

export function StatsCards({ stats }: StatsCardsProps) {
  const usagePercent = stats.storageLimit > 0 ? Math.round((stats.storageUsed / stats.storageLimit) * 100) : 0
  const remaining = Math.max(0, Math.round((stats.storageLimit - stats.storageUsed) * 100) / 100)

  return (
    <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="min-w-max grid grid-flow-col auto-cols-[minmax(220px,1fr)] gap-3">
        <Card className="p-4 border border-[#24324D] bg-[#151F36] rounded-xl shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#9FB0C9]">今日新建任务</p>
              <p className="text-2xl font-bold text-[#E6EDF7] mt-1">{stats.tasksToday}</p>
            </div>
            <CalendarDays className="h-4 w-4 text-[#7D8CA6]" />
          </div>
        </Card>

        <Card className="p-4 border border-[#24324D] bg-[#151F36] rounded-xl shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#9FB0C9]">进行中任务</p>
              <p className="text-2xl font-bold text-[#E6EDF7] mt-1">{stats.activeBatches}</p>
            </div>
            <Loader2 className="h-4 w-4 text-[#3B82F6]" />
          </div>
        </Card>

        <Card className="p-4 border border-[#24324D] bg-[#151F36] rounded-xl shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#9FB0C9]">解析成功率</p>
              <p className="text-2xl font-bold text-[#E6EDF7] mt-1">{stats.successRate}%</p>
              <p className="text-xs text-[#7D8CA6] mt-1">
                成功 {stats.completedTasks} / 失败 {stats.failedTasks}
              </p>
            </div>
            <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
          </div>
        </Card>

        <Card className="p-4 border border-[#24324D] bg-[#151F36] rounded-xl shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#9FB0C9]">待审核题目</p>
              <p className="text-2xl font-bold text-[#E6EDF7] mt-1">{stats.pendingReviewQuestions}</p>
            </div>
            <ClipboardClock className="h-4 w-4 text-[#F59E0B]" />
          </div>
        </Card>

        <Card className="p-4 border border-[#24324D] bg-[#151F36] rounded-xl shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#9FB0C9]">近7天导入题量</p>
              <p className="text-2xl font-bold text-[#E6EDF7] mt-1">{stats.importedQuestions7d}</p>
            </div>
            <TriangleAlert className="h-4 w-4 text-[#7D8CA6]" />
          </div>
        </Card>

        <Card className="p-4 border border-[#24324D] bg-[#151F36] rounded-xl min-w-[300px] shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[#9FB0C9]">
              <HardDrive className="h-4 w-4 text-[#3B82F6]" />
              存储使用
            </div>
            <div className="text-xs text-[#9FB0C9]">{usagePercent}%</div>
          </div>
          <div className="text-xs text-[#7D8CA6] mb-2">
            已用 {stats.storageUsed} MB / 总量 {stats.storageLimit} MB（剩余 {remaining} MB）
          </div>
          <div className="w-full bg-[#0F172A] rounded-full h-2">
            <div
              className="bg-[#3B82F6] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, usagePercent)}%` }}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}
