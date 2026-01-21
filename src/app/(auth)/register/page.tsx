import { Suspense } from 'react'
import { RegisterForm } from '@/components/business/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Suspense fallback={<div>加载中...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
