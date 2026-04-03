import { LoginForm } from '@/components/business/auth/login-form'

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectToParam = params.redirectTo
  const resetParam = params.reset
  const redirectTo = Array.isArray(redirectToParam)
    ? redirectToParam[0]
    : redirectToParam
  const resetSuccess = resetParam === 'success' || (Array.isArray(resetParam) && resetParam[0] === 'success')

  return (
    <div className="container flex min-h-screen min-w-0 items-center justify-center py-12">
      <LoginForm redirectTo={redirectTo} resetSuccess={resetSuccess} />
    </div>
  )
}
