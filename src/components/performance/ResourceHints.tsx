/**
 * Resource Hints 组件
 * 使用 Link 标签提供资源提示,优化加载性能
 *
 * 资源提示类型:
 * - dns-prefetch: DNS预解析
 * - preconnect: 预连接 (DNS + TCP + TLS)
 * - prefetch: 预获取 (低优先级)
 * - preload: 预加载 (高优先级)
 */

export function ResourceHints() {
  return (
    <>
      {/* DNS 预解析 - 第三方域名 */}
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
      <link rel="dns-prefetch" href="https://i.pravatar.cc" />
      <link rel="dns-prefetch" href="https://cdn-icons-png.flaticon.com" />

      {/* 预连接 - API服务器 (如果使用外部API) */}
      {process.env.NEXT_PUBLIC_API_URL && (
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL}
          crossOrigin="anonymous"
        />
      )}

      {/* 预加载关键资源 */}
      <link
        rel="preload"
        href="/manifest.json"
        as="fetch"
        crossOrigin="anonymous"
      />

      {/* 预获取下一页可能需要的资源 */}
      <link rel="prefetch" href="/dashboard" as="document" />
      <link rel="prefetch" href="/courses" as="document" />
    </>
  )
}

/**
 * 使用方式:
 *
 * 在 app/layout.tsx 中添加:
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <ResourceHints />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   )
 * }
 *
 * 或者使用 Next.js Metadata API (推荐):
 *
 * export const metadata = {
 *   other: {
 *     'dns-prefetch': 'https://images.unsplash.com',
 *     'preconnect': 'https://api.example.com',
 *   }
 * }
 */
