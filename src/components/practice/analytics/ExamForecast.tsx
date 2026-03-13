'use client'

import { memo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ExamForecast as ExamForecastType, TrendDirection } from '@/lib/practice/types'
import { cn } from '@/lib/utils'

interface ExamForecastProps {
  forecast: ExamForecastType | null
  loading?: boolean
  error?: string | null
  className?: string
}

const cardShellClassName =
  'overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-[0_18px_40px_rgba(2,8,23,0.28)]'

/**
 * Sparkline 迷你图表组件
 * 显示近7天每日正确率的柱状图
 */
const Sparkline = memo(function Sparkline({
  data,
  className
}: {
  data: number[]
  className?: string
}) {
  const maxValue = Math.max(...data, 1) // 防止除以0

  return (
    <div className={cn('h-10 flex items-end gap-1', className)}>
      {data.map((value, i) => {
        const height = (value / maxValue) * 100
        const isLast = i === data.length - 1

        return (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex-1 rounded-t-sm transition-colors cursor-help',
                  isLast
                    ? 'bg-blue-500'
                    : 'bg-blue-500/30 hover:bg-blue-500/50'
                )}
                style={{ height: `${Math.max(height, 5)}%` }}
              />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="font-bold">近第 {7 - i} 天</p>
              <p className="text-xs text-muted-foreground">正确率：{Math.round(value)}%</p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
})

/**
 * 趋势指示器组件
 */
const TrendIndicator = memo(function TrendIndicator({
  trend,
  className
}: {
  trend: TrendDirection
  className?: string
}) {
  const config: Record<TrendDirection, { icon: typeof TrendingUp; text: string; color: string }> = {
    UP: {
      icon: TrendingUp,
      text: '升 1 档',
      color: 'text-green-400'
    },
    DOWN: {
      icon: TrendingDown,
      text: '降 1 档',
      color: 'text-red-400'
    },
    STABLE: {
      icon: Minus,
      text: '持平',
      color: 'text-slate-400'
    }
  }

  const { icon: Icon, text, color } = config[trend]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('flex items-center text-sm font-bold cursor-help', color, className)}>
          {text}
          <Icon className="w-3 h-3 ml-1" />
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>当前 7 天对比前 7 天表现</p>
      </TooltipContent>
    </Tooltip>
  )
})

/**
 * 置信度指示器
 */
const ConfidenceBar = memo(function ConfidenceBar({
  confidence
}: {
  confidence: number
}) {
  const getConfidenceLabel = (value: number) => {
    if (value >= 80) return '高'
    if (value >= 50) return '中'
    return '低'
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 text-xs text-slate-500 cursor-help">
          <span>预测可信度</span>
          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                confidence >= 80 ? 'bg-green-500' :
                confidence >= 50 ? 'bg-yellow-500' :
                'bg-red-500'
              )}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span>{getConfidenceLabel(confidence)}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>根据答题量与最近活跃度估算可信度</p>
      </TooltipContent>
    </Tooltip>
  )
})

/**
 * Loading 骨架屏
 */
function ExamForecastSkeleton() {
  // 预定义的高度值，避免在渲染时使用 Math.random()
  const skeletonHeights = [45, 60, 35, 70, 55, 80, 50]

  return (
    <Card className={`${cardShellClassName} relative p-0`}>
      <div className="relative z-10 p-4">
        <Skeleton className="h-4 w-24 bg-slate-700 mb-4" />
        <div className="flex items-end gap-3 mb-4">
          <Skeleton className="h-10 w-12 bg-slate-700" />
          <Skeleton className="h-4 w-16 bg-slate-700" />
        </div>
        <div className="h-10 flex items-end gap-1">
          {skeletonHeights.map((height, i) => (
            <Skeleton
              key={i}
              className="flex-1 bg-slate-700"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
      <Skeleton className="h-8 w-full bg-slate-800" />
    </Card>
  )
}

/**
 * 考分预测主组件
 * 基于用户近期练习表现预测考试成绩（数据由父组件注入）
 */
function ExamForecastInner({
  forecast,
  loading = false,
  error = null,
  className,
}: ExamForecastProps) {

  if (loading) {
    return <ExamForecastSkeleton />
  }

  if (error) {
    return (
      <Card className={cn(cardShellClassName, "p-4", className)}>
        <div className="text-center text-slate-400 py-4">
          {error}
        </div>
      </Card>
    )
  }

  if (!forecast) {
    return (
      <Card className={cn(cardShellClassName, "p-4", className)}>
        <div className="py-4 text-center text-slate-400">
          暂无预测数据
        </div>
      </Card>
    )
  }

  // 数据不足的情况
  if (forecast.grade === 'N/A') {
    return (
      <Card className={cn(cardShellClassName, "relative p-0", className)}>
        <div className="relative z-10 p-4">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <TrendingUp className="w-4 h-4 text-blue-500" /> 考试预测
          </div>
          <div className="py-4 text-center">
            <div className="text-2xl font-bold text-slate-500 mb-2">--</div>
            <p className="text-sm text-slate-500">
              需要更多练习数据才能生成预测
            </p>
            <p className="mt-1 text-xs text-slate-600">
              继续练习，答题记录会帮助我们更准确地预测
            </p>
          </div>
        </div>
        <div className="relative z-10 border-t border-slate-800 bg-slate-800/50 p-2.5 text-center">
          <span className="text-[11px] text-slate-500">继续练习后，这里会显示更准确的预测</span>
        </div>
      </Card>
    )
  }

  const trendCopy: Record<TrendDirection, string> = {
    UP: '较上次稳步上升',
    DOWN: '近期表现有回落',
    STABLE: '整体保持稳定',
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Card className={cn(cardShellClassName, "relative p-0", className)}>
        <div className="relative z-10 p-4">
          {/* Header */}
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <TrendingUp className="w-4 h-4 text-blue-500" /> 考试预测
          </div>

          <div className="grid grid-cols-[auto_1fr] items-end gap-x-3 gap-y-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help text-4xl font-bold text-white">{forecast.grade}</div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-xs">
                  <p className="font-bold mb-1">预测构成：</p>
                  <ul className="list-disc pl-3 space-y-0.5">
                    <li>正确率：60%</li>
                    <li>完成度：30%</li>
                    <li>近期待状态：10%</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
            
            <div className="space-y-1 pb-1">
              <TrendIndicator trend={forecast.trend} />
              <div className="text-[12px] text-slate-400">预测分数约 {forecast.score} 分</div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/8 bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              <span>近期趋势</span>
              <span>{trendCopy[forecast.trend]}</span>
            </div>
            <Sparkline data={forecast.sparklineData} className="mb-2 opacity-80" />
            <ConfidenceBar confidence={forecast.confidence} />
          </div>

          <div className="mt-3 grid gap-2">
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/8 px-3 py-2 text-[12px] leading-5 text-emerald-100">
              预测等级基于最近练习正确率、完成度和连续活跃表现综合生成。
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-[12px] leading-5 text-slate-300">
              建议继续完成 Smart Drill 和 Mock Arena，考试预测会更快收敛。
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 border-t border-slate-800 bg-slate-800/50 p-2.5 text-center">
          <span className="text-[11px] text-slate-400">
            预计当前可达到 <strong>{forecast.score} 分左右</strong>
          </span>
        </div>

        {/* Background Glow Effect */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-900/20 to-transparent pointer-events-none" />
      </Card>
    </TooltipProvider>
  )
}

// 使用 React.memo 优化性能
const ExamForecast = memo(ExamForecastInner)

export default ExamForecast
