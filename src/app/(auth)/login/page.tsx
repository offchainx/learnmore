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
  const rawRedirectTo = Array.isArray(redirectToParam)
    ? redirectToParam[0]
    : redirectToParam
  const redirectTo = resolvePostLoginRedirectValue(rawRedirectTo)
  const resetSuccess = resetParam === 'success' || (Array.isArray(resetParam) && resetParam[0] === 'success')
  const authenticatedRedirect = await getAuthenticatedAuthPageRedirectTarget(redirectTo)

  if (authenticatedRedirect) {
    redirect(authenticatedRedirect)
  }

  return (
    <div className="container flex min-h-screen min-w-0 items-center justify-center py-12">
      <LoginForm redirectTo={redirectTo} resetSuccess={resetSuccess} />
    </div>
  )
}
