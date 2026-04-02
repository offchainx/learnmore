type PerfLevel = 'info' | 'error'

type PerfContext = Record<string, unknown>

type RouteLoggerRequest = Pick<Request, 'headers' | 'method'> & {
  nextUrl: {
    pathname: string
    search: string
  }
}

function serializeError(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return 'Unknown error'
  }
}

export function logPerfEvent(
  payload: PerfContext & {
    event: string
    level?: PerfLevel
  }
) {
  const level = payload.level ?? 'info'
  const message = JSON.stringify({
    ts: new Date().toISOString(),
    ...payload,
  })

  if (level === 'error') {
    console.error(message)
    return
  }

  console.log(message)
}

export function createRoutePerfLogger(route: string, request: RouteLoggerRequest) {
  const start = Date.now()
  const requestId =
    request.headers.get('x-vercel-id') ??
    request.headers.get('x-request-id') ??
    request.headers.get('x-vercel-request-id')

  const base = {
    scope: 'server' as const,
    route,
    method: request.method,
    path: `${request.nextUrl.pathname}${request.nextUrl.search}`,
    requestId,
  }

  logPerfEvent({
    ...base,
    event: 'start',
    level: 'info',
  })

  return {
    done(status: number, extra: PerfContext = {}) {
      logPerfEvent({
        ...base,
        event: 'done',
        level: 'info',
        status,
        ms: Date.now() - start,
        ...extra,
      })
    },
    error(error: unknown, status = 500, extra: PerfContext = {}) {
      logPerfEvent({
        ...base,
        event: 'error',
        level: 'error',
        status,
        ms: Date.now() - start,
        error: serializeError(error),
        ...extra,
      })
    },
  }
}

export function createServerPerfLogger(route: string) {
  const start = Date.now()

  logPerfEvent({
    scope: 'server',
    route,
    event: 'start',
    level: 'info',
  })

  return {
    done(extra: PerfContext = {}) {
      logPerfEvent({
        scope: 'server',
        route,
        event: 'done',
        level: 'info',
        ms: Date.now() - start,
        ...extra,
      })
    },
    error(error: unknown, extra: PerfContext = {}) {
      logPerfEvent({
        scope: 'server',
        route,
        event: 'error',
        level: 'error',
        ms: Date.now() - start,
        error: serializeError(error),
        ...extra,
      })
    },
  }
}

export function emitClientPerfEvent(event: string, extra: PerfContext = {}) {
  if (typeof window === 'undefined') return
  if (process.env.NODE_ENV === 'production') return

  console.info(
    JSON.stringify({
      ts: new Date().toISOString(),
      scope: 'client',
      event,
      ms: Math.round(performance.now()),
      ...extra,
    })
  )
}
