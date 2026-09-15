'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { submitBetaSignup, type DeviceType } from '@/actions/beta-signup'
import { REFERRAL_SOURCES, type ReferralSource } from '@/lib/marketing/beta-signup-options'

type Status = 'idle' | 'submitting' | 'done' | 'error'

const UTM_STORAGE_KEY = 'lb-utm-source'

/**
 * 落地页是 force-static，服务端读不到 query string，所以 utm_source 在客户端取。
 * 存进 sessionStorage，用户中途点去 /privacy 再回来也不会丢掉来源。
 */
function useUtmSource(): string {
  const [utmSource, setUtmSource] = useState('')

  useEffect(() => {
    let fromUrl = ''
    try {
      fromUrl = new URLSearchParams(window.location.search).get('utm_source') ?? ''
    } catch {
      fromUrl = ''
    }

    if (fromUrl) {
      setUtmSource(fromUrl)
      try {
        sessionStorage.setItem(UTM_STORAGE_KEY, fromUrl)
      } catch {
        /* 隐私模式 / 禁用存储：本次会话内仍然有值，够用 */
      }
      return
    }

    try {
      setUtmSource(sessionStorage.getItem(UTM_STORAGE_KEY) ?? '')
    } catch {
      setUtmSource('')
    }
  }, [])

  return utmSource
}

const copy = {
  en: {
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    deviceLabel: 'Device',
    interestLabel: 'What would you like to test? (optional)',
    interestPlaceholder: 'e.g. Mathematics practice, Learn notes…',
    referralLabel: 'How did you hear about us? (optional)',
    referralSkip: 'Prefer not to say',
    referralOptions: {
      xhs: 'Xiaohongshu (RED)',
      instagram: 'Instagram',
      facebook: 'Facebook',
      friend: 'A friend told me',
      other: 'Somewhere else',
    },
    submit: 'Join the beta',
    submitting: 'Sending…',
    done: "You're on the list. We'll email you when the beta opens.",
    invalidEmail: 'Please enter a valid email address.',
    genericError: 'Something went wrong. Please try again, or email us directly.',
  },
  zh: {
    emailLabel: '邮箱地址',
    emailPlaceholder: 'you@example.com',
    deviceLabel: '设备类型',
    interestLabel: '想测试哪部分？（选填）',
    interestPlaceholder: '例如：数学练习、Learn 笔记……',
    referralLabel: '你从哪知道我们的？（选填）',
    referralSkip: '不想说',
    referralOptions: {
      xhs: '小红书',
      instagram: 'Instagram',
      facebook: 'Facebook',
      friend: '朋友介绍',
      other: '其他',
    },
    submit: '加入内测',
    submitting: '提交中…',
    done: '已收到你的报名，内测开放时会发邮件通知你。',
    invalidEmail: '请输入有效的邮箱地址。',
    genericError: '提交失败，请重试，或直接给我们发邮件。',
  },
} as const

export function BetaSignupForm({ locale }: { locale: 'en' | 'zh' }) {
  const t = copy[locale]
  const utmSource = useUtmSource()
  const [email, setEmail] = useState('')
  const [deviceType, setDeviceType] = useState<DeviceType>('ios')
  const [testingInterest, setTestingInterest] = useState('')
  const [referralSource, setReferralSource] = useState<ReferralSource | ''>('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (status === 'done') {
    return (
      <div className="mt-10 flex items-start gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/15 px-6 py-5 text-emerald-100">
        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm leading-relaxed">{t.done}</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const result = await submitBetaSignup({
      email,
      deviceType,
      testingInterest,
      referralSource,
      utmSource,
    })

    if (result.ok) {
      setStatus('done')
      return
    }

    setStatus('error')
    setErrorMessage(result.error === 'invalid_email' ? t.invalidEmail : t.genericError)
  }

  // 深色渐变底上的文字：正文一律 slate-200/300，占位符 slate-400。
  // slate-500 在 blue-500/10 over #020617 上只有 3.8:1，过不了 4.5:1，这一段不要用。
  const fieldClass =
    'mt-2 w-full rounded-xl border border-white/20 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50'
  const labelClass = 'text-sm font-semibold text-slate-200'

  return (
    <form onSubmit={handleSubmit} className="mt-10 grid gap-5 tablet:max-w-lg">
      <div>
        <label className={labelClass} htmlFor="beta-email">
          {t.emailLabel}
        </label>
        <input
          id="beta-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPlaceholder}
          className={fieldClass}
        />
      </div>

      <div>
        <span className={labelClass}>{t.deviceLabel}</span>
        <div className="mt-2 flex gap-3">
          {(['ios', 'android'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDeviceType(d)}
              aria-pressed={deviceType === d}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                deviceType === d
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {d === 'ios' ? 'iOS' : 'Android'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="beta-referral">
          {t.referralLabel}
        </label>
        <select
          id="beta-referral"
          value={referralSource}
          onChange={(e) => setReferralSource(e.target.value as ReferralSource | '')}
          className={fieldClass}
        >
          <option value="">{t.referralSkip}</option>
          {REFERRAL_SOURCES.map((source) => (
            <option key={source} value={source}>
              {t.referralOptions[source]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="beta-interest">
          {t.interestLabel}
        </label>
        <textarea
          id="beta-interest"
          value={testingInterest}
          onChange={(e) => setTestingInterest(e.target.value)}
          placeholder={t.interestPlaceholder}
          rows={2}
          className={fieldClass}
        />
      </div>

      {status === 'error' && <p className="text-sm font-medium text-red-300">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-4 text-base font-bold text-white transition-colors hover:bg-blue-400 disabled:opacity-60 tablet:w-fit tablet:py-3.5 tablet:text-sm"
      >
        {status === 'submitting' ? t.submitting : t.submit}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  )
}
