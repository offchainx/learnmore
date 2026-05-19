import { getAuthenticatedAuthPageRedirectTarget } from '@/actions/user/auth'
import { ResetPasswordPanel } from '@/components/business/auth/reset-password-panel'
import { redirect } from 'next/navigation'

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams
  const codeParam = params.code
  const tokenHashParam = params.token_hash
  const typeParam = params.type

  const recoveryCode = Array.isArray(codeParam) ? codeParam[0] : codeParam || ''
  const tokenHash = Array.isArray(tokenHashParam)
    ? tokenHashParam[0]
    : tokenHashParam || ''
  const recoveryType = Array.isArray(typeParam) ? typeParam[0] : typeParam || ''
  const hasRecoverySignal = Boolean(recoveryCode || tokenHash)

  if (!hasRecoverySignal) {
    const authenticatedRedirect = await getAuthenticatedAuthPageRedirectTarget()
    if (authenticatedRedirect) {
      redirect(authenticatedRedirect)
    }
  }

  return (
    <div className="container flex min-h-[100dvh] min-w-0 items-start justify-center px-4 py-6 sm:items-center sm:px-6 sm:py-10">
      <ResetPasswordPanel
        recoveryCode={recoveryCode}
        tokenHash={tokenHash}
        recoveryType={recoveryType}
      />
    </div>
  )
}
