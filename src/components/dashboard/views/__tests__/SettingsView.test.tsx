import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  replaceMock,
  pushMock,
  useSearchParamsMock,
  getNotificationPreferencesMock,
} = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  pushMock: vi.fn(),
  useSearchParamsMock: vi.fn(),
  getNotificationPreferencesMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard/settings',
  useSearchParams: useSearchParamsMock,
}))

vi.mock('@/providers', () => ({
  useApp: () => ({
    lang: 'zh',
    theme: 'system',
    setLang: vi.fn(),
    setThemePreference: vi.fn(),
    t: {
      settings: {
        tabs: {
          profile: '个人资料',
          aiConfig: 'AI 配置',
          notifications: '通知偏好',
          account: '账户',
          subscription: '订阅',
        },
        profile: {
          displayName: '显示名称',
        },
        ai: {
          difficulty: '难度校准',
          desc: '根据你的学习表现动态调整导师风格与难度。',
        },
      },
    },
  }),
}))

vi.mock('@/lib/hooks/useHandleAvailability', () => ({
  useHandleAvailability: () => ({
    status: 'idle',
    reason: null,
    normalizedHandle: null,
  }),
}))

vi.mock('@/actions/user/profile', () => ({
  updateProfile: vi.fn(),
}))

vi.mock('@/actions/user/settings', () => ({
  updateAIConfig: vi.fn(),
}))

vi.mock('@/actions/user/parent', () => ({
  generateInviteCode: vi.fn(),
}))

vi.mock('@/actions/notification/preferences', () => ({
  getNotificationPreferences: getNotificationPreferencesMock,
  updateNotificationPreferences: vi.fn(),
}))

vi.mock('@/actions/billing/stripe', () => ({
  cancelSubscriptionAction: vi.fn(),
}))

vi.mock('@/actions/billing/referral', () => ({
  recordReferralCopyAction: vi.fn(),
}))

vi.mock('@/components/ui/use-toast', () => ({
  toast: vi.fn(),
}))

import { SettingsView } from '../SettingsView'

const baseUser = {
  id: 'user-1',
  email: 'victor@example.com',
  username: 'Victor',
  handle: 'victor',
  avatar: null,
  grade: 8,
  role: 'STUDENT',
  subscriptionTier: 'STANDARD',
  subscriptionStatus: 'ACTIVE',
  subscriptionEnd: null,
  cancelAtPeriodEnd: false,
  stripeSubscriptionId: 'sub_123',
  referralCode: 'ABC123',
  referralCount: 2,
  referralsGiven: [],
  settings: {
    aiPersonality: 'ENCOURAGING',
    difficultyCalibration: 60,
    curriculumSystem: null,
    language: 'zh',
    theme: 'system',
  },
}

describe('SettingsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSearchParamsMock.mockReturnValue(new URLSearchParams())
    getNotificationPreferencesMock.mockResolvedValue({
      success: true,
      data: {
        inAppSystem: true,
        inAppSocial: true,
        inAppStudy: true,
        inAppAchievement: true,
        emailSystem: true,
        emailSocial: true,
        emailWeekly: true,
        emailMarketing: true,
      },
    })

    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      value: class {
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    })

    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: vi.fn(),
    })
  })

  it('会把非法 tab query 规范回 profile', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('tab=invalid'))

    render(<SettingsView user={baseUser} />)

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith(
        '/dashboard/settings?tab=profile',
        { scroll: false }
      )
    })
  })

  it('接受合法的 notifications tab，不额外重写 URL', async () => {
    useSearchParamsMock.mockReturnValue(new URLSearchParams('tab=notifications'))
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      render(<SettingsView user={baseUser} />)

      await waitFor(() => {
        expect(getNotificationPreferencesMock).toHaveBeenCalled()
      })

      expect(replaceMock).not.toHaveBeenCalled()
      expect(
        screen.getByRole('heading', { name: '通知偏好' })
      ).toBeInTheDocument()
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()
    } finally {
      consoleErrorSpy.mockRestore()
      consoleWarnSpy.mockRestore()
    }
  })

  it('在没有头像时展示账号缩写，不依赖外链占位图', async () => {
    render(<SettingsView user={baseUser} />)

    await waitFor(() => {
      expect(screen.getByText('VI')).toBeInTheDocument()
    })

    expect(document.querySelector('img[src*="unsplash.com"]')).toBeNull()
  })

  it('在付费订阅缺少到期时间时显示缺失状态，而不是免费版文案', async () => {
    render(<SettingsView user={baseUser} />)

    await waitFor(() => {
      expect(screen.getByText('暂未同步到期时间')).toBeInTheDocument()
    })

    expect(screen.queryByText('当前未开通付费订阅')).not.toBeInTheDocument()
  })
})
