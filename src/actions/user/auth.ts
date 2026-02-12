'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { triggerWelcomeNotification } from '../notification/triggers'

function isPrismaConnectivityError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const asRecord = error as { name?: string; message?: string }
  const name = (asRecord.name || '').toLowerCase()
  const message = (asRecord.message || '').toLowerCase()

  return (
    name.includes('prismaclientinitializationerror') ||
    message.includes('authentication failed against database server') ||
    message.includes("can't reach database server") ||
    message.includes('provided database credentials') ||
    message.includes('database server at the configured address')
  )
}

function isPrismaSchemaMismatchError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const asRecord = error as { name?: string; message?: string; code?: string }
  const name = (asRecord.name || '').toLowerCase()
  const message = (asRecord.message || '').toLowerCase()
  const code = (asRecord.code || '').toUpperCase()

  return (
    name.includes('prismaclientknownrequesterror') &&
    (
      code === 'P2021' || // table does not exist
      code === 'P2022' || // column does not exist
      message.includes('does not exist') ||
      message.includes('the column') ||
      message.includes('the table')
    )
  )
}

// 生成推荐码（8位，大写字母+数字）
function generateReferralCode(): string {
  // 使用 crypto.randomBytes 生成随机字节，转为 base64，提取字母数字字符
  const bytes = randomBytes(8)
  const base64 = bytes.toString('base64')
  // 过滤只保留大写字母和数字，补足8位
  const alphanumeric = base64.toUpperCase().replace(/[^A-Z0-9]/g, '')
  return alphanumeric.slice(0, 8).padEnd(8, '0')
}

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
    // 生成用户自己的推荐码
    const myReferralCode = generateReferralCode()

    // 1. 更新用户推荐码和用户名，并设置默认 Starter 状态
    // 注意：Trigger 会先创建用户，这里用 upsert 兜底
    try {
      await prisma.user.upsert({
        where: { id: authData.user.id },
        create: {
          id: authData.user.id,
          email: parsed.data.email,
          username: parsed.data.username || null,
          referralCode: myReferralCode,
          subscriptionTier: 'STARTER',
          subscriptionStatus: 'CANCELED',
          subscriptionStart: null,
          subscriptionEnd: null,
          cancelAtPeriodEnd: false,
        },
        update: {
          username: parsed.data.username || undefined,
          referralCode: myReferralCode,
          subscriptionTier: 'STARTER',
          subscriptionStatus: 'CANCELED',
          subscriptionStart: null,
          subscriptionEnd: null,
          cancelAtPeriodEnd: false,
        },
      })
      console.log('[Auth] User initialized with STARTER tier')
    } catch (e) {
      console.error('[Auth] User upsert error:', e)
    }

    // 2. 初始化 UserSettings（Trigger 可能已创建，用 upsert 兜底）
    try {
      await prisma.userSettings.upsert({
        where: { userId: authData.user.id },
        create: {
          userId: authData.user.id,
          language: 'zh',
          theme: 'light',
        },
        update: {
          // 不覆盖已有设置
        },
      })
    } catch (e) {
      console.error('[Auth] UserSettings upsert error:', e)
    }

    // 3. 触发欢迎通知和邮件
    try {
      await triggerWelcomeNotification(authData.user.id, parsed.data.email, parsed.data.username || undefined);
    } catch (e) {
      console.error('[Auth] Welcome notification trigger error:', e)
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

  // 清除所有相关路径的缓存
  revalidatePath('/', 'layout')
  revalidatePath('/dashboard', 'layout')
  revalidatePath('/login', 'layout')

  // 重定向到 Landing Page,这样用户可以看到 "Login" 按钮
  redirect('/')
}

// 获取当前用户
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // 从 public.users 获取完整用户信息
  let dbUser = null
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        permissionOverrides: {
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          }
        }
      }
    })
  } catch (error) {
    if (isPrismaConnectivityError(error)) {
      console.warn('[Auth] Database unavailable in getCurrentUser; returning null.')
      return null
    }

    if (isPrismaSchemaMismatchError(error)) {
      console.warn('[Auth] Database schema mismatch in getCurrentUser; returning null.')
      return null
    }

    throw error
  }

  // 如果数据库中没有用户记录，自动同步创建
  if (!dbUser && user.email) {
    console.warn(`[Auth] User ${user.id} not found in database, auto-syncing...`)
    try {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username || user.email.split('@')[0],
          referralCode: generateReferralCode(),
          subscriptionTier: 'STARTER',
          subscriptionStatus: 'CANCELED',
          subscriptionStart: null,
          subscriptionEnd: null,
          cancelAtPeriodEnd: false,
        },
        include: {
          permissionOverrides: {
            where: {
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ]
            }
          }
        }
      })
      // 同时创建 UserSettings
      await prisma.userSettings.create({
        data: {
          userId: user.id,
          language: 'zh',
          theme: 'light',
        },
      })
      console.warn(`[Auth] User ${user.id} synced successfully with STARTER`)
    } catch (e) {
      if (isPrismaConnectivityError(e)) {
        console.warn('[Auth] Database unavailable while auto-sync user.')
        return null
      }
      if (isPrismaSchemaMismatchError(e)) {
        console.warn('[Auth] Database schema mismatch while auto-sync user.')
        return null
      }
      console.error('[Auth] Failed to sync user:', e)
    }
  }

  // 封禁用户视同未登录——受保护路由和 Server Action 会自动拒绝
  if (dbUser && dbUser.status === 'BANNED') {
    console.warn(`[Auth] User ${dbUser.id} is BANNED, treating as unauthenticated`)
    return null
  }

  return dbUser
}

/**
 * 手动同步 Supabase Auth 用户到 public.users 表
 * 用于修复 Account Sync Issue
 */
export async function syncCurrentUserToDatabase() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return { success: false, error: 'No authenticated user found' }
  }

  try {
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || user.email.split('@')[0],
        referralCode: generateReferralCode(),
        subscriptionTier: 'STARTER',
        subscriptionStatus: 'CANCELED',
        subscriptionStart: null,
        subscriptionEnd: null,
        cancelAtPeriodEnd: false,
      },
      update: {
        email: user.email,
      },
    })

    // 确保 UserSettings 存在
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        language: 'zh',
        theme: 'light',
      },
      update: {},
    })

    return { success: true, user: dbUser }
  } catch (e) {
    console.error('[Auth] Sync failed:', e)
    return { success: false, error: String(e) }
  }
}
