import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { INTERNAL_AUTH_USER_ID_HEADER } from '@/lib/auth/request-context'

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'fallback-secret-for-dev'
const jwtSecret = new TextEncoder().encode(JWT_SECRET)
const DEFAULT_POST_LOGIN_REDIRECT = '/dashboard'

async function safeGetSupabaseUser(
  request: NextRequest,
  supabase: ReturnType<typeof createServerClient>
) {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      // AuthSessionMissingError 对游客是正常情况，不需要刷开发日志。
      if (error.name !== 'AuthSessionMissingError' && process.env.NODE_ENV !== 'production') {
        console.warn(
          `[proxy] Failed to resolve Supabase user for ${request.nextUrl.pathname}: ${error.message}`
        )
      }
      return null
    }

    return user ?? null
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(
        `[proxy] Supabase auth fetch failed for ${request.nextUrl.pathname}; continuing as guest. ${message}`
      )
    }
    return null
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const requestHeaders = new Headers(request.headers)

  const isProtectedRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
  const isAuthPage = pathname === '/login' || pathname === '/register'

  const getSafeRedirectTarget = (rawValue: string | null): string => {
    if (!rawValue) return DEFAULT_POST_LOGIN_REDIRECT

    const redirectTo = rawValue.trim()
    if (!redirectTo) return DEFAULT_POST_LOGIN_REDIRECT
    if (!redirectTo.startsWith('/')) return DEFAULT_POST_LOGIN_REDIRECT
    if (redirectTo.startsWith('//')) return DEFAULT_POST_LOGIN_REDIRECT
    if (redirectTo.startsWith('/login') || redirectTo.startsWith('/register')) {
      return DEFAULT_POST_LOGIN_REDIRECT
    }

    return redirectTo
  }

  // ── 伪装登录 Token 过期检测 (Story-046 B5) ──────────────────
  // 跳过伪装相关 API 本身（避免无穷重定向）
  const isImpersonateEndpoint = pathname.startsWith('/api/auth/impersonate')
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
  const pendingCookieSets: Array<{
    name: string
    value: string
    options?: CookieOptions
  }> = []
  const pendingCookieRemoves: Array<{
    name: string
    options?: CookieOptions
  }> = []

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
          // ⭐ 关键：实现1小时滑动窗口机制（延迟到最终 response 统一写入）
          pendingCookieSets.push({
            name,
            value,
            options: {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 3600,
            },
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          pendingCookieRemoves.push({
            name,
            options: {
              ...options,
              maxAge: 0,
            },
          })
        },
      },
    }
  )

  const user = await safeGetSupabaseUser(request, supabase)

  if (user?.id) {
    requestHeaders.set(INTERNAL_AUTH_USER_ID_HEADER, user.id)
  } else {
    requestHeaders.delete(INTERNAL_AUTH_USER_ID_HEADER)
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  pendingCookieSets.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })
  pendingCookieRemoves.forEach(({ name, options }) => {
    response.cookies.set(name, '', options)
  })

  // 1. Auth Guard: protect dashboard/admin routes
  if (!user && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url)
    const redirectTo = `${pathname}${request.nextUrl.search}`
    loginUrl.searchParams.set('redirectTo', redirectTo)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Guest Guard: redirect logged-in users away from auth pages
  if (user && isAuthPage) {
    const redirectTo = getSafeRedirectTarget(request.nextUrl.searchParams.get('redirectTo'))
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
