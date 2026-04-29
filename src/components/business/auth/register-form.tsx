'use client'

import { signupAction } from '@/actions/user/auth'

import { AuthIllustratedPage } from './animated-characters-auth-page'

type RegisterFormProps = {
  initialReferralCode?: string
  referralError?: string
  initialUtmSource?: string
  initialUtmMedium?: string
  initialUtmCampaign?: string
  oauthError?: boolean
}

export function RegisterForm({
  initialReferralCode = '',
  referralError = '',
  initialUtmSource = '',
  initialUtmMedium = '',
  initialUtmCampaign = '',
  oauthError,
}: RegisterFormProps) {
  return (
    <AuthIllustratedPage
      mode="register"
      action={signupAction}
      initialReferralCode={initialReferralCode}
      referralError={referralError}
      initialUtmSource={initialUtmSource}
      initialUtmMedium={initialUtmMedium}
      initialUtmCampaign={initialUtmCampaign}
      oauthError={oauthError}
    />
  )
}
