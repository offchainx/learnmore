'use client'

/**
 * Impersonate Banner Component
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * 伪装登录状态警告条：显示在页面顶部，包含退出按钮和倒计时
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AlertCircle, LogOut, Clock } from 'lucide-react'

interface ImpersonateBannerProps {
  targetEmail: string
  expiresAt: string // ISO 时间字符串
}

export const ImpersonateBanner: React.FC<ImpersonateBannerProps> = ({
  targetEmail,
  expiresAt,
}) => {
  const [remainingTime, setRemainingTime] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const expiry = new Date(expiresAt).getTime()
      const diff = expiry - now

      if (diff <= 0) {
        setIsExpired(true)
        setRemainingTime('已过期')
        // 自动退出
        window.location.href = '/api/auth/impersonate/end'
        return
      }

      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setRemainingTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    // 立即更新一次
    updateTimer()

    // 每秒更新
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  const handleExit = () => {
    window.location.href = '/api/auth/impersonate/end'
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Left - Warning */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full animate-pulse">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium">
                你正在以 <strong>{targetEmail}</strong> 的身份浏览
              </p>
              <p className="text-xs text-red-100">
                所有操作将被记录到审计日志
              </p>
            </div>
          </div>

          {/* Right - Timer & Exit */}
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-sm">
              <Clock className="w-4 h-4" />
              <span className={`font-mono font-medium ${isExpired ? 'text-red-200' : ''}`}>
                {remainingTime}
              </span>
            </div>

            {/* Exit Button */}
            <button
              onClick={handleExit}
              className="flex items-center gap-2 px-4 py-1.5 bg-white text-red-600 rounded-full text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出伪装
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 检查当前是否处于伪装状态的 Hook
 * 从 Cookie 中读取伪装信息
 */
export function useImpersonationState(): {
  isImpersonating: boolean
  targetEmail: string | null
  expiresAt: string | null
} {
  const [state, setState] = useState({
    isImpersonating: false,
    targetEmail: null as string | null,
    expiresAt: null as string | null,
  })
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(true)

  const clearScheduledCheck = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      clearScheduledCheck()
    }
  }, [clearScheduledCheck])

  useEffect(() => {
    async function checkImpersonation() {
      try {
        const res = await fetch('/api/auth/impersonate/status', { cache: 'no-store' })
        if (!res.ok) {
          if (isMountedRef.current) {
            setState({ isImpersonating: false, targetEmail: null, expiresAt: null })
          }
          clearScheduledCheck()
          return { isImpersonating: false, targetEmail: null, expiresAt: null }
        }

        const data = await res.json()
        if (!isMountedRef.current) {
          return { isImpersonating: false, targetEmail: null, expiresAt: null }
        }

        if (data.isImpersonating) {
          setState({
            isImpersonating: true,
            targetEmail: data.targetEmail ?? null,
            expiresAt: data.expiresAt ?? null,
          })
          clearScheduledCheck()
          if (data.expiresAt) {
            const expiryTime = new Date(data.expiresAt).getTime()
            const delay = Math.max(1000, expiryTime - Date.now() + 1000)
            timeoutRef.current = setTimeout(() => {
              void checkImpersonation()
            }, delay)
          }
        } else {
          // 伪装状态已结束（如服务端撤销），清除本地状态
          setState({ isImpersonating: false, targetEmail: null, expiresAt: null })
          clearScheduledCheck()
        }

        return {
          isImpersonating: Boolean(data.isImpersonating),
          targetEmail: data.targetEmail ?? null,
          expiresAt: data.expiresAt ?? null,
        }
      } catch {
        // 网络错误时忽略，等下次可见性变化或到期复查
        return { isImpersonating: false, targetEmail: null, expiresAt: null }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        clearScheduledCheck()
        return
      }

      void checkImpersonation()
    }

    // 立即检查一次，然后只在可见性变化或到期时复查
    void checkImpersonation()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearScheduledCheck()
    }
  }, [clearScheduledCheck])

  return state
}
