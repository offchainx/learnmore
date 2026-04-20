import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

type ServerClientOptions = {
  cookieMaxAgeSeconds?: number
}

export async function createClient(options: ServerClientOptions = {}) {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const cookieMaxAgeSeconds = options.cookieMaxAgeSeconds ?? 3600

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required for server client'
    )
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set(name: string, value: string, _options: CookieOptions) {
        try {
          // ⭐ 关键：实现1小时滑动窗口机制
          // 完全不使用 Supabase 的 maxAge (400天)，强制设置为1小时
          cookieStore.set({
            name,
            value,
            httpOnly: true, // 防止XSS攻击
            secure: process.env.NODE_ENV === 'production', // 生产环境强制HTTPS
            sameSite: 'lax', // CSRF防护
            path: '/', // 全站有效
            maxAge: cookieMaxAgeSeconds, // 可根据 remember me 调整会话时长
            // 注意：完全不使用 ...options，避免被 Supabase 的默认值覆盖
          })
        } catch {
          // The `cookies()` may not be available in all environments
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      remove(name: string, _options: CookieOptions) {
        try {
          cookieStore.set({
            name,
            value: '',
            path: '/',
            maxAge: 0, // 立即过期
          })
          cookieStore.delete(name)
        } catch (error) {
          console.error(`[Supabase] Error removing cookie ${name}:`, error)
          // The `cookies()` may not be available in all environments
        }
      },
    },
  })
}
