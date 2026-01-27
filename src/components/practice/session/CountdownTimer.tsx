'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Clock, AlertTriangle } from 'lucide-react'

interface CountdownTimerProps {
  /** 总时长（秒） */
  duration: number
  /** 时间到回调 */
  onTimeUp: () => void
  /** 是否暂停 */
  isPaused?: boolean
  /** 额外的 className */
  className?: string
  /** 警告阈值（秒），低于此值显示红色警告，默认 300 (5分钟) */
  warningThreshold?: number
}

/**
 * 倒计时组件
 * - 显示格式: MM:SS 或 HH:MM:SS（超过1小时时）
 * - 剩余时间低于阈值时文字变红
 * - 时间到时触发 onTimeUp 回调
 */
export default function CountdownTimer({
  duration,
  onTimeUp,
  isPaused = false,
  className,
  warningThreshold = 300 // 5分钟
}: CountdownTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(duration)

  // 格式化时间显示
  const formatTime = useCallback((seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // 倒计时逻辑
  useEffect(() => {
    if (isPaused) return

    if (remainingSeconds <= 0) {
      onTimeUp()
      return
    }

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [remainingSeconds, isPaused, onTimeUp])

  const isWarning = remainingSeconds <= warningThreshold && remainingSeconds > 0
  const isCritical = remainingSeconds <= 60 && remainingSeconds > 0 // 最后1分钟

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold transition-colors',
        isWarning && !isCritical && 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        isCritical && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse',
        !isWarning && !isCritical && 'bg-muted text-foreground',
        className
      )}
    >
      {isCritical ? (
        <AlertTriangle className="w-5 h-5" />
      ) : (
        <Clock className="w-5 h-5" />
      )}
      <span>{formatTime(remainingSeconds)}</span>
    </div>
  )
}
