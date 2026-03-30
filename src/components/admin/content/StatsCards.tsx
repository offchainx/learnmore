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
import { pageKpiCardClass } from '@/components/shared/pageSurfaces'
import {
  pageHeroNumericValueClass,
  pageKickerClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'

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
      caption: '有进行中任务时自动轮询',
      icon: CalendarDays,
      iconClassName: 'text-[hsl(var(--state-info-fg))]',
      iconBgClassName:
        'bg-[hsl(var(--state-info-bg))] dark:bg-[hsl(var(--state-info-bg))]',
      glowClassName: 'bg-[hsl(var(--state-info-fg))]/20',
      borderClassName: 'border-borderTone',
    },
    {
      title: '进行中任务',
      value: String(stats.activeBatches),
      meta: stats.activeBatches > 0 ? '解析与结构化正在处理' : '当前队列空闲',
      caption: `${stats.completedTasks} 个已完成批次`,
      icon: Activity,
      iconClassName: 'text-[hsl(var(--state-info-fg))]',
      iconBgClassName:
        'bg-[hsl(var(--state-info-bg))] dark:bg-[hsl(var(--state-info-bg))]',
      glowClassName: 'bg-[hsl(var(--state-info-fg))]/20',
      borderClassName: 'border-borderTone',
    },
    {
      title: '解析成功率',
      value: `${stats.successRate}%`,
      meta: `成功 ${stats.completedTasks} / 失败 ${stats.failedTasks}`,
      caption: stats.failedTasks === 0 ? '当前管线稳定' : '建议优先处理失败项',
      icon: CheckCircle2,
      iconClassName: 'text-[hsl(var(--state-success-fg))]',
      iconBgClassName:
        'bg-[hsl(var(--state-success-bg))] dark:bg-[hsl(var(--state-success-bg))]',
      glowClassName: 'bg-[hsl(var(--state-success-fg))]/20',
      borderClassName: 'border-borderTone',
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
      iconClassName: 'text-[hsl(var(--state-warning-fg))]',
      iconBgClassName:
        'bg-[hsl(var(--state-warning-bg))] dark:bg-[hsl(var(--state-warning-bg))]',
      glowClassName: 'bg-[hsl(var(--state-warning-fg))]/20',
      borderClassName: 'border-borderTone',
    },
    {
      title: '近 7 天导入题量',
      value: String(stats.importedQuestions7d),
      meta: '反映近期内容入库速度',
      caption:
        stats.importedQuestions7d > 0 ? '导入节奏已启动' : '最近 7 天暂无新增',
      icon: TriangleAlert,
      iconClassName: 'text-[hsl(var(--text-secondary))]',
      iconBgClassName: 'bg-surface-subtle dark:bg-surface-selected',
      glowClassName: 'bg-[hsl(var(--focus-ring))]/16',
      borderClassName: 'border-borderTone',
    },
  ] as const

  return (
    <div className="grid gap-3 sm:grid-cols-2 desktop:grid-cols-3 2xl:grid-cols-6">
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
                pageKpiCardClass,
                'flex h-full min-h-[154px] flex-col justify-between p-4',
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
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--border-strong))]/70 to-transparent"
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
                    <p className={pageKickerClass}>{card.title}</p>
                    <div className="flex items-end gap-2">
                      <p className={pageHeroNumericValueClass}>{card.value}</p>
                      <span className={`pb-1 ${pageMetaTextClass}`}>
                        {card.caption}
                      </span>
                    </div>
                  </div>
                  <p className={`line-clamp-2 max-w-full ${pageMetaTextClass}`}>
                    {card.meta}
                  </p>
                </div>

                <div
                  className={cn(
                    'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-borderTone',
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
        <Card
          className={`${pageKpiCardClass} relative flex h-full min-h-[154px] flex-col justify-between border-borderTone p-4`}
        >
          <motion.div
            className="absolute -right-8 top-0 h-24 w-24 rounded-full bg-[hsl(var(--state-info-fg))]/20 blur-3xl"
            animate={{ scale: [1, 1.16, 1], opacity: [0.16, 0.3, 0.16] }}
            transition={{ duration: 4.5, repeat: Infinity }}
          />

          <div className="relative flex h-full items-start justify-between gap-4">
            <div className="flex min-h-[120px] flex-1 flex-col justify-between gap-3">
              <div className="space-y-1.5">
                <p className={pageKickerClass}>存储使用</p>
                <div className="flex items-end gap-2">
                  <p className={pageHeroNumericValueClass}>
                    {stats.storageUsed} MB
                  </p>
                  <span className={`pb-1 ${pageMetaTextClass}`}>
                    已用 {usagePercent}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className={`line-clamp-2 ${pageMetaTextClass}`}>
                  总量 {stats.storageLimit} MB，剩余 {remaining} MB
                </p>
                <div className="space-y-2">
                  <div className="h-2.5 overflow-hidden rounded-full bg-surface-subtle dark:bg-surface-subtle">
                    <motion.div
                      className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)),hsl(var(--state-info-fg)))]"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, usagePercent)}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>源文件容量</span>
                    <span>
                      {usagePercent >= 80 ? '建议清理旧任务' : '容量健康'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-borderTone bg-[hsl(var(--state-info-bg))] dark:bg-[hsl(var(--state-info-bg))]">
              <HardDrive className="h-5 w-5 text-[hsl(var(--state-info-fg))]" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
