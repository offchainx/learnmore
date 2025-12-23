/**
 * Polyfills for older browsers
 * 为旧版浏览器提供API补丁
 */

/**
 * IntersectionObserver Polyfill
 * 用于虚拟列表和懒加载功能
 */
export function loadIntersectionObserverPolyfill() {
  if (typeof window === 'undefined') return Promise.resolve()

  if (!('IntersectionObserver' in window)) {
    // @ts-expect-error - intersection-observer doesn't have type declarations
    return import('intersection-observer')
  }

  return Promise.resolve()
}

/**
 * ResizeObserver Polyfill
 * 用于响应式组件
 */
export function loadResizeObserverPolyfill() {
  if (typeof window === 'undefined') return Promise.resolve()

  if (!('ResizeObserver' in window)) {
    return import('@juggle/resize-observer').then((module) => {
      window.ResizeObserver = module.ResizeObserver
    })
  }

  return Promise.resolve()
}

/**
 * Web Share API Polyfill
 * 用于分享功能的降级处理
 */
export function setupWebShareFallback() {
  if (typeof window === 'undefined') return

  if (!('share' in navigator)) {
    // 提供降级分享方案
    ;(navigator as { share?: (data: ShareData) => Promise<void> }).share = async (data: ShareData) => {
      // 复制到剪贴板
      if (data.url && navigator.clipboard) {
        await navigator.clipboard.writeText(data.url)
        return Promise.resolve()
      }

      // 如果没有剪贴板API,抛出错误
      return Promise.reject(new Error('Web Share API not supported'))
    }
  }
}

/**
 * Clipboard API Polyfill
 * 用于复制功能
 */
export function setupClipboardFallback() {
  if (typeof window === 'undefined') return

  if (!navigator.clipboard) {
    // @ts-expect-error - Creating polyfill for clipboard API
    ;(navigator as { clipboard?: Clipboard }).clipboard = {
      writeText: async (text: string) => {
        // 使用旧方法
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()

        try {
          document.execCommand('copy')
          document.body.removeChild(textArea)
          return Promise.resolve()
        } catch (err) {
          document.body.removeChild(textArea)
          return Promise.reject(err)
        }
      },
      readText: async () => {
        return Promise.reject(new Error('Clipboard read not supported'))
      },
    }
  }
}

/**
 * Vibration API Polyfill
 * 用于触觉反馈(如果不支持则静默失败)
 */
export function setupVibrationFallback() {
  if (typeof window === 'undefined') return

  if (!('vibrate' in navigator)) {
    ;(navigator as { vibrate?: (pattern: number | number[]) => boolean }).vibrate = () => false
  }
}

/**
 * requestIdleCallback Polyfill
 * 用于性能优化
 */
export function setupRequestIdleCallbackPolyfill() {
  if (typeof window === 'undefined') return

  if (!('requestIdleCallback' in window)) {
    // @ts-expect-error - Creating polyfill for requestIdleCallback
    ;(window as { requestIdleCallback?: (cb: IdleRequestCallback) => number }).requestIdleCallback = function (cb: IdleRequestCallback) {
      const start = Date.now()
      return setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (Date.now() - start))
          },
        })
      }, 1)
    }

    ;(window as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback = function (id: number) {
      clearTimeout(id)
    }
  }
}

/**
 * 初始化所有Polyfills
 * 在应用启动时调用
 */
export async function initPolyfills() {
  if (typeof window === 'undefined') return

  // 同步polyfills (立即需要)
  setupWebShareFallback()
  setupClipboardFallback()
  setupVibrationFallback()
  setupRequestIdleCallbackPolyfill()

  // 异步polyfills (按需加载)
  await Promise.all([
    loadIntersectionObserverPolyfill(),
    loadResizeObserverPolyfill(),
  ])
}

/**
 * 检测是否需要polyfills
 */
export function needsPolyfills(): boolean {
  if (typeof window === 'undefined') return false

  const checks = [
    !('IntersectionObserver' in window),
    !('ResizeObserver' in window),
    !('share' in navigator),
    !('clipboard' in navigator),
    !('requestIdleCallback' in window),
  ]

  return checks.some(Boolean)
}
