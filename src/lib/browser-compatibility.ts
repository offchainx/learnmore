/**
 * 浏览器兼容性检测工具
 * 检测用户浏览器是否支持应用所需的关键功能
 */

export interface BrowserCapabilities {
  serviceWorker: boolean
  pushNotifications: boolean
  indexedDB: boolean
  webGL: boolean
  vibration: boolean
  geolocation: boolean
  localStorage: boolean
  sessionStorage: boolean
  webAssembly: boolean
  intersectionObserver: boolean
  resizeObserver: boolean
  webShare: boolean
  clipboard: boolean
  touchEvents: boolean
  pointerEvents: boolean
}

/**
 * 检测所有浏览器能力
 */
export function detectBrowserCapabilities(): BrowserCapabilities {
  if (typeof window === 'undefined') {
    return {
      serviceWorker: false,
      pushNotifications: false,
      indexedDB: false,
      webGL: false,
      vibration: false,
      geolocation: false,
      localStorage: false,
      sessionStorage: false,
      webAssembly: false,
      intersectionObserver: false,
      resizeObserver: false,
      webShare: false,
      clipboard: false,
      touchEvents: false,
      pointerEvents: false,
    }
  }

  return {
    serviceWorker: 'serviceWorker' in navigator,
    pushNotifications: 'Notification' in window && 'PushManager' in window,
    indexedDB: 'indexedDB' in window,
    webGL: checkWebGLSupport(),
    vibration: 'vibrate' in navigator,
    geolocation: 'geolocation' in navigator,
    localStorage: checkStorageSupport('localStorage'),
    sessionStorage: checkStorageSupport('sessionStorage'),
    webAssembly: typeof WebAssembly === 'object',
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window,
    webShare: 'share' in navigator,
    clipboard: 'clipboard' in navigator,
    touchEvents: 'ontouchstart' in window,
    pointerEvents: 'onpointerdown' in window,
  }
}

/**
 * 检测 WebGL 支持
 */
function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

/**
 * 检测 Storage API 支持
 */
function checkStorageSupport(type: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const storage = window[type]
    const testKey = '__storage_test__'
    storage.setItem(testKey, 'test')
    storage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * 获取浏览器信息
 */
export interface BrowserInfo {
  name: string
  version: string
  os: string
  isMobile: boolean
  isIOS: boolean
  isAndroid: boolean
  isChrome: boolean
  isSafari: boolean
  isFirefox: boolean
  isEdge: boolean
  isWeChat: boolean
}

export function getBrowserInfo(): BrowserInfo {
  if (typeof window === 'undefined') {
    return {
      name: 'Unknown',
      version: '0',
      os: 'Unknown',
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isChrome: false,
      isSafari: false,
      isFirefox: false,
      isEdge: false,
      isWeChat: false,
    }
  }

  const ua = navigator.userAgent
  const uaLower = ua.toLowerCase()

  // 操作系统检测
  const isIOS = /iphone|ipad|ipod/.test(uaLower)
  const isAndroid = /android/.test(uaLower)
  const isMobile = isIOS || isAndroid || /mobile/.test(uaLower)

  // 浏览器检测
  const isChrome = /chrome|crios/.test(uaLower) && !/edge|edg/.test(uaLower)
  const isSafari = /safari/.test(uaLower) && !isChrome
  const isFirefox = /firefox|fxios/.test(uaLower)
  const isEdge = /edge|edg/.test(uaLower)
  const isWeChat = /micromessenger/.test(uaLower)

  // 浏览器名称和版本
  let name = 'Unknown'
  let version = '0'

  if (isWeChat) {
    name = 'WeChat'
    const match = ua.match(/MicroMessenger\/([0-9.]+)/)
    version = match ? match[1] : '0'
  } else if (isEdge) {
    name = 'Edge'
    const match = ua.match(/Edg\/([0-9.]+)/)
    version = match ? match[1] : '0'
  } else if (isChrome) {
    name = 'Chrome'
    const match = ua.match(/Chrome\/([0-9.]+)/)
    version = match ? match[1] : '0'
  } else if (isSafari) {
    name = 'Safari'
    const match = ua.match(/Version\/([0-9.]+)/)
    version = match ? match[1] : '0'
  } else if (isFirefox) {
    name = 'Firefox'
    const match = ua.match(/Firefox\/([0-9.]+)/)
    version = match ? match[1] : '0'
  }

  // 操作系统
  let os = 'Unknown'
  if (isIOS) os = 'iOS'
  else if (isAndroid) os = 'Android'
  else if (uaLower.includes('mac')) os = 'macOS'
  else if (uaLower.includes('win')) os = 'Windows'
  else if (uaLower.includes('linux')) os = 'Linux'

  return {
    name,
    version,
    os,
    isMobile,
    isIOS,
    isAndroid,
    isChrome,
    isSafari,
    isFirefox,
    isEdge,
    isWeChat,
  }
}

/**
 * 检查是否为不支持的浏览器
 */
export function isUnsupportedBrowser(): boolean {
  const browserInfo = getBrowserInfo()
  const capabilities = detectBrowserCapabilities()

  // 必需功能检查
  const requiredFeatures = [
    capabilities.localStorage,
    capabilities.sessionStorage,
    capabilities.intersectionObserver,
  ]

  if (requiredFeatures.some(feature => !feature)) {
    return true
  }

  // 浏览器版本检查
  const version = parseInt(browserInfo.version)

  if (browserInfo.isChrome && version < 90) return true
  if (browserInfo.isSafari && version < 15) return true
  if (browserInfo.isFirefox && version < 88) return true
  if (browserInfo.isEdge && version < 90) return true

  return false
}

/**
 * 生成兼容性报告
 */
export function generateCompatibilityReport(): string {
  const browserInfo = getBrowserInfo()
  const capabilities = detectBrowserCapabilities()

  const lines = [
    '# 浏览器兼容性报告',
    '',
    '## 浏览器信息',
    `- 名称: ${browserInfo.name} ${browserInfo.version}`,
    `- 操作系统: ${browserInfo.os}`,
    `- 设备类型: ${browserInfo.isMobile ? '移动端' : '桌面端'}`,
    '',
    '## 功能支持',
  ]

  const features = [
    { name: 'Service Worker', supported: capabilities.serviceWorker, required: false },
    { name: 'Push Notifications', supported: capabilities.pushNotifications, required: false },
    { name: 'IndexedDB', supported: capabilities.indexedDB, required: false },
    { name: 'WebGL', supported: capabilities.webGL, required: false },
    { name: 'Vibration API', supported: capabilities.vibration, required: false },
    { name: 'Geolocation', supported: capabilities.geolocation, required: false },
    { name: 'LocalStorage', supported: capabilities.localStorage, required: true },
    { name: 'SessionStorage', supported: capabilities.sessionStorage, required: true },
    { name: 'WebAssembly', supported: capabilities.webAssembly, required: false },
    { name: 'IntersectionObserver', supported: capabilities.intersectionObserver, required: true },
    { name: 'ResizeObserver', supported: capabilities.resizeObserver, required: false },
    { name: 'Web Share API', supported: capabilities.webShare, required: false },
    { name: 'Clipboard API', supported: capabilities.clipboard, required: false },
    { name: 'Touch Events', supported: capabilities.touchEvents, required: false },
    { name: 'Pointer Events', supported: capabilities.pointerEvents, required: false },
  ]

  features.forEach(feature => {
    const icon = feature.supported ? '✅' : '❌'
    const required = feature.required ? ' (必需)' : ''
    lines.push(`- ${icon} ${feature.name}${required}`)
  })

  return lines.join('\n')
}
