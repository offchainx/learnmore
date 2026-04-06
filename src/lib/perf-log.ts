export function logPerf(
  label: string,
  startedAt: number,
  details: Record<string, unknown> = {}
) {
  console.warn(`[Perf] ${label}`, {
    elapsedMs: Math.round(performance.now() - startedAt),
    ...details,
  })
}
