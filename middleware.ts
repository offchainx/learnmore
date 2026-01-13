import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          // ⭐ 关键：实现1小时滑动窗口机制
          // 完全不使用 Supabase 的 maxAge/expires，直接设置我们自己的配置
          response.cookies.set({
            name,
            value,
            httpOnly: true, // 防止XSS攻击
            secure: process.env.NODE_ENV === 'production', // 生产环境强制HTTPS
            sameSite: 'lax', // CSRF防护
            path: '/', // 全站有效
            maxAge: 3600, // ⭐ 强制设置：1小时 = 3600秒（滑动窗口核心）
            // 注意：完全不使用 ...options，避免被 Supabase 的默认值覆盖
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0, // 立即过期
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Auth Guard: Protect dashboard routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    // 记录用户原始访问路径，登录后可回跳
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Guest Guard: Redirect logged-in users away from auth pages
  if (
    user &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     * - 公开的静态资源 (*.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
