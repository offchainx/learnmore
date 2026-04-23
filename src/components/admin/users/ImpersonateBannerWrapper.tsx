'use client'

/**
 * Impersonate Banner Wrapper Component
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * 仅在后台布局中挂载，避免全站都带着伪装状态检查。
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ImpersonateBanner } from './ImpersonateBanner'

interface ImpersonationStatus {
  isImpersonating: boolean
  targetEmail?: string
  expiresAt?: string
}

function useImpersonationBannerStatus(): {
  status: ImpersonationStatus
  isLoading: boolean
} {
  const [status, setStatus] = useState<ImpersonationStatus>({ isImpersonating: false })
  const [isLoading, setIsLoading] = useState(true)
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

  const checkStatus = useCallback(
    async (showLoading = false): Promise<ImpersonationStatus> => {
      if (showLoading) setIsLoading(true)

      try {
        const res = await fetch('/api/auth/impersonate/status', { cache: 'no-store' })
        if (!res.ok) {
          return { isImpersonating: false }
        }

        const data: ImpersonationStatus = await res.json()
        if (!isMountedRef.current) return { isImpersonating: false }

        setStatus(data)
        if (!data.isImpersonating) {
          clearScheduledCheck()
        }
        return data
      } catch (error) {
        console.error('Failed to check impersonation status:', error)
        if (isMountedRef.current) setStatus({ isImpersonating: false })
        clearScheduledCheck()
        return { isImpersonating: false }
      } finally {
        if (showLoading && isMountedRef.current) setIsLoading(false)
      }
    },
    [clearScheduledCheck]
  )

  const scheduleExpiryCheck = useCallback(
    (expiresAt?: string) => {
      clearScheduledCheck()
      if (!expiresAt) return

      const expiryTime = new Date(expiresAt).getTime()
      const delay = Math.max(1000, expiryTime - Date.now() + 1000)

      timeoutRef.current = setTimeout(() => {
        void checkStatus(false)
      }, delay)
    },
    [checkStatus, clearScheduledCheck]
  )

  useEffect(() => {
    let disposed = false

    const init = async () => {
      const current = await checkStatus(true)
      if (disposed) return

      if (current.isImpersonating) {
        scheduleExpiryCheck(current.expiresAt)
      }
    }

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') {
        clearScheduledCheck()
        return
      }

      const current = await checkStatus(false)
      if (current.isImpersonating) {
        scheduleExpiryCheck(current.expiresAt)
      }
    }

    void init()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearScheduledCheck()
    }
  }, [checkStatus, clearScheduledCheck, scheduleExpiryCheck])

  return { status, isLoading }
}

export const ImpersonateBannerWrapper: React.FC = () => {
  const { status, isLoading } = useImpersonationBannerStatus()

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
