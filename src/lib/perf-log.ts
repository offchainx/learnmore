export function logPerf(
  label: string,
  startedAt: number,
  details: Record<string, unknown> = {},
  options: { warnAfterMs?: number } = {}
) {
  const elapsedMs = Math.round(performance.now() - startedAt)
  const warnAfterMs = options.warnAfterMs ?? 1000
  const payload = {
    elapsedMs,
    ...details,
  }

  const isProduction = process.env.NODE_ENV === 'production'
  const isLocalPerfLoggingEnabled = process.env.LOCAL_PERF_LOGS === 'true'

  if (!isProduction && !isLocalPerfLoggingEnabled) {
    return
  }

  if (elapsedMs >= warnAfterMs) {
    console.warn(`[Perf] ${label}`, payload)
    return
  }

  if (isProduction) {
    console.info(`[Perf] ${label}`, payload)
  }
}
