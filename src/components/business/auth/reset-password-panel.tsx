'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Mail, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type PanelMode = 'loading' | 'request' | 'set'

function getResetRedirectUrl() {
  if (typeof window === 'undefined') {
    return '/reset-password'
  }

  return `${window.location.origin}/reset-password`
}

export function ResetPasswordPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<PanelMode>('loading')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      const supabase = createClient()
      const code = searchParams.get('code')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const hasRecoverySignal = Boolean(code || tokenHash)

      try {
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            throw exchangeError
          }
        } else if (tokenHash && type === 'recovery') {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          })
          if (verifyError) {
            throw verifyError
          }
        }
      } catch (authError) {
        if (!mounted) return

        console.error('[ResetPassword] Failed to exchange recovery session:', authError)
        setError('重置链接校验失败，请重新发送密码重置邮件。')
        setMode('request')
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      if (session?.user?.email) {
        setEmail(session.user.email)
        setMode('set')
        setNotice('重置链接已验证，请设置新密码。')
        setError(null)
        return
      }

      setMode('request')
      if (hasRecoverySignal) {
        setError('重置链接已失效或已使用，请重新发送密码重置邮件。')
      }
    }

    void bootstrap()

    return () => {
      mounted = false
    }
  }, [searchParams])

  const handleSendResetEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('请输入邮箱地址')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setNotice(null)

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: getResetRedirectUrl(),
      })

      if (resetError) {
        setError(resetError.message || '发送重置邮件失败')
        return
      }

      setNotice('如果邮箱存在，重置邮件已发送，请检查收件箱和垃圾箱。')
    } catch (requestError) {
      console.error('[ResetPassword] Failed to send reset email:', requestError)
      setError('发送重置邮件失败，请稍后重试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (newPassword.length < 6) {
      setError('新密码至少需要 6 位')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setNotice(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        setError(updateError.message || '更新密码失败')
        return
      }

      await supabase.auth.signOut()
      router.replace('/login?reset=success')
      router.refresh()
    } catch (updatePasswordError) {
      console.error('[ResetPassword] Failed to update password:', updatePasswordError)
      setError('更新密码失败，请稍后重试。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = mode === 'loading'

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {mode === 'set' ? '设置新密码' : '找回密码'}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === 'set'
            ? '重置链接已验证，请输入新的登录密码。'
            : '输入邮箱后，我们会发送密码重置链接。'}
        </CardDescription>
      </CardHeader>

      {notice ? (
        <div className="mx-6 mb-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      ) : null}

      {error ? (
        <div className="mx-6 mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {isLoading ? (
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-borderTone/80 bg-surface-subtle px-4 py-10 text-sm text-text-secondary dark:border-borderTone dark:bg-surface-subtle">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在校验恢复链接...
          </div>
        </CardContent>
      ) : (
        <form onSubmit={mode === 'set' ? handleUpdatePassword : handleSendResetEmail}>
          <CardContent className="space-y-4">
            {mode === 'set' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">账号邮箱</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <Input
                      id="reset-email"
                      value={email}
                      disabled
                      readOnly
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <Input
                      id="new-password"
                      name="new-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={6}
                      placeholder="请输入新密码"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认新密码</Label>
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    placeholder="再次输入新密码"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3 text-xs leading-5 text-text-secondary dark:border-borderTone dark:bg-surface-subtle">
                  我们只会发送一封重置邮件，不会公开显示该邮箱是否存在。
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" isLoading={isSubmitting} loadingText={mode === 'set' ? '更新中...' : '发送中...'}>
              {mode === 'set' ? '更新密码' : '发送重置邮件'}
            </Button>

            <div className="text-sm text-center text-muted-foreground">
              {mode === 'set' ? (
                <>
                  返回{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    登录页
                  </Link>
                </>
              ) : (
                <>
                  想直接登录?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    返回登录
                  </Link>
                </>
              )}
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}
