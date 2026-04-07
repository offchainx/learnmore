import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockSignInWithPassword, mockSignOut, mockSignUp, mockRedirect, mockRevalidatePath } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignOut: vi.fn(),
  mockSignUp: vi.fn(),
  mockRedirect: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

const {
  mockLookupReferrerByReferralCode,
  mockRecordReferralAttributionEvent,
  mockInvalidateReferralReadViews,
} = vi.hoisted(() => ({
  mockLookupReferrerByReferralCode: vi.fn(),
  mockRecordReferralAttributionEvent: vi.fn(),
  mockInvalidateReferralReadViews: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      signUp: mockSignUp,
    },
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    referral: {
      create: vi.fn(),
    },
    userSettings: {
      upsert: vi.fn(),
      create: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}))

vi.mock('@/lib/referrals/attribution', () => ({
  lookupReferrerByReferralCode: mockLookupReferrerByReferralCode,
  normalizeReferralCode: (value: string | null | undefined) =>
    value?.trim().toUpperCase() || null,
  recordReferralAttributionEvent: mockRecordReferralAttributionEvent,
}))

vi.mock('@/lib/referrals/cache', () => ({
  invalidateReferralReadViews: mockInvalidateReferralReadViews,
}))

vi.mock('../notification/triggers', () => ({
  triggerWelcomeNotification: vi.fn(),
}))

vi.mock('@/lib/cache/sitewide', () => ({
  invalidateAdminDashboardOverview: vi.fn(),
}))

import { loginAction, logoutAction, signupAction } from '../user/auth'

function buildLoginFormData(overrides?: Partial<{ email: string; password: string; redirectTo: string }>) {
  const formData = new FormData()
  formData.set('email', overrides?.email ?? 'test@example.com')
  formData.set('password', overrides?.password ?? 'password123')
  if (overrides?.redirectTo !== undefined) {
    formData.set('redirectTo', overrides.redirectTo)
  }
  return formData
}

describe('auth actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignInWithPassword.mockResolvedValue({ error: null })
    mockSignOut.mockResolvedValue({ error: null })
    mockSignUp.mockResolvedValue({ data: { user: null }, error: null })
    mockLookupReferrerByReferralCode.mockResolvedValue(null)
    mockRecordReferralAttributionEvent.mockResolvedValue(null)
    mockInvalidateReferralReadViews.mockReturnValue(undefined)
  })

  describe('loginAction', () => {
    it('登录成功时应跳转到合法 redirectTo', async () => {
      const formData = buildLoginFormData({ redirectTo: '/dashboard/practice' })
      const result = await loginAction({}, formData)

      expect(result).toBeUndefined()
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard/practice')
    })

    it('非法 redirectTo 应回退到 /dashboard', async () => {
      const invalidRedirectTargets = [
        'https://evil.example',
        '//evil.example',
        '/login?redirectTo=/admin',
        '/register',
        'javascript:alert(1)',
        '',
      ]

      for (const redirectTo of invalidRedirectTargets) {
        await loginAction({}, buildLoginFormData({ redirectTo }))
      }

      expect(mockRedirect).toHaveBeenCalledTimes(invalidRedirectTargets.length)
      for (const call of mockRedirect.mock.calls) {
        expect(call[0]).toBe('/dashboard')
      }
    })

    it('校验失败时返回表单错误，不触发登录请求', async () => {
      const formData = buildLoginFormData({ email: 'not-an-email' })
      const result = await loginAction({}, formData)

      expect(result).toEqual({ error: '请输入有效的邮箱地址' })
      expect(mockSignInWithPassword).not.toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })

    it('账号密码错误时返回统一错误文案', async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        error: { message: 'Invalid login credentials' },
      })

      const result = await loginAction({}, buildLoginFormData())

      expect(result).toEqual({ error: '邮箱或密码错误' })
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('logoutAction', () => {
    it('登出成功后应清理缓存并跳转首页', async () => {
      await logoutAction()

      expect(mockSignOut).toHaveBeenCalledTimes(1)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'layout')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard', 'layout')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin', 'layout')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/login', 'layout')
      expect(mockRedirect).toHaveBeenCalledWith('/')
    })

    it('登出接口失败也必须跳转首页（幂等）', async () => {
      mockSignOut.mockResolvedValueOnce({
        error: { message: 'session already expired' },
      })

      await logoutAction()

      expect(mockSignOut).toHaveBeenCalledTimes(1)
      expect(mockRedirect).toHaveBeenCalledWith('/')
    })
  })

  describe('signupAction', () => {
    function buildSignupFormData(overrides?: Partial<{
      email: string
      password: string
      username: string
      referralCode: string
      utm_source: string
      utm_medium: string
      utm_campaign: string
    }>) {
      const formData = new FormData()
      formData.set('email', overrides?.email ?? 'student@example.com')
      formData.set('password', overrides?.password ?? 'password123')
      formData.set('username', overrides?.username ?? 'Student')
      if (overrides?.referralCode !== undefined) {
        formData.set('referralCode', overrides.referralCode)
      }
      if (overrides?.utm_source !== undefined) {
        formData.set('utm_source', overrides.utm_source)
      }
      if (overrides?.utm_medium !== undefined) {
        formData.set('utm_medium', overrides.utm_medium)
      }
      if (overrides?.utm_campaign !== undefined) {
        formData.set('utm_campaign', overrides.utm_campaign)
      }
      return formData
    }

    it('注册时携带有效推荐码应完成绑定并跳转', async () => {
      mockLookupReferrerByReferralCode.mockResolvedValueOnce({
        id: 'referrer-1',
        referralCode: 'ABCDEFGH',
      })
      mockSignUp.mockResolvedValueOnce({
        data: { user: { id: 'student-1' } },
        error: null,
      })

      const prisma = (await import('@/lib/prisma')).default as any
      prisma.user.upsert.mockResolvedValueOnce({})
      prisma.userSettings.upsert.mockResolvedValueOnce({})
      prisma.referral.create.mockResolvedValueOnce({ id: 'referral-1' })

      const result = await signupAction({}, buildSignupFormData({ referralCode: 'abcdefgh' }))

      expect(result).toBeUndefined()
      expect(mockLookupReferrerByReferralCode).toHaveBeenCalledWith('ABCDEFGH')
      expect(mockSignUp).toHaveBeenCalledTimes(1)
      expect(prisma.user.upsert).toHaveBeenCalledTimes(1)
      expect(prisma.referral.create).toHaveBeenCalledTimes(1)
      expect(mockRecordReferralAttributionEvent).toHaveBeenCalled()
      expect(mockInvalidateReferralReadViews).toHaveBeenCalledWith({
        userId: 'student-1',
        relatedUserId: 'referrer-1',
      })
      expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
    })

    it('无效推荐码应阻止注册并返回错误', async () => {
      mockLookupReferrerByReferralCode.mockResolvedValueOnce(null)

      const prisma = (await import('@/lib/prisma')).default as any
      prisma.user.upsert.mockResolvedValueOnce({})
      prisma.userSettings.upsert.mockResolvedValueOnce({})

      const result = await signupAction({}, buildSignupFormData({ referralCode: 'ABCDEFGH' }))

      expect(result).toEqual({ error: '推荐码不存在，请确认后重试' })
      expect(prisma.user.upsert).not.toHaveBeenCalled()
      expect(mockSignUp).not.toHaveBeenCalled()
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })
})
