const DEFAULT_POST_LOGIN_REDIRECT = '/dashboard'

export function resolvePostLoginRedirectValue(
  rawValue: string | null | undefined
): string {
  if (typeof rawValue !== 'string') return DEFAULT_POST_LOGIN_REDIRECT

  const redirectTo = rawValue.trim()
  if (!redirectTo) return DEFAULT_POST_LOGIN_REDIRECT
  if (!redirectTo.startsWith('/')) return DEFAULT_POST_LOGIN_REDIRECT
  if (redirectTo.startsWith('//')) return DEFAULT_POST_LOGIN_REDIRECT
  if (redirectTo.startsWith('/login') || redirectTo.startsWith('/register')) {
    return DEFAULT_POST_LOGIN_REDIRECT
  }

  return redirectTo
}

export { DEFAULT_POST_LOGIN_REDIRECT }
