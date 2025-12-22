'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { signupAction, type AuthFormState } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? '注册中...' : '创建账号'}
    </Button>
  )
}

const initialState: AuthFormState = {}

export function RegisterForm() {
  const [state, formAction] = useFormState(signupAction, initialState)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">创建账号</CardTitle>
        <CardDescription className="text-center">
          加入 LearnMore 开启学习之旅
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
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
            <Label htmlFor="password">密码</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
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
