'use client'

import { useGesture } from '@use-gesture/react'
import { useSpring } from '@react-spring/web'
import { useState } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  disabled?: boolean
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [{ y }, api] = useSpring(() => ({ y: 0 }))

  const bind = useGesture({
    onDrag: async ({ down, movement: [, my], memo = y.get(), cancel }) => {
      if (disabled || isRefreshing) {
        cancel()
        return memo
      }

      // 只在页面顶部时允许下拉
      if (window.scrollY > 0) {
        return memo
      }

      // 只允许向下拉
      if (my < 0) {
        return memo
      }

      if (down) {
        // 下拉时增加阻尼效果 (拉得越远,阻力越大)
        const dampedY = my * 0.5
        api.start({ y: Math.max(0, Math.min(dampedY, threshold * 1.5)), immediate: true })
      } else {
        // 释放手指
        const pullDistance = y.get()

        if (pullDistance > threshold && !isRefreshing) {
          // 触发刷新
          setIsRefreshing(true)
          api.start({ y: threshold }) // 保持在阈值位置

          try {
            await onRefresh()
          } finally {
            setIsRefreshing(false)
            api.start({ y: 0 }) // 回弹
          }
        } else {
          // 未达到阈值,直接回弹
          api.start({ y: 0 })
        }
      }
      return memo
    },
  })

  return { bind, y, isRefreshing }
}
