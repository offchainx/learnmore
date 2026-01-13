import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
    ],
    // 支持的图片格式
    formats: ['image/avif', 'image/webp'],
    // 图片尺寸配置
    deviceSizes: [320, 375, 390, 414, 428, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 最小缓存时间 (60秒)
    minimumCacheTTL: 60,
    // 禁用静态导入优化 (使用动态优化)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },

  // 编译器优化
  compiler: {
    // 生产环境移除 console.log
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // 压缩配置
  compress: true,

  // 实验性功能
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // 优化包导入 - 自动 tree-shaking，减少 bundle 体积
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
    ],
  },

  // PWA 配置 (生产环境)
  ...(process.env.NODE_ENV === 'production' && {
    async headers() {
      return [
        {
          source: '/sw.js',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=0, must-revalidate',
            },
            {
              key: 'Service-Worker-Allowed',
              value: '/',
            },
          ],
        },
        {
          source: '/manifest.json',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ]
    },
  }),
}

export default nextConfig