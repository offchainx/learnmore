'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { isUnsupportedBrowser, getBrowserInfo } from '@/lib/browser-compatibility'

export function UnsupportedBrowserWarning() {
  const [show, setShow] = useState(false)
  const [browserInfo, setBrowserInfo] = useState<ReturnType<typeof getBrowserInfo> | null>(null)

  useEffect(() => {
    const checkBrowser = () => {
      const unsupported = isUnsupportedBrowser()
      const dismissed = localStorage.getItem('browser-warning-dismissed')

      if (unsupported && !dismissed) {
        setShow(true)
        setBrowserInfo(getBrowserInfo())
      }
    }

    // 延迟执行以避免在effect中同步setState
    setTimeout(checkBrowser, 0)
  }, [])

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('browser-warning-dismissed', 'true')
  }

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground p-4 shadow-lg">
      <div className="container mx-auto flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">浏览器版本过低</h3>
          <p className="text-sm opacity-90 mb-2">
            您当前使用的 {browserInfo?.name} {browserInfo?.version} 版本过低,
            部分功能可能无法正常使用。
          </p>
          <div className="text-sm opacity-90">
            <p className="font-medium mb-1">推荐浏览器:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Chrome / Edge 90+</li>
              <li>Safari 15+</li>
              <li>Firefox 88+</li>
            </ul>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-destructive-foreground hover:opacity-80 transition-opacity"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
