import React from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  ClipboardClock,
  HardDrive,
  TriangleAlert,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { StatsData } from '@/types/content-pipeline'

interface StatsCardsProps {
  stats: StatsData
}

export function StatsCards({ stats }: StatsCardsProps) {
  const usagePercent =
    stats.storageLimit > 0
      ? Math.round((stats.storageUsed / stats.storageLimit) * 100)
      : 0
  const remaining = Math.max(
    0,
    Math.round((stats.storageLimit - stats.storageUsed) * 100) / 100
  )

  const cardConfigs = [
    {
      title: '今日新建任务',
      value: String(stats.tasksToday),
      meta: stats.tasksToday > 0 ? '新批次已进入导入管线' : '等待新的导入批次',
      caption: '自动刷新 5 秒同步',
      icon: CalendarDays,
      iconClassName: 'text-[#93C5FD]',
      iconBgClassName: 'bg-[#18335E]',
      glowClassName: 'bg-[#2563EB]/20',
      borderClassName: 'border-[#2B4470]',
    },
    {
      title: '进行中任务',
      value: String(stats.activeBatches),
      meta: stats.activeBatches > 0 ? '解析与结构化正在处理' : '当前队列空闲',
      caption: `${stats.completedTasks} 个已完成批次`,
      icon: Activity,
      iconClassName: 'text-[#60A5FA]',
      iconBgClassName: 'bg-[#172554]',
      glowClassName: 'bg-[#3B82F6]/20',
      borderClassName: 'border-[#28426D]',
    },
    {
      title: '解析成功率',
      value: `${stats.successRate}%`,
      meta: `成功 ${stats.completedTasks} / 失败 ${stats.failedTasks}`,
      caption: stats.failedTasks === 0 ? '当前管线稳定' : '建议优先处理失败项',
      icon: CheckCircle2,
      iconClassName: 'text-[#4ADE80]',
      iconBgClassName: 'bg-[#123125]',
      glowClassName: 'bg-[#22C55E]/20',
      borderClassName: 'border-[#244B37]',
    },
    {
      title: '待审核题目',
      value: String(stats.pendingReviewQuestions),
      meta:
        stats.pendingReviewQuestions > 0
          ? '审核队列等待人工确认'
          : '审核队列已清空',
      caption: '建议联动已完成批次处理',
      icon: ClipboardClock,
      iconClassName: 'text-[#FBBF24]',
      iconBgClassName: 'bg-[#3B2A10]',
      glowClassName: 'bg-[#F59E0B]/20',
      borderClassName: 'border-[#5C4520]',
    },
    {
      title: '近 7 天导入题量',
      value: String(stats.importedQuestions7d),
      meta: '反映近期内容入库速度',
      caption:
        stats.importedQuestions7d > 0 ? '导入节奏已启动' : '最近 7 天暂无新增',
      icon: TriangleAlert,
      iconClassName: 'text-[#C4B5FD]',
      iconBgClassName: 'bg-[#2A1F4A]',
      glowClassName: 'bg-[#8B5CF6]/20',
      borderClassName: 'border-[#47306C]',
    },
  ] as const

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      {cardConfigs.map((card, index) => {
        const Icon = card.icon

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <Card
              className={cn(
                'relative flex h-full min-h-[154px] flex-col justify-between overflow-hidden rounded-[24px] border bg-[linear-gradient(180deg,rgba(17,26,46,0.98),rgba(11,18,32,0.96))] p-4 shadow-[0_18px_40px_rgba(2,8,23,0.38)]',
                card.borderClassName
              )}
            >
              <motion.div
                className={cn(
                  'absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl',
                  card.glowClassName
                )}
                animate={{ scale: [1, 1.14, 1], opacity: [0.16, 0.32, 0.16] }}
                transition={{
                  duration: 4.4,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />
              <motion.div
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
                animate={{ opacity: [0.35, 0.95, 0.35] }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />

              <div className="relative flex h-full items-start justify-between gap-4">
                <div className="flex min-h-[120px] flex-1 flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA3C0]">
                      {card.title}
                    </p>
                    <div className="flex items-end gap-2">
                      <p className="text-[2rem] font-semibold leading-none tracking-tight text-[#F8FBFF]">
                        {card.value}
                      </p>
                      <span className="pb-1 text-[11px] text-[#8EA3C0]">
                        {card.caption}
                      </span>
                    </div>
                  </div>
                  <p className="line-clamp-2 max-w-[20rem] text-sm leading-6 text-[#B2C3DA]">
                    {card.meta}
                  </p>
                </div>

                <div
                  className={cn(
                    'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10',
                    card.iconBgClassName
                  )}
                >
                  <Icon className={cn('h-5 w-5', card.iconClassName)} />
                </div>
              </div>
            </Card>
          </motion.div>
        )
      })}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.32 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="h-full"
      >
        <Card className="relative flex h-full min-h-[154px] flex-col justify-between overflow-hidden rounded-[24px] border border-[#274066] bg-[linear-gradient(180deg,rgba(16,28,49,0.98),rgba(11,18,32,0.96))] p-4 shadow-[0_18px_40px_rgba(2,8,23,0.38)]">
          <motion.div
            className="absolute -right-8 top-0 h-24 w-24 rounded-full bg-[#3B82F6]/20 blur-3xl"
            animate={{ scale: [1, 1.16, 1], opacity: [0.16, 0.3, 0.16] }}
            transition={{ duration: 4.5, repeat: Infinity }}
          />

          <div className="relative flex h-full items-start justify-between gap-4">
            <div className="flex min-h-[120px] flex-1 flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8EA3C0]">
                  存储使用
                </p>
                <div className="flex items-end gap-2">
                  <p className="text-[2rem] font-semibold leading-none tracking-tight text-[#F8FBFF]">
                    {stats.storageUsed} MB
                  </p>
                  <span className="pb-1 text-[11px] text-[#8EA3C0]">
                    已用 {usagePercent}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="line-clamp-2 text-sm leading-6 text-[#B2C3DA]">
                  总量 {stats.storageLimit} MB，剩余 {remaining} MB
                </p>
                <div className="space-y-2">
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#0B1425]">
                    <motion.div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#2563EB,#60A5FA)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, usagePercent)}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#8EA3C0]">
                    <span>源文件容量</span>
                    <span>
                      {usagePercent >= 80 ? '建议清理旧任务' : '容量健康'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#18335E]">
              <HardDrive className="h-5 w-5 text-[#60A5FA]" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
