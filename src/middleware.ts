import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'fallback-secret-for-dev'
const jwtSecret = new TextEncoder().encode(JWT_SECRET)

export async function middleware(request: NextRequest) {
  // ── 伪装登录 Token 过期检测 (Story-046 B5) ──────────────────
  // 跳过伪装相关 API 本身（避免无穷重定向）
  const isImpersonateEndpoint = request.nextUrl.pathname.startsWith('/api/auth/impersonate')
  const impersonationToken = request.cookies.get('impersonation_token')?.value

  if (impersonationToken && !isImpersonateEndpoint) {
    // 基本格式校验（JWT 为 header.payload.signature 三段）
    if (impersonationToken.split('.').length !== 3) {
      const res = NextResponse.next()
      res.cookies.set('impersonation_token', '', { maxAge: 0, path: '/' })
      return res
    }

    try {
      await jwtVerify(impersonationToken, jwtSecret, { issuer: 'learnmore-admin' })
      // Token 有效 → 继续后续逻辑
    } catch {
      // Token 过期或签名无效 → 交由退出端点执行审计清理
      const url = new URL('/api/auth/impersonate/end', request.url)
      url.searchParams.set('reason', 'TOKEN_EXPIRED')
      return NextResponse.redirect(url)
    }
  }
  // ── End 伪装检测 ────────────────────────────────────────────
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
          response.cookies.set({
            name,
            value,
            httpOnly: true, // 防止XSS攻击
            secure: process.env.NODE_ENV === 'production', // 生产环境强制HTTPS
            sameSite: 'lax', // CSRF防护
            path: '/', // 全站有效
            maxAge: 3600, // ⭐ 强制设置：1小时 = 3600秒（滑动窗口核心）
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
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
