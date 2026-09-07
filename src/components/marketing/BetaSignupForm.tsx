'use client'

import { useState } from 'react'
import { ArrowRight, CircleCheck } from 'lucide-react'
import { submitBetaSignup, type DeviceType } from '@/actions/beta-signup'

type Status = 'idle' | 'submitting' | 'done' | 'error'

const copy = {
  en: {
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    deviceLabel: 'Device',
    interestLabel: 'What would you like to test? (optional)',
    interestPlaceholder: 'e.g. Mathematics practice, Learn notes…',
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
    submit: '加入内测',
    submitting: '提交中…',
    done: '已收到你的报名，内测开放时会发邮件通知你。',
    invalidEmail: '请输入有效的邮箱地址。',
    genericError: '提交失败，请重试，或直接给我们发邮件。',
  },
} as const

export function BetaSignupForm({ locale }: { locale: 'en' | 'zh' }) {
  const t = copy[locale]
  const [email, setEmail] = useState('')
  const [deviceType, setDeviceType] = useState<DeviceType>('ios')
  const [testingInterest, setTestingInterest] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (status === 'done') {
    return (
      <div className="mt-10 flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-6 py-5 text-emerald-200">
        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm leading-relaxed">{t.done}</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const result = await submitBetaSignup({ email, deviceType, testingInterest })

    if (result.ok) {
      setStatus('done')
      return
    }

    setStatus('error')
    setErrorMessage(result.error === 'invalid_email' ? t.invalidEmail : t.genericError)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 grid gap-5 sm:max-w-lg">
      <div>
        <label className="text-sm font-semibold text-slate-300" htmlFor="beta-email">
          {t.emailLabel}
        </label>
        <input
          id="beta-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPlaceholder}
          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
        />
      </div>

      <div>
        <span className="text-sm font-semibold text-slate-300">{t.deviceLabel}</span>
        <div className="mt-2 flex gap-3">
          {(['ios', 'android'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDeviceType(d)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                deviceType === d
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {d === 'ios' ? 'iOS' : 'Android'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-300" htmlFor="beta-interest">
          {t.interestLabel}
        </label>
        <textarea
          id="beta-interest"
          value={testingInterest}
          onChange={(e) => setTestingInterest(e.target.value)}
          placeholder={t.interestPlaceholder}
          rows={2}
          className="mt-2 w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {status === 'error' && <p className="text-sm text-red-300">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-400 disabled:opacity-60"
      >
        {status === 'submitting' ? t.submitting : t.submit}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  )
}
