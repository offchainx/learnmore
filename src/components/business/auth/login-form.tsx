'use client'

import { loginAction } from '@/actions/user/auth'

import { AuthIllustratedPage } from './animated-characters-auth-page'

type LoginFormProps = {
  redirectTo?: string
  resetSuccess?: boolean
  oauthError?: boolean
}

export function LoginForm({
  redirectTo,
  resetSuccess,
  oauthError,
}: LoginFormProps) {
  return (
    <AuthIllustratedPage
      mode="login"
      action={loginAction}
      redirectTo={redirectTo}
      resetSuccess={resetSuccess}
      oauthError={oauthError}
    />
  )
}
