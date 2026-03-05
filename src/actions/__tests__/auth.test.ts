import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockSignInWithPassword, mockSignOut, mockRedirect, mockRevalidatePath } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignOut: vi.fn(),
  mockRedirect: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
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
    userSettings: {
      upsert: vi.fn(),
      create: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}))

vi.mock('../notification/triggers', () => ({
  triggerWelcomeNotification: vi.fn(),
}))

import { loginAction, logoutAction } from '../user/auth'

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
})
