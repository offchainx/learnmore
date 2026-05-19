export type TimeTitleTransform = {
  x: number
  y: number
  scale: number
}

export type TimeStudyPanelKey = 'pie' | 'stats'
export type TimeStudyPanelBox = {
  x: number
  y: number
  width: number
  height: number
}
export type TimeStudyPanelBoxes = Record<TimeStudyPanelKey, TimeStudyPanelBox>
export type TimeShellSize = {
  width: number
  height: number
}
export type DashboardTimeLayoutPreset = {
  shell: TimeShellSize
  titleTransform: TimeTitleTransform
  panelBoxes: TimeStudyPanelBoxes
}

export const defaultDashboardTimeLayoutPreset: DashboardTimeLayoutPreset = {
  shell: { width: 390.986, height: 342.648 },
  titleTransform: { x: 0, y: 0, scale: 1 },
  panelBoxes: {
    pie: { x: 0, y: 0, width: 138, height: 138 },
    stats: { x: 148, y: 0, width: 224, height: 138 },
  },
}

function toFiniteNumber(value: unknown, fallback: number, min?: number, max?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  let next = value
  if (typeof min === 'number') next = Math.max(min, next)
  if (typeof max === 'number') next = Math.min(max, next)
  return Number(next.toFixed(3))
}

export function normalizeDashboardTimeLayoutPreset(input: unknown): DashboardTimeLayoutPreset {
  if (!input || typeof input !== 'object') return defaultDashboardTimeLayoutPreset
  const candidate = input as Partial<DashboardTimeLayoutPreset>
  const shell: Partial<TimeShellSize> = candidate.shell ?? {}
  const titleTransform = candidate.titleTransform ?? {}
  const panels = candidate.panelBoxes ?? {}
  const normalizePanel = (key: TimeStudyPanelKey) => {
    const base = defaultDashboardTimeLayoutPreset.panelBoxes[key]
    const box = (panels as Partial<Record<TimeStudyPanelKey, Partial<TimeStudyPanelBox>>>)[key] ?? {}
    return {
      x: toFiniteNumber(box.x, base.x, -40, 260),
      y: toFiniteNumber(box.y, base.y, -20, 220),
      width: toFiniteNumber(box.width, base.width, 112, 320),
      height: toFiniteNumber(box.height, base.height, 112, 240),
    }
  }
  return {
    shell: {
      width: toFiniteNumber(shell.width, defaultDashboardTimeLayoutPreset.shell.width, 260, 640),
      height: toFiniteNumber(shell.height, defaultDashboardTimeLayoutPreset.shell.height, 220, 520),
    },
    titleTransform: {
      x: toFiniteNumber((titleTransform as Partial<TimeTitleTransform>).x, 0, -120, 120),
      y: toFiniteNumber((titleTransform as Partial<TimeTitleTransform>).y, 0, -40, 60),
      scale: toFiniteNumber((titleTransform as Partial<TimeTitleTransform>).scale, 1, 0.7, 1.45),
    },
    panelBoxes: {
      pie: normalizePanel('pie'),
      stats: normalizePanel('stats'),
    },
  }
}

export function applyTimePresetToShellBoxes<T extends { key: string; width: number; height: number }>(
  boxes: readonly T[],
  preset: DashboardTimeLayoutPreset
) {
  return boxes.map((box) =>
    box.key === 'time'
      ? { ...box, width: Number(preset.shell.width.toFixed(3)), height: Number(preset.shell.height.toFixed(3)) }
      : box
  )
}
