'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
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
  utmSource: z.string().max(128).optional(),
  utmMedium: z.string().max(128).optional(),
  utmCampaign: z.string().max(128).optional(),
})

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

const DEFAULT_POST_LOGIN_REDIRECT = '/dashboard'

export type AuthFormState = {
  error?: string
}

type UTMData = {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

function sanitizeOptionalString(value: unknown, maxLength: number = 128): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, maxLength)
}

function parseAuthTimestamp(value: string | null | undefined): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function getUtmDataFromFormData(formData: FormData): UTMData {
  return {
    utmSource: sanitizeOptionalString(formData.get('utm_source')),
    utmMedium: sanitizeOptionalString(formData.get('utm_medium')),
    utmCampaign: sanitizeOptionalString(formData.get('utm_campaign')),
  }
}

function getUtmDataFromAuthMetadata(metadata: unknown): UTMData {
  if (!metadata || typeof metadata !== 'object') return {}

  const record = metadata as Record<string, unknown>
  return {
    utmSource: sanitizeOptionalString(record.utm_source),
    utmMedium: sanitizeOptionalString(record.utm_medium),
    utmCampaign: sanitizeOptionalString(record.utm_campaign),
  }
}

function resolvePostLoginRedirect(rawValue: FormDataEntryValue | null): string {
  if (typeof rawValue !== 'string') return DEFAULT_POST_LOGIN_REDIRECT

  const redirectTo = rawValue.trim()
  if (!redirectTo) return DEFAULT_POST_LOGIN_REDIRECT
  if (!redirectTo.startsWith('/')) return DEFAULT_POST_LOGIN_REDIRECT
  if (redirectTo.startsWith('//')) return DEFAULT_POST_LOGIN_REDIRECT
  if (redirectTo.startsWith('/login') || redirectTo.startsWith('/register')) {
    return DEFAULT_POST_LOGIN_REDIRECT
  }

  return redirectTo
}

export async function signupAction(prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const utmData = getUtmDataFromFormData(formData)

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    username: formData.get('username') as string | undefined,
    utmSource: utmData.utmSource,
    utmMedium: utmData.utmMedium,
    utmCampaign: utmData.utmCampaign,
  }

  // Zod 验证
  const parsed = signupSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  // 注册用户 (会自动触发 Auth Trigger 同步到 public.users)
  const signupMetadata: Record<string, string> = {}
  if (parsed.data.username) signupMetadata.username = parsed.data.username
  if (parsed.data.utmSource) signupMetadata.utm_source = parsed.data.utmSource
  if (parsed.data.utmMedium) signupMetadata.utm_medium = parsed.data.utmMedium
  if (parsed.data.utmCampaign) signupMetadata.utm_campaign = parsed.data.utmCampaign

  const { data: authData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: signupMetadata,
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
          utmSource: parsed.data.utmSource || null,
          utmMedium: parsed.data.utmMedium || null,
          utmCampaign: parsed.data.utmCampaign || null,
        },
        update: {
          username: parsed.data.username || undefined,
          referralCode: myReferralCode,
          subscriptionTier: 'STARTER',
          subscriptionStatus: 'CANCELED',
          subscriptionStart: null,
          subscriptionEnd: null,
          cancelAtPeriodEnd: false,
          utmSource: parsed.data.utmSource || undefined,
          utmMedium: parsed.data.utmMedium || undefined,
          utmCampaign: parsed.data.utmCampaign || undefined,
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
          theme: 'dark',
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

  const redirectTo = resolvePostLoginRedirect(formData.get('redirectTo'))
  redirect(redirectTo)
}

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
  revalidatePath('/admin', 'layout')
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

  const authLastSignInAt = parseAuthTimestamp(user.last_sign_in_at)
  const authMetadataUtm = getUtmDataFromAuthMetadata(user.user_metadata)

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
          lastSignInAt: authLastSignInAt,
          signInCount: authLastSignInAt ? 1 : 0,
          utmSource: authMetadataUtm.utmSource || null,
          utmMedium: authMetadataUtm.utmMedium || null,
          utmCampaign: authMetadataUtm.utmCampaign || null,
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
          theme: 'dark',
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

  // 兜底同步：若 auth.last_sign_in_at 比 public.users 新，补写镜像并累计 sign_in_count
  if (
    dbUser &&
    authLastSignInAt &&
    (!dbUser.lastSignInAt || authLastSignInAt > dbUser.lastSignInAt)
  ) {
    try {
      dbUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastSignInAt: authLastSignInAt,
          signInCount: { increment: 1 },
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
    } catch (e) {
      console.warn('[Auth] Failed to sync sign-in mirror fields in getCurrentUser:', e)
    }
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
    const authLastSignInAt = parseAuthTimestamp(user.last_sign_in_at)
    const authMetadataUtm = getUtmDataFromAuthMetadata(user.user_metadata)
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { lastSignInAt: true },
    })

    const shouldIncrementSignIn = Boolean(
      existingUser &&
      authLastSignInAt &&
      (!existingUser.lastSignInAt || authLastSignInAt > existingUser.lastSignInAt)
    )

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
        lastSignInAt: authLastSignInAt,
        signInCount: authLastSignInAt ? 1 : 0,
        utmSource: authMetadataUtm.utmSource || null,
        utmMedium: authMetadataUtm.utmMedium || null,
        utmCampaign: authMetadataUtm.utmCampaign || null,
      },
      update: {
        email: user.email,
        utmSource: authMetadataUtm.utmSource || undefined,
        utmMedium: authMetadataUtm.utmMedium || undefined,
        utmCampaign: authMetadataUtm.utmCampaign || undefined,
        ...(authLastSignInAt
          ? { lastSignInAt: authLastSignInAt }
          : {}),
        ...(shouldIncrementSignIn
          ? { signInCount: { increment: 1 } }
          : {}),
      },
    })

    // 确保 UserSettings 存在
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        language: 'zh',
        theme: 'dark',
      },
      update: {},
    })

    return { success: true, user: dbUser }
  } catch (e) {
    console.error('[Auth] Sync failed:', e)
    return { success: false, error: String(e) }
  }
}
