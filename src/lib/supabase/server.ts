import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
      set(name: string, value: string, options: CookieOptions) {
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
            maxAge: 3600, // ⭐ 强制设置：1小时 = 3600秒（滑动窗口核心）
            // 注意：完全不使用 ...options，避免被 Supabase 的默认值覆盖
          })
        } catch {
          // The `cookies()` may not be available in all environments
        }
      },
      remove(name: string, options: CookieOptions) {
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
