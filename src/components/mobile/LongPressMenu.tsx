'use client'

import { ReactNode, useState, useRef } from 'react'
import { useGesture } from '@use-gesture/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LongPressMenuProps {
  children: ReactNode
  onFavorite?: () => void
  onShare?: () => void
  onReport?: () => void
  disabled?: boolean
}

export function LongPressMenu({
  children,
  onFavorite,
  onShare,
  onReport,
  disabled = false,
}: LongPressMenuProps) {
  const [open, setOpen] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const bind = useGesture({
    // 阻止默认右键菜单
    onContextMenu: (state) => {
      if (disabled) return
      const e = state.event as MouseEvent
      e.preventDefault()
      setOpen(true)

      // 触觉反馈
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    },

    // 长按触发
    onPointerDown: (state) => {
      if (disabled) return
      const event = state.event as PointerEvent

      // 长按500ms触发
      timerRef.current = setTimeout(() => {
        // 触觉反馈
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
        setOpen(true)
      }, 500)

      // 清理定时器
      const cleanup = () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
      }

      const target = event.target as HTMLElement
      target.addEventListener('pointerup', cleanup, { once: true })
      target.addEventListener('pointercancel', cleanup, { once: true })
      target.addEventListener('pointermove', cleanup, { once: true })
    },
  })

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div {...bind()} className="cursor-pointer">
          {children}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        {onFavorite && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onFavorite()
              setOpen(false)
            }}
          >
            <span className="mr-2">⭐</span>
            收藏
          </DropdownMenuItem>
        )}
        {onShare && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onShare()
              setOpen(false)
            }}
          >
            <span className="mr-2">🔗</span>
            分享
          </DropdownMenuItem>
        )}
        {onReport && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onReport()
              setOpen(false)
            }}
            className="text-destructive"
          >
            <span className="mr-2">🚩</span>
            举报
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
