'use client'

import { ReactNode } from 'react'
import { animated } from '@react-spring/web'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { Loader2 } from 'lucide-react'

// 在组件外部创建animated组件
const AnimatedDiv = animated('div')
const AnimatedSpan = animated('span')

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  disabled?: boolean
  threshold?: number
}

export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  threshold = 80,
}: PullToRefreshProps) {
  const { bind, y, isRefreshing } = usePullToRefresh({
    onRefresh,
    threshold,
    disabled,
  })

  return (
    <div className="relative">
      {/* 下拉刷新指示器 */}
      <AnimatedDiv
        style={{
          opacity: y.to([0, threshold], [0, 1]),
          transform: y.to((v) => `translateY(${Math.min(v - 60, 0)}px)`),
        }}
        className="absolute top-0 left-0 right-0 flex items-center justify-center h-16 pointer-events-none z-10"
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          {isRefreshing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">刷新中...</span>
            </>
          ) : (
            <>
              <AnimatedSpan
                style={{
                  transform: y.to((v) => `rotate(${Math.min((v / threshold) * 180, 180)}deg)`),
                  display: 'inline-block' as const,
                }}
              >
                ↓
              </AnimatedSpan>
              <span className="text-sm font-medium">
                {y.get() > threshold ? '松开刷新' : '下拉刷新'}
              </span>
            </>
          )}
        </div>
      </AnimatedDiv>

      {/* 内容区域 */}
      <AnimatedDiv
        {...bind()}
        style={{ y }}
        className="min-h-screen"
      >
        {children}
      </AnimatedDiv>
    </div>
  )
}
