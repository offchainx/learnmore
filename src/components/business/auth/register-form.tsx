'use client'

import { useEffect, useState, useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'

import { signupAction, type AuthFormState } from '@/actions/user/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useReferralCodeAvailability } from '@/lib/hooks/useReferralCodeAvailability'

import { AuthHero } from './login-hero'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="h-12 w-full rounded-[10px] !bg-[#111111] !text-white shadow-none hover:!bg-[#1b1b1b]"
      isLoading={pending}
      loadingText="注册中..."
    >
      创建账号
    </Button>
  )
}

const initialState: AuthFormState = {}

interface RegisterFormProps {
  initialReferralCode?: string
  referralError?: string
  initialUtmSource?: string
  initialUtmMedium?: string
  initialUtmCampaign?: string
}

export function RegisterForm({
  initialReferralCode = '',
  referralError = '',
  initialUtmSource = '',
  initialUtmMedium = '',
  initialUtmCampaign = '',
}: RegisterFormProps) {
  const [state, formAction] = useActionState(signupAction, initialState)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [referralCode, setReferralCode] = useState(initialReferralCode)
  const [isUsernameFocused, setIsUsernameFocused] = useState(false)
  const [isEmailFocused, setIsEmailFocused] = useState(false)
  const [isReferralFocused, setIsReferralFocused] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const referralCodeAvailability = useReferralCodeAvailability(referralCode)

  useEffect(() => {
    setReferralCode(initialReferralCode)
  }, [initialReferralCode])

  const isTyping =
    isUsernameFocused || isEmailFocused || isReferralFocused || isPasswordFocused

  const referralCodeErrorMessage =
    referralCode.trim() && referralCodeAvailability.status === 'unavailable'
      ? referralCodeAvailability.reason || '这个推荐码无效，请检查后重试。'
      : ''

  return (
    <div className="w-full max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <AuthHero
          password={password}
          showPassword={showPassword}
          isTyping={isTyping}
          className="hidden min-h-[360px] lg:block lg:min-h-[720px]"
        />

        <Card className="overflow-hidden rounded-[10px] border border-slate-200/80 bg-white/95 text-slate-900 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <CardHeader className="space-y-3 p-6 text-center sm:p-8">
            <div className="mx-auto flex items-center gap-2 text-xs font-medium tracking-[0.24em] text-slate-500 uppercase lg:hidden">
              <div className="flex size-8 items-center justify-center rounded-[10px] border border-slate-200 bg-slate-50">
                <Sparkles className="size-4 text-slate-700" />
              </div>
              LearnMore
            </div>
            <div className="space-y-2">
              <CardTitle className="text-center text-3xl font-semibold tracking-tight text-balance text-slate-950">
                创建账号
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-500">
                加入 LearnMore 开启学习之旅。
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-6 sm:px-8">
            <form action={formAction} className="space-y-5">
              <input type="hidden" name="utm_source" value={initialUtmSource} />
              <input type="hidden" name="utm_medium" value={initialUtmMedium} />
              <input type="hidden" name="utm_campaign" value={initialUtmCampaign} />

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-slate-900">
                  用户名
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="你的昵称"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  onFocus={() => setIsUsernameFocused(true)}
                  onBlur={() => setIsUsernameFocused(false)}
                  className="h-12 rounded-[10px] border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:bg-white focus-visible:ring-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-900">
                  邮箱
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  className="h-12 rounded-[10px] border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:bg-white focus-visible:ring-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode" className="text-sm font-medium text-slate-900">
                  推荐码（选填）
                </Label>
                <Input
                  id="referralCode"
                  name="referralCode"
                  placeholder="如果有推荐码可填写"
                  value={referralCode}
                  onChange={(event) => setReferralCode(event.target.value)}
                  onFocus={() => setIsReferralFocused(true)}
                  onBlur={() => setIsReferralFocused(false)}
                  autoCapitalize="characters"
                  spellCheck={false}
                  className={
                    referralCodeErrorMessage
                      ? 'h-12 rounded-[10px] border-rose-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-rose-400 focus-visible:bg-white focus-visible:ring-rose-300/30'
                      : 'h-12 rounded-[10px] border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:bg-white focus-visible:ring-slate-300'
                  }
                />
                {referralCodeAvailability.status === 'checking' && referralCode.trim() ? (
                  <p className="text-xs text-slate-500">正在验证推荐码...</p>
                ) : null}
                {referralCodeErrorMessage ? (
                  <p className="text-xs font-medium text-rose-700">
                    这个推荐码无效，请检查后重试。
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-900">
                  密码
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="至少 6 位"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    className="h-12 rounded-[10px] pr-12 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:bg-white focus-visible:ring-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-900"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              {referralError ? (
                <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {referralError === 'INVALID_REFERRAL_CODE'
                    ? '推荐链接无效，请检查后重试。'
                    : referralError === 'REFERRAL_NOT_FOUND'
                      ? '未找到对应的推荐码，请确认后再注册。'
                      : '推荐码暂时不可用，请稍后重试。'}
                </div>
              ) : null}

              {state.error ? (
                <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {state.error}
                </div>
              ) : null}

              <SubmitButton />
            </form>

            <div className="text-center text-sm text-slate-500">
              已有账号?{' '}
              <Link href="/login" className="font-medium text-slate-900 hover:underline">
                直接登录
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
