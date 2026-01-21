'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { randomBytes } from 'crypto'

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
  referralCode: z.string().length(8, '推荐码必须是8位').optional().or(z.literal('')),
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
    referralCode: (formData.get('referralCode') as string | undefined) || '',
  }

  // Zod 验证
  const parsed = signupSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const usedReferralCode = parsed.data.referralCode?.trim() || null

  // 验证推荐码（如果提供）
  let referrerId: string | null = null
  if (usedReferralCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: usedReferralCode },
      select: {
        id: true,
        role: true,
        referralCount: true,
        referralLimit: true,
      },
    })

    if (!referrer) {
      return { error: '无效的推荐码' }
    }

    if (!['PRO', 'ULTIMATE'].includes(referrer.role)) {
      return { error: '该推荐码已失效（推荐人非付费用户）' }
    }

    if (referrer.referralCount >= referrer.referralLimit) {
      return { error: '该推荐码已达到使用上限' }
    }

    referrerId = referrer.id
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

    // 1. 更新用户推荐码和用户名
    // 注意：Trigger 会先创建用户，这里用 upsert 兜底
    try {
      await prisma.user.upsert({
        where: { id: authData.user.id },
        create: {
          id: authData.user.id,
          email: parsed.data.email,
          username: parsed.data.username || null,
          referralCode: myReferralCode,
        },
        update: {
          username: parsed.data.username || undefined,
          referralCode: myReferralCode,
        },
      })
      console.log('[Auth] User referralCode updated:', myReferralCode)
    } catch (e) {
      console.error('[Auth] User upsert error:', e)
    }

    // 2. 如果使用了推荐码，创建推荐关系记录
    if (referrerId && usedReferralCode) {
      try {
        await prisma.referral.create({
          data: {
            referrerId: referrerId,
            refereeId: authData.user.id,
            referralCode: usedReferralCode,
            refereeEmail: parsed.data.email,
            status: 'PENDING', // 等待付费
          },
        })
        console.log('[Auth] Referral record created')
      } catch (e) {
        console.error('[Auth] Referral create error:', e)
      }
    }

    // 3. 初始化 UserSettings（Trigger 可能已创建，用 upsert 兜底）
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
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  })

  return dbUser
}
