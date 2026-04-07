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

  if (elapsedMs >= warnAfterMs) {
    console.warn(`[Perf] ${label}`, payload)
    return
  }

  if (process.env.NODE_ENV === 'production') {
    console.info(`[Perf] ${label}`, payload)
  }
}
