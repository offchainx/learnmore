'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const signupSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  username: z.string().min(2, '用户名至少2位').optional(),
})

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

export type AuthFormState = {
  error?: string
}

export async function signupAction(prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    username: formData.get('username') as string | undefined,
  }

  // Zod 验证
  const parsed = signupSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  // 注册用户 (会自动触发 Auth Trigger 同步到 public.users)
  const { data: authData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        username: parsed.data.username,
      },
    },
  })

  if (error) {
    console.error('[Auth] Signup Error:', error)
    return { error: error.message }
  }

  if (authData.user) {
    // 这里的逻辑主要是为了兜底，防止 Trigger 失败或者延迟
    // 同时也为了初始化 UserSettings
    try {
      // 1. 尝试更新 username (如果 trigger 没有处理 meta_data)
      if (parsed.data.username) {
         // 等待一小段时间确保 Trigger 执行完成 (可选，但在 Server Action 中可能不需要，直接 upsert 更安全)
         // 使用 upsert 确保 public.users 存在
         await prisma.user.upsert({
            where: { id: authData.user.id },
            create: {
                id: authData.user.id,
                email: parsed.data.email,
                username: parsed.data.username,
            },
            update: {
                username: parsed.data.username
            }
         })
      }

      // 2. 初始化 UserSettings
      await prisma.userSettings.create({
        data: {
          userId: authData.user.id,
          language: 'zh', // Default to Chinese as per context
          theme: 'light',
        }
      })
    } catch (e) {
      console.error('[Auth] Post-Signup Init Error:', e)
      // 不阻断流程，让用户可以登录
    }
  }

  redirect('/dashboard')
}

export async function loginAction(prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    console.error('[Auth] Login Error:', error)
    return { error: '邮箱或密码错误' }
  }

  redirect('/dashboard')
}

import { revalidatePath } from 'next/cache'

// ... (imports)

export async function logoutAction() {
  const supabase = await createClient()

  // Sign out from Supabase (clears auth cookies)
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('[Auth] Logout Error:', error)
    // Continue anyway to ensure redirect happens
  }

  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'layout')

  // Redirect to login page to ensure clean state
  redirect('/login')
}

// 获取当前用户
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // 从 public.users 获取完整用户信息
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  return dbUser
}
