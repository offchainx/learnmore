type HeaderLike = Pick<Headers, 'get'>

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1'])

function normalizeHostname(rawHost: string | null | undefined): string | null {
  if (!rawHost) {
    return null
  }

  const firstHost = rawHost.split(',')[0]?.trim()
  if (!firstHost) {
    return null
  }

  return firstHost.toLowerCase().replace(/:\d+$/, '')
}

function getRequestHostname(headersLike: HeaderLike | null | undefined): string | null {
  if (!headersLike) {
    return null
  }

  return normalizeHostname(
    headersLike.get('x-forwarded-host') ?? headersLike.get('host')
  )
}

export function canAccessDashboardPreview(headersLike?: HeaderLike | null): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true
  }

  const hostname = getRequestHostname(headersLike)
  return hostname ? LOCAL_HOSTNAMES.has(hostname) : false
}

