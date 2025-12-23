'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'

export function ServiceWorkerRegistration() {
  const { toast } = useToast()
  const [, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // 定期检查更新 (每小时)
  const checkForUpdates = (reg: ServiceWorkerRegistration) => {
    setInterval(() => {
      reg.update()
      console.log('[PWA] Checking for updates...')
    }, 60 * 60 * 1000) // 1 hour
  }

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      console.log('[PWA] Service Worker registered:', reg)
      setRegistration(reg)

      // 监听Service Worker更新
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 有新版本可用
              toast({
                title: '应用更新可用',
                description: '点击刷新以使用最新版本',
                action: (
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md"
                  >
                    刷新
                  </button>
                ),
                duration: 10000,
              })
            }
          })
        }
      })

      // 监听Service Worker控制变化
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Controller changed, reloading page')
        window.location.reload()
      })

      // 检查更新
      checkForUpdates(reg)
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error)
    }
  }

  useEffect(() => {
    // 只在生产环境且支持Service Worker时注册
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      registerServiceWorker()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // registerServiceWorker在组件生命周期内稳定,不需要添加到依赖

  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => {
      toast({
        title: '网络已连接',
        description: '您现在可以正常使用所有功能',
        variant: 'default',
      })
    }

    const handleOffline = () => {
      toast({
        title: '网络已断开',
        description: '您仍可以访问已缓存的内容',
        variant: 'destructive',
        duration: 5000,
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [toast])

  return null // 此组件不渲染任何UI
}
