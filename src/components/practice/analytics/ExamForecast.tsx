'use client'

import { memo, useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getExamForecastData } from '@/actions/practice/statistics'
import type { ExamForecast as ExamForecastType, TrendDirection } from '@/lib/practice/types'
import { cn } from '@/lib/utils'

interface ExamForecastProps {
  userId: string
  subjectId?: string
  className?: string
}

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
          <div
            key={i}
            className={cn(
              'flex-1 rounded-t-sm transition-colors',
              isLast
                ? 'bg-blue-500'
                : 'bg-blue-500/30 hover:bg-blue-500/50'
            )}
            style={{ height: `${Math.max(height, 5)}%` }}
            title={`Day ${i + 1}: ${Math.round(value)}%`}
          />
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
      text: '+1 Grade',
      color: 'text-green-400'
    },
    DOWN: {
      icon: TrendingDown,
      text: '-1 Grade',
      color: 'text-red-400'
    },
    STABLE: {
      icon: Minus,
      text: 'Stable',
      color: 'text-slate-400'
    }
  }

  const { icon: Icon, text, color } = config[trend]

  return (
    <div className={cn('flex items-center text-sm font-bold', color, className)}>
      {text}
      <Icon className="w-3 h-3 ml-1" />
    </div>
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
    if (value >= 80) return 'High'
    if (value >= 50) return 'Medium'
    return 'Low'
  }

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <span>Confidence:</span>
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
  )
})

/**
 * Loading 骨架屏
 */
function ExamForecastSkeleton() {
  // 预定义的高度值，避免在渲染时使用 Math.random()
  const skeletonHeights = [45, 60, 35, 70, 55, 80, 50]

  return (
    <Card className="p-0 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white overflow-hidden relative">
      <div className="p-5 relative z-10">
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
      <Skeleton className="h-10 w-full bg-slate-800" />
    </Card>
  )
}

/**
 * 考分预测主组件
 * 基于用户近期练习表现预测考试成绩
 */
function ExamForecastInner({ userId, subjectId, className }: ExamForecastProps) {
  const [forecast, setForecast] = useState<ExamForecastType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const data = await getExamForecastData(userId, subjectId)

        if (!isMounted) return
        setForecast(data)
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to fetch exam forecast data:', err)
        setError('加载预测数据失败')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [userId, subjectId])

  if (loading) {
    return <ExamForecastSkeleton />
  }

  if (error) {
    return (
      <Card className={cn("p-5 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white", className)}>
        <div className="text-center text-slate-400 py-4">
          {error}
        </div>
      </Card>
    )
  }

  if (!forecast) {
    return (
      <Card className={cn("p-5 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white", className)}>
        <div className="text-center text-slate-400 py-4">
          暂无预测数据
        </div>
      </Card>
    )
  }

  // 数据不足的情况
  if (forecast.grade === 'N/A') {
    return (
      <Card className={cn("p-0 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white overflow-hidden relative", className)}>
        <div className="p-5 relative z-10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" /> Exam Forecast
          </div>
          <div className="text-center py-6">
            <div className="text-2xl font-bold text-slate-500 mb-2">--</div>
            <p className="text-sm text-slate-500">
              需要更多练习数据才能生成预测
            </p>
            <p className="text-xs text-slate-600 mt-1">
              继续练习，答题记录会帮助我们更准确地预测
            </p>
          </div>
        </div>
        <div className="bg-slate-800/50 p-3 text-center border-t border-slate-800 relative z-10">
          <span className="text-xs text-slate-500">Start practicing to see your forecast</span>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn("p-0 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white overflow-hidden relative", className)}>
      <div className="p-5 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
          <TrendingUp className="w-4 h-4 text-blue-500" /> Exam Forecast
        </div>

        {/* Grade Display */}
        <div className="flex items-end gap-3 mb-4">
          <div className="text-4xl font-bold text-white">{forecast.grade}</div>
          <TrendIndicator trend={forecast.trend} className="mb-1" />
        </div>

        {/* Sparkline Chart */}
        <Sparkline data={forecast.sparklineData} className="opacity-80 mb-3" />

        {/* Confidence Bar */}
        <ConfidenceBar confidence={forecast.confidence} />
      </div>

      {/* Footer */}
      <div className="bg-slate-800/50 p-3 text-center border-t border-slate-800 relative z-10">
        <span className="text-xs text-slate-400">
          Predicted for <strong>Finals (Nov)</strong>
        </span>
      </div>

      {/* Background Glow Effect */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-900/20 to-transparent pointer-events-none" />
    </Card>
  )
}

// 使用 React.memo 优化性能
const ExamForecast = memo(ExamForecastInner)

export default ExamForecast
