'use client'

/**
 * Impersonate Banner Wrapper Component
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * 全局伪装登录警告条包装组件
 * 用于在 layout 层条件渲染
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { ImpersonateBanner } from './ImpersonateBanner'

interface ImpersonationStatus {
  isImpersonating: boolean
  targetEmail?: string
  expiresAt?: string
}

export const ImpersonateBannerWrapper: React.FC = () => {
  const pathname = usePathname()
  const [status, setStatus] = useState<ImpersonationStatus>({ isImpersonating: false })
  const [isLoading, setIsLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isMountedRef = useRef(true)

  const shouldTrackPath = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')

  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      clearPolling()
    }
  }, [clearPolling])

  const checkStatus = useCallback(async (showLoading = false): Promise<ImpersonationStatus> => {
    if (showLoading) setIsLoading(true)

    try {
      const res = await fetch('/api/auth/impersonate/status', { cache: 'no-store' })
      if (!res.ok) {
        return { isImpersonating: false }
      }

      const data: ImpersonationStatus = await res.json()
      if (!isMountedRef.current) return { isImpersonating: false }
      setStatus(data)
      return data
    } catch (error) {
      console.error('Failed to check impersonation status:', error)
      if (isMountedRef.current) setStatus({ isImpersonating: false })
      return { isImpersonating: false }
    } finally {
      if (showLoading && isMountedRef.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!shouldTrackPath) {
      clearPolling()
      setStatus({ isImpersonating: false })
      setIsLoading(false)
      return
    }

    const setupPolling = (isImpersonating: boolean) => {
      clearPolling()
      if (isImpersonating && document.visibilityState === 'visible') {
        intervalRef.current = setInterval(() => {
          void checkStatus(false)
        }, 30000)
      }
    }

    const init = async () => {
      const current = await checkStatus(true)
      setupPolling(current.isImpersonating)
    }

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') {
        clearPolling()
        return
      }

      const current = await checkStatus(false)
      setupPolling(current.isImpersonating)
    }

    void init()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearPolling()
    }
  }, [checkStatus, clearPolling, shouldTrackPath])

  // 加载中或非伪装状态时不渲染
  if (isLoading || !status.isImpersonating || !status.targetEmail || !status.expiresAt) {
    return null
  }

  return (
    <ImpersonateBanner
      targetEmail={status.targetEmail}
      expiresAt={status.expiresAt}
    />
  )
}
