import { getAuthenticatedAuthPageRedirectTarget } from '@/actions/user/auth'
import { resolvePostLoginRedirectValue } from '@/lib/auth/redirects'
import { LoginForm } from '@/components/business/auth/login-form'
import { redirect } from 'next/navigation'

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectToParam = params.redirectTo
  const resetParam = params.reset
  const oauthParam = params.oauth
  const rawRedirectTo = Array.isArray(redirectToParam)
    ? redirectToParam[0]
    : redirectToParam
  const redirectTo = resolvePostLoginRedirectValue(rawRedirectTo)
  const resetSuccess = resetParam === 'success' || (Array.isArray(resetParam) && resetParam[0] === 'success')
  const oauthError = Array.isArray(oauthParam) ? oauthParam[0] : oauthParam
  const authenticatedRedirect = await getAuthenticatedAuthPageRedirectTarget(redirectTo)

  if (authenticatedRedirect) {
    redirect(authenticatedRedirect)
  }

  return (
    <div className="flex w-full min-w-0 justify-center">
      <LoginForm
        redirectTo={redirectTo}
        resetSuccess={resetSuccess}
        oauthErrorMessage={oauthError === 'error' ? 'Google 登录失败，请稍后重试。' : undefined}
      />
    </div>
  )
}
