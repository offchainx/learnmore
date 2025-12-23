// LearnMore PWA Service Worker
// 版本号 - 更新时修改以触发新的Service Worker安装
const CACHE_VERSION = 'v1.0.0'
const CACHE_NAME = `learnmore-${CACHE_VERSION}`

// 需要预缓存的静态资源
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/offline.html',
]

// 缓存策略配置
const CACHE_STRATEGIES = {
  // 静态资源: Cache First (优先使用缓存)
  static: /\.(js|css|woff2?|ttf|eot|ico|png|jpg|jpeg|gif|svg|webp)$/,

  // API请求: Network First (优先使用网络)
  api: /^\/api\//,

  // 页面: Network First with Cache Fallback
  pages: /^\/(?!api\/)/,
}

// Service Worker 安装事件
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', CACHE_VERSION)

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching static resources')
      return cache.addAll(PRECACHE_URLS)
    })
  )

  // 强制激活新的Service Worker
  self.skipWaiting()
})

// Service Worker 激活事件
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', CACHE_VERSION)

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 删除旧版本缓存
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )

  // 立即接管所有页面
  return self.clients.claim()
})

// Fetch 事件 - 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 只处理同源请求
  if (url.origin !== self.location.origin) {
    return
  }

  // 根据请求类型选择缓存策略
  if (CACHE_STRATEGIES.static.test(url.pathname)) {
    // 静态资源: Cache First
    event.respondWith(cacheFirst(request))
  } else if (CACHE_STRATEGIES.api.test(url.pathname)) {
    // API请求: Network Only (不缓存)
    event.respondWith(fetch(request))
  } else {
    // 页面: Network First with Offline Fallback
    event.respondWith(networkFirstWithOffline(request))
  }
})

// 缓存策略: Cache First (优先使用缓存)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    // 缓存成功的响应
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.error('[SW] Fetch failed:', error)
    throw error
  }
}

// 缓存策略: Network First with Offline Fallback
async function networkFirstWithOffline(request) {
  try {
    const networkResponse = await fetch(request)

    // 缓存成功的HTML页面响应
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, trying cache...', error)

    // 尝试从缓存获取
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    // 返回离线页面
    if (request.mode === 'navigate') {
      return caches.match('/offline.html')
    }

    throw error
  }
}

// 后台同步事件 (未来可用于离线表单提交等)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'sync-learning-progress') {
    event.waitUntil(syncLearningProgress())
  }
})

// 同步学习进度 (示例)
async function syncLearningProgress() {
  // TODO: 实现离线学习进度同步逻辑
  console.log('[SW] Syncing learning progress...')
}

// 推送通知事件
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')

  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
      },
      {
        action: 'close',
        title: '关闭',
      },
    ],
  }

  event.waitUntil(
    self.registration.showNotification('LearnMore', options)
  )
})

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action)

  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

console.log('[SW] Service Worker loaded:', CACHE_VERSION)
