'use client'

import { useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import { signupAction, type AuthFormState } from '@/actions/user/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useReferralCodeAvailability } from '@/lib/hooks/useReferralCodeAvailability'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="w-full"
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
  const [referralCode, setReferralCode] = useState(initialReferralCode)
  const referralCodeAvailability = useReferralCodeAvailability(referralCode)

  useEffect(() => {
    setReferralCode(initialReferralCode)
  }, [initialReferralCode])

  const referralCodeErrorMessage =
    referralCode.trim() && referralCodeAvailability.status === 'unavailable'
      ? referralCodeAvailability.reason || '这个推荐码无效，请检查后重试。'
      : ''

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">创建账号</CardTitle>
        <CardDescription className="text-center">
          加入 LearnMore 开启学习之旅
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="utm_source" value={initialUtmSource} />
        <input type="hidden" name="utm_medium" value={initialUtmMedium} />
        <input type="hidden" name="utm_campaign" value={initialUtmCampaign} />
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input id="username" name="username" placeholder="你的昵称" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input id="email" name="email" type="email" placeholder="name@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="referralCode">推荐码（选填）</Label>
            <Input
              id="referralCode"
              name="referralCode"
              placeholder="如果有推荐码可填写"
              value={referralCode}
              onChange={(event) => setReferralCode(event.target.value)}
              autoCapitalize="characters"
              spellCheck={false}
              className={
                referralCodeErrorMessage
                  ? 'border-destructive focus-visible:ring-destructive'
                  : undefined
              }
            />
            <p className="text-xs text-muted-foreground">
              如果你通过推荐链接进入，这里会自动带入；你也可以手动修改或留空。
            </p>
            {referralCodeAvailability.status === 'checking' && referralCode.trim() ? (
              <p className="text-xs text-muted-foreground">正在验证推荐码...</p>
            ) : null}
            {referralCodeErrorMessage ? (
              <p className="text-xs font-medium text-destructive">
                这个推荐码无效，请检查后重试。
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          {referralError && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
              {referralError === 'INVALID_REFERRAL_CODE'
                ? '推荐链接无效，请检查后重试。'
                : referralError === 'REFERRAL_NOT_FOUND'
                  ? '未找到对应的推荐码，请确认后再注册。'
                  : '推荐码暂时不可用，请稍后重试。'}
            </div>
          )}
          {state.error && (
            <div className="text-sm text-red-500 text-center">
              {state.error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <SubmitButton />
          <div className="text-sm text-center text-muted-foreground">
            已有账号?{' '}
            <Link href="/login" className="text-primary hover:underline">
              直接登录
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
