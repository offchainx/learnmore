import { getAuthenticatedAuthPageRedirectTarget } from '@/actions/user/auth'
import { RegisterForm } from '@/components/business/auth/register-form'
import { redirect } from 'next/navigation'

type RegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams
  const referralCodeParam = params.referralCode
  const referralErrorParam = params.referralError
  const oauthParam = params.oauth
  const utmSourceParam = params.utm_source
  const utmMediumParam = params.utm_medium
  const utmCampaignParam = params.utm_campaign
  const oauthError =
    oauthParam === 'error' ||
    (Array.isArray(oauthParam) && oauthParam[0] === 'error')

  const authenticatedRedirect = await getAuthenticatedAuthPageRedirectTarget()
  if (authenticatedRedirect) {
    redirect(authenticatedRedirect)
  }

  return (
    <RegisterForm
      initialReferralCode={
        Array.isArray(referralCodeParam)
          ? referralCodeParam[0]
          : referralCodeParam || ''
      }
      referralError={
        Array.isArray(referralErrorParam)
          ? referralErrorParam[0]
          : referralErrorParam || ''
      }
      initialUtmSource={
        Array.isArray(utmSourceParam) ? utmSourceParam[0] : utmSourceParam || ''
      }
      initialUtmMedium={
        Array.isArray(utmMediumParam) ? utmMediumParam[0] : utmMediumParam || ''
      }
      initialUtmCampaign={
        Array.isArray(utmCampaignParam)
          ? utmCampaignParam[0]
          : utmCampaignParam || ''
      }
      oauthError={oauthError}
    />
  )
}
