export type SubjectCardKey = 'math' | 'science' | 'chinese' | 'geography'
export type SubjectTitleTransform = {
  x: number
  y: number
  scale: number
}
export type SubjectCardBox = {
  x: number
  y: number
  width: number
  height: number
}
export type SubjectCardBoxes = Record<SubjectCardKey, SubjectCardBox>
export type SubjectShellSize = {
  width: number
  height: number
}
export type DashboardSubjectLayoutPreset = {
  shell: SubjectShellSize
  titleTransform: SubjectTitleTransform
  cardBoxes: SubjectCardBoxes
}

export const defaultDashboardSubjectLayoutPreset: DashboardSubjectLayoutPreset = {
  shell: { width: 390.986, height: 342.648 },
  titleTransform: { x: 0, y: 0, scale: 1 },
  cardBoxes: {
    math: { x: 0, y: 0, width: 168, height: 84 },
    science: { x: 188, y: 0, width: 168, height: 84 },
    chinese: { x: 0, y: 104, width: 168, height: 84 },
    geography: { x: 188, y: 104, width: 168, height: 84 },
  },
}

function toFiniteNumber(value: unknown, fallback: number, min?: number, max?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  let next = value
  if (typeof min === 'number') next = Math.max(min, next)
  if (typeof max === 'number') next = Math.min(max, next)
  return Number(next.toFixed(3))
}

export function normalizeDashboardSubjectLayoutPreset(input: unknown): DashboardSubjectLayoutPreset {
  if (!input || typeof input !== 'object') return defaultDashboardSubjectLayoutPreset
  const candidate = input as Partial<DashboardSubjectLayoutPreset>
  const shell: Partial<SubjectShellSize> = candidate.shell ?? {}
  const titleTransform = candidate.titleTransform ?? {}
  const cards = candidate.cardBoxes ?? {}
  const normalizeCard = (key: SubjectCardKey) => {
    const base = defaultDashboardSubjectLayoutPreset.cardBoxes[key]
    const box = (cards as Partial<Record<SubjectCardKey, Partial<SubjectCardBox>>>)[key] ?? {}
    return {
      x: toFiniteNumber(box.x, base.x, -20, 320),
      y: toFiniteNumber(box.y, base.y, -20, 260),
      width: toFiniteNumber(box.width, base.width, 110, 260),
      height: toFiniteNumber(box.height, base.height, 70, 180),
    }
  }
  return {
    shell: {
      width: toFiniteNumber(shell.width, defaultDashboardSubjectLayoutPreset.shell.width, 260, 640),
      height: toFiniteNumber(shell.height, defaultDashboardSubjectLayoutPreset.shell.height, 220, 520),
    },
    titleTransform: {
      x: toFiniteNumber((titleTransform as Partial<SubjectTitleTransform>).x, 0, -120, 120),
      y: toFiniteNumber((titleTransform as Partial<SubjectTitleTransform>).y, 0, -40, 60),
      scale: toFiniteNumber((titleTransform as Partial<SubjectTitleTransform>).scale, 1, 0.7, 1.45),
    },
    cardBoxes: {
      math: normalizeCard('math'),
      science: normalizeCard('science'),
      chinese: normalizeCard('chinese'),
      geography: normalizeCard('geography'),
    },
  }
}

export function applySubjectPresetToShellBoxes<T extends { key: string; width: number; height: number }>(
  boxes: readonly T[],
  preset: DashboardSubjectLayoutPreset
) {
  return boxes.map((box) =>
    box.key === 'subject'
      ? { ...box, width: Number(preset.shell.width.toFixed(3)), height: Number(preset.shell.height.toFixed(3)) }
      : box
  )
}
