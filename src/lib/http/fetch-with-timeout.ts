export type FetchWithTimeoutInit = RequestInit & {
  timeoutMs?: number
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: FetchWithTimeoutInit = {},
): Promise<Response> {
  const { timeoutMs = 8000, signal, ...requestInit } = init
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const handleAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', handleAbort, { once: true })
    }
  }

  try {
    return await fetch(input, {
      ...requestInit,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
    if (signal) {
      signal.removeEventListener('abort', handleAbort)
    }
  }
}

export function isAbortLikeError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const name = (error as { name?: string }).name || ''
  return name === 'AbortError'
}
