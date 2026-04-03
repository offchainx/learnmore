import { Suspense } from 'react'
import { ResetPasswordPanel } from '@/components/business/auth/reset-password-panel'

export default function ResetPasswordPage() {
  return (
    <div className="container flex min-h-screen min-w-0 items-center justify-center py-12">
      <Suspense fallback={<div>加载中...</div>}>
        <ResetPasswordPanel />
      </Suspense>
    </div>
  )
}
