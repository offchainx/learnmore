export function logPerf(
  label: string,
  startedAt: number,
  details: Record<string, unknown> = {}
) {
  console.info(`[Perf] ${label}`, {
    elapsedMs: Math.round(performance.now() - startedAt),
    ...details,
  })
}
