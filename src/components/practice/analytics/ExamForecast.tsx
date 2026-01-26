'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import {
  ExamForecast as ExamForecastType,
  TrendDirection,
  generateMockForecast
} from '@/lib/practice/algorithms'

// ============ 类型定义 ============

interface ExamForecastProps {
  forecast?: ExamForecastType | null
  targetExam?: string // e.g. "Finals (Nov)"
  className?: string
}

interface SparklineProps {
  data: number[]
  className?: string
}

// ============ Sparkline 组件 ============

/**
 * 简单的条形图Sparkline
 * 使用div实现，无需额外图表库依赖
 */
function Sparkline({ data, className = '' }: SparklineProps) {
  // 归一化数据到0-100范围
  const maxValue = Math.max(...data, 1)
  const normalizedData = data.map(v => (v / maxValue) * 100)

  return (
    <div className={`h-10 flex items-end gap-1 opacity-80 ${className}`}>
      {normalizedData.map((height, i) => (
        <div
          key={i}
          className="flex-1 bg-blue-500/30 rounded-t-sm hover:bg-blue-500 transition-colors cursor-pointer"
          style={{ height: `${Math.max(height, 5)}%` }}
          title={`Day ${i + 1}: ${Math.round(data[i])}%`}
        />
      ))}
    </div>
  )
}

// ============ 趋势指示器 ============

interface TrendIndicatorProps {
  trend: TrendDirection
  className?: string
}

function TrendIndicator({ trend, className = '' }: TrendIndicatorProps) {
  const config = {
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
    <div className={`${color} text-sm font-bold mb-1 flex items-center ${className}`}>
      {text} <Icon className="w-3 h-3 ml-1" />
    </div>
  )
}

// ============ 等级颜色映射 ============

function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-emerald-400'
  if (grade.startsWith('B')) return 'text-blue-400'
  if (grade.startsWith('C')) return 'text-yellow-400'
  if (grade === 'D') return 'text-orange-400'
  return 'text-red-400' // F
}

// ============ 主组件 ============

/**
 * 考分预测组件
 *
 * 显示：
 * - 预测等级（大号文字）
 * - 趋势指示器（绿色↑/红色↓/灰色—）
 * - Sparkline图表（近7天表现）
 * - 目标考试文案
 */
export function ExamForecast({
  forecast,
  targetExam = 'Finals (Nov)',
  className = ''
}: ExamForecastProps) {
  // 如果没有传入数据，使用Mock数据
  const data = forecast ?? generateMockForecast()

  return (
    <Card
      className={`p-0 bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-white overflow-hidden relative ${className}`}
    >
      <div className="p-5 relative z-10">
        {/* 标题 */}
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
          <TrendingUp className="w-4 h-4 text-blue-500" /> Exam Forecast
        </div>

        {/* 等级和趋势 */}
        <div className="flex items-end gap-3 mb-4">
          <div className={`text-4xl font-bold ${getGradeColor(data.grade)}`}>
            {data.grade}
          </div>
          <TrendIndicator trend={data.trend} />
        </div>

        {/* Sparkline 图表 */}
        <Sparkline data={data.recentScores} />

        {/* 置信度指示器（可选显示） */}
        {data.confidence > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${data.confidence}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500">
              {data.confidence}% confidence
            </span>
          </div>
        )}
      </div>

      {/* 底部文案 */}
      <div className="bg-slate-800/50 p-3 text-center border-t border-slate-800 relative z-10">
        <span className="text-xs text-slate-400">
          Predicted for <strong>{targetExam}</strong>
        </span>
      </div>

      {/* 背景光晕效果 */}
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-900/20 to-transparent pointer-events-none" />
    </Card>
  )
}

// 导出默认组件和子组件
export { Sparkline, TrendIndicator }
export type { ExamForecastProps, SparklineProps }
