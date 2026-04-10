import { getAuthenticatedAuthPageRedirectTarget } from '@/actions/user/auth'
import { RegisterForm } from '@/components/business/auth/register-form'
import { redirect } from 'next/navigation'

type RegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams
  const referralCodeParam = params.referralCode
  const referralErrorParam = params.referralError
  const utmSourceParam = params.utm_source
  const utmMediumParam = params.utm_medium
  const utmCampaignParam = params.utm_campaign

  const authenticatedRedirect = await getAuthenticatedAuthPageRedirectTarget()
  if (authenticatedRedirect) {
    redirect(authenticatedRedirect)
  }

  return (
    <div className="container flex min-h-screen min-w-0 items-center justify-center py-12">
      <RegisterForm
        initialReferralCode={Array.isArray(referralCodeParam) ? referralCodeParam[0] : referralCodeParam || ''}
        referralError={Array.isArray(referralErrorParam) ? referralErrorParam[0] : referralErrorParam || ''}
        initialUtmSource={Array.isArray(utmSourceParam) ? utmSourceParam[0] : utmSourceParam || ''}
        initialUtmMedium={Array.isArray(utmMediumParam) ? utmMediumParam[0] : utmMediumParam || ''}
        initialUtmCampaign={Array.isArray(utmCampaignParam) ? utmCampaignParam[0] : utmCampaignParam || ''}
      />
    </div>
  )
}
