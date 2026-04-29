import { NextRequest, NextResponse } from 'next/server'

import { syncCurrentUserToDatabase } from '@/actions/user/auth'
import { createClient } from '@/lib/supabase/server'
import { resolveOnboardingRedirect } from '@/lib/auth/onboarding'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login?oauth=error', url.origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[Auth] OAuth callback exchange failed:', error)
    return NextResponse.redirect(new URL('/login?oauth=error', url.origin))
  }

  const syncResult = await syncCurrentUserToDatabase()

  if (!syncResult.success || !syncResult.user) {
    console.error('[Auth] OAuth callback user sync failed:', syncResult.error)
    return NextResponse.redirect(new URL('/login?oauth=error', url.origin))
  }

  const redirectTarget = resolveOnboardingRedirect({
    legalConsentAcceptedAt: syncResult.user.legalConsentAcceptedAt,
    displayName: syncResult.user.displayName,
    school: syncResult.user.school,
    grade: syncResult.user.grade,
    onboardingCompletedAt: syncResult.user.onboardingCompletedAt,
    onboardingStep: syncResult.user.onboardingStep,
  })

  return NextResponse.redirect(new URL(redirectTarget, url.origin))
}
