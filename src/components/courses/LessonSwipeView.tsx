'use client'

import { useGesture } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/web'
import { ReactNode } from 'react'

// 在组件外部创建animated组件
const AnimatedDiv = animated('div')

interface LessonSwipeViewProps {
  currentChapterIndex: number
  totalChapters: number
  onNavigate: (direction: 'prev' | 'next') => void
  children: ReactNode
  disabled?: boolean
}

export function LessonSwipeView({
  currentChapterIndex,
  totalChapters,
  onNavigate,
  children,
  disabled = false,
}: LessonSwipeViewProps) {
  const [{ x }, api] = useSpring(() => ({ x: 0 }))

  const bind = useGesture({
    onDrag: ({ down, movement: [mx], direction: [xDir], cancel, velocity: [vx] }) => {
      if (disabled) {
        cancel()
        return
      }

      // 边界检测 - 第一章禁止右滑
      if (currentChapterIndex === 0 && xDir > 0) {
        cancel()
        return
      }

      // 边界检测 - 最后一章禁止左滑
      if (currentChapterIndex === totalChapters - 1 && xDir < 0) {
        cancel()
        return
      }

      if (down) {
        // 拖动时跟随手指
        api.start({ x: mx, immediate: true })
      } else {
        // 释放时判断是否触发切换
        // 条件: 滑动距离 > 50px 或 速度 > 0.3
        const shouldSwipe = Math.abs(mx) > 50 || Math.abs(vx) > 0.3

        if (shouldSwipe) {
          if (xDir > 0 && currentChapterIndex > 0) {
            // 右滑 - 上一章
            onNavigate('prev')
          } else if (xDir < 0 && currentChapterIndex < totalChapters - 1) {
            // 左滑 - 下一章
            onNavigate('next')
          }
        }

        // 回弹到原位
        api.start({ x: 0 })
      }
    },
  })

  return (
    <AnimatedDiv
      {...bind()}
      style={{
        x,
        touchAction: 'pan-y' as const, // 只允许垂直滚动
      }}
      className="w-full h-full select-none"
    >
      {children}
    </AnimatedDiv>
  )
}
