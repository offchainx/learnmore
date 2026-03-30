import { Suspense } from 'react'
import { RegisterForm } from '@/components/business/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="container flex min-h-screen min-w-0 items-center justify-center py-12">
      <Suspense fallback={<div>加载中...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
