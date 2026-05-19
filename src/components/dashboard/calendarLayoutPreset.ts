export type CalendarShellSize = {
  width: number
  height: number
}

export type CalendarTransform = {
  x: number
  y: number
  scale: number
}

export type DashboardCalendarLayoutPreset = {
  shell: CalendarShellSize
  titleTransform: CalendarTransform
  contentTransform: CalendarTransform
}

export const defaultDashboardCalendarLayoutPreset: DashboardCalendarLayoutPreset = {
  shell: {
    width: 793.973,
    height: 234,
  },
  titleTransform: { x: 0, y: 0, scale: 1 },
  contentTransform: { x: 0, y: 0, scale: 1 },
}

function toFiniteNumber(value: unknown, fallback: number, min?: number, max?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  let next = value
  if (typeof min === 'number') next = Math.max(min, next)
  if (typeof max === 'number') next = Math.min(max, next)
  return Number(next.toFixed(3))
}

function normalizeTransform(input: unknown, fallback: CalendarTransform): CalendarTransform {
  const candidate = input && typeof input === 'object' ? (input as Partial<CalendarTransform>) : {}
  return {
    x: toFiniteNumber(candidate.x, fallback.x, -120, 120),
    y: toFiniteNumber(candidate.y, fallback.y, -80, 120),
    scale: toFiniteNumber(candidate.scale, fallback.scale, 0.7, 1.45),
  }
}

export function normalizeDashboardCalendarLayoutPreset(
  input: unknown
): DashboardCalendarLayoutPreset {
  if (!input || typeof input !== 'object') return defaultDashboardCalendarLayoutPreset
  const candidate = input as Partial<DashboardCalendarLayoutPreset>
  const shell: Partial<CalendarShellSize> = candidate.shell ?? {}
  return {
    shell: {
      width: toFiniteNumber(shell.width, defaultDashboardCalendarLayoutPreset.shell.width, 420, 980),
      height: toFiniteNumber(shell.height, defaultDashboardCalendarLayoutPreset.shell.height, 180, 360),
    },
    titleTransform: normalizeTransform(candidate.titleTransform, defaultDashboardCalendarLayoutPreset.titleTransform),
    contentTransform: normalizeTransform(candidate.contentTransform, defaultDashboardCalendarLayoutPreset.contentTransform),
  }
}

export function applyCalendarPresetToShellBoxes<T extends { key: string; width: number; height: number }>(
  boxes: readonly T[],
  preset: DashboardCalendarLayoutPreset
) {
  return boxes.map((box) =>
    box.key === 'calendar'
      ? { ...box, width: Number(preset.shell.width.toFixed(3)), height: Number(preset.shell.height.toFixed(3)) }
      : box
  )
}
