'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Chrome, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'

import { loginAction, type AuthFormState } from '@/actions/user/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

import { LoginHero } from './login-hero'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="h-12 w-full rounded-[10px] !bg-[#111111] !text-white shadow-none hover:!bg-[#1b1b1b]"
      isLoading={pending}
      loadingText="登录中..."
    >
      登录
    </Button>
  )
}

const initialState: AuthFormState = {}

interface LoginFormProps {
  redirectTo?: string
  resetSuccess?: boolean
  oauthErrorMessage?: string
}

export function LoginForm({
  redirectTo = '/dashboard',
  resetSuccess = false,
  oauthErrorMessage,
}: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isEmailFocused, setIsEmailFocused] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(oauthErrorMessage || null)

  const isTyping = isEmailFocused || isPasswordFocused
  const authError = state.error

  const handleGoogleSignIn = async () => {
    setGoogleError(null)
    setGoogleLoading(true)

    try {
      const supabase = createClient()

      if (typeof window === 'undefined') {
        throw new Error('当前环境无法发起 Google 登录。')
      }

      const callbackUrl = new URL('/auth/callback', window.location.origin)
      callbackUrl.searchParams.set('redirectTo', redirectTo)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      })

      if (error) {
        throw error
      }

      if (!data?.url) {
        throw new Error('未能生成 Google 登录地址，请稍后重试。')
      }

      window.location.assign(data.url)
    } catch (error) {
      console.error('[Auth] Google Login Error:', error)
      setGoogleError(
        error instanceof Error ? error.message : 'Google 登录失败，请稍后重试。'
      )
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <LoginHero
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
            <CardTitle className="text-center text-3xl font-semibold tracking-tight text-balance text-slate-950">
              欢迎回来！
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 px-6 pb-6 sm:px-8">
            {resetSuccess ? (
              <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                密码已更新，请使用新密码重新登录。
              </div>
            ) : null}

            <form action={formAction} className="space-y-5">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="rememberMe" value={rememberMe ? 'true' : 'false'} />
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-900">
                  邮箱
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  className="h-12 rounded-[10px] border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:bg-white focus-visible:ring-slate-300"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-900">
                    密码
                  </Label>
                  <Link href="/reset-password" className="text-sm text-slate-500 hover:text-slate-900 hover:underline">
                    忘记密码?
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
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

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-slate-300 bg-white data-[state=checked]:border-slate-900 data-[state=checked]:bg-slate-900 data-[state=checked]:text-white"
                  />
                  <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-slate-700">
                    Remember me
                  </Label>
                </div>
                <Link href="/reset-password" className="text-sm text-slate-500 hover:text-slate-900 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {authError ? (
                <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {authError}
                </div>
              ) : null}

              <SubmitButton />
            </form>

            <div className="space-y-4 pt-1">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-[10px] border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                onClick={handleGoogleSignIn}
                isLoading={googleLoading}
                loadingText="正在跳转到 Google..."
                loadingIcon={<Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              >
                <Chrome className="size-4" />
                Log in with Google
              </Button>

              {googleError ? (
                <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {googleError}
                </div>
              ) : null}
            </div>

            <div className="text-center text-sm text-slate-500">
              还没有账号?{' '}
              <Link href="/register" className="font-medium text-slate-900 hover:underline">
                立即注册
              </Link>
            </div>
          </CardContent>

        </Card>
      </div>
    </div>
  )
}
