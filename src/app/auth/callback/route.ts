import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { resolvePostLoginRedirectValue } from '@/lib/auth/redirects'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const redirectTo = resolvePostLoginRedirectValue(url.searchParams.get('redirectTo'))

  if (!code) {
    return NextResponse.redirect(new URL('/login?oauth=error', url.origin))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[Auth] OAuth callback exchange failed:', error)
    return NextResponse.redirect(new URL('/login?oauth=error', url.origin))
  }

  return NextResponse.redirect(new URL(redirectTo, url.origin))
}
