'use client'

import { useEffect, useState } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // 检测是否为iOS设备
    const userAgent = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(userAgent)

    // 检测是否已经在独立模式下运行
    const standalone = window.matchMedia('(display-mode: standalone)').matches

    // 使用setTimeout避免同步setState
    setTimeout(() => {
      setIsIOS(iosDevice)
      setIsStandalone(standalone)

      // iOS设备显示安装指南 (如果未安装且未拒绝)
      if (iosDevice && !standalone) {
        const dismissed = localStorage.getItem('pwa-install-dismissed-ios')
        if (!dismissed) {
          setTimeout(() => setShowPrompt(true), 5000) // 5秒后显示
        }
      }
    }, 0)

    // 监听beforeinstallprompt事件 (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      // 检查用户是否之前拒绝过安装
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0
      const now = Date.now()
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000

      // 如果超过7天或从未拒绝,显示提示
      if (!dismissed || now - dismissedTime > sevenDaysInMs) {
        setTimeout(() => setShowPrompt(true), 3000) // 3秒后显示
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // 显示安装提示
    await deferredPrompt.prompt()

    // 等待用户响应
    const { outcome } = await deferredPrompt.userChoice

    console.log(`[PWA] User response: ${outcome}`)

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt')
    } else {
      // 记录拒绝时间
      localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    }

    // 清除提示
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    if (isIOS) {
      localStorage.setItem('pwa-install-dismissed-ios', 'true')
    } else {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    }
  }

  // 如果已经安装或不显示提示,不渲染
  if (isStandalone || !showPrompt) {
    return null
  }

  // iOS 安装指南
  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 tablet:left-auto tablet:right-4 tablet:w-96 animate-in slide-in-from-bottom-5">
        <div className="bg-card border border-border rounded-lg shadow-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-sm">添加到主屏幕</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            将 LearnMore 添加到主屏幕,享受类似原生应用的体验
          </p>

          <div className="space-y-2 text-xs text-muted-foreground bg-muted p-3 rounded-md">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-primary">1.</span>
              <span>点击底部的 <span className="font-semibold">分享</span> 按钮</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-primary">2.</span>
              <span>选择 <span className="font-semibold">添加到主屏幕</span></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-primary">3.</span>
              <span>点击 <span className="font-semibold">添加</span></span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Android/Desktop 安装提示
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 tablet:left-auto tablet:right-4 tablet:w-96 animate-in slide-in-from-bottom-5">
      <div className="bg-card border border-border rounded-lg shadow-xl p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">安装 LearnMore</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground"
            aria-label="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          安装应用到您的设备,获得更快的访问速度和离线学习功能
        </p>

        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-1" />
            立即安装
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
          >
            稍后
          </Button>
        </div>
      </div>
    </div>
  )
}
