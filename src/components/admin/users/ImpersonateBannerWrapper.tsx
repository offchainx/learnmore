'use client'

/**
 * Impersonate Banner Wrapper Component
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * 全局伪装登录警告条包装组件
 * 用于在 layout 层条件渲染
 */

import React, { useState, useEffect } from 'react'
import { ImpersonateBanner } from './ImpersonateBanner'

interface ImpersonationStatus {
  isImpersonating: boolean
  targetEmail?: string
  expiresAt?: string
}

export const ImpersonateBannerWrapper: React.FC = () => {
  const [status, setStatus] = useState<ImpersonationStatus>({ isImpersonating: false })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/auth/impersonate/status')
        if (res.ok) {
          const data = await res.json()
          setStatus(data)
        }
      } catch (error) {
        console.error('Failed to check impersonation status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()

    // 定期检查状态（每 30 秒）
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

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
