export type ReviewCardKey = 'math' | 'science' | 'english' | 'social'
export type ReviewTitleTransform = {
  x: number
  y: number
  scale: number
}
export type ReviewCardBox = {
  x: number
  y: number
  width: number
  height: number
}
export type ReviewCardBoxes = Record<ReviewCardKey, ReviewCardBox>
export type ReviewShellSize = {
  width: number
  height: number
}
export type DashboardReviewLayoutPreset = {
  shell: ReviewShellSize
  titleTransform: ReviewTitleTransform
  cardBoxes: ReviewCardBoxes
}

export const defaultDashboardReviewLayoutPreset: DashboardReviewLayoutPreset = {
  shell: { width: 793.973, height: 217.5 },
  titleTransform: { x: 0, y: 0, scale: 1 },
  cardBoxes: {
    math: { x: 0, y: 0, width: 185, height: 60 },
    science: { x: 195, y: 0, width: 185, height: 60 },
    english: { x: 390, y: 0, width: 185, height: 60 },
    social: { x: 585, y: 0, width: 185, height: 60 },
  },
}

function toFiniteNumber(value: unknown, fallback: number, min?: number, max?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  let next = value
  if (typeof min === 'number') next = Math.max(min, next)
  if (typeof max === 'number') next = Math.min(max, next)
  return Number(next.toFixed(3))
}

export function normalizeDashboardReviewLayoutPreset(input: unknown): DashboardReviewLayoutPreset {
  if (!input || typeof input !== 'object') return defaultDashboardReviewLayoutPreset
  const candidate = input as Partial<DashboardReviewLayoutPreset>
  const shell: Partial<ReviewShellSize> = candidate.shell ?? {}
  const titleTransform = candidate.titleTransform ?? {}
  const cards = candidate.cardBoxes ?? {}
  const normalizeCard = (key: ReviewCardKey) => {
    const base = defaultDashboardReviewLayoutPreset.cardBoxes[key]
    const box = (cards as Partial<Record<ReviewCardKey, Partial<ReviewCardBox>>>)[key] ?? {}
    return {
      x: toFiniteNumber(box.x, base.x, -40, 720),
      y: toFiniteNumber(box.y, base.y, -20, 220),
      width: toFiniteNumber(box.width, base.width, 110, 260),
      height: toFiniteNumber(box.height, base.height, 90, 220),
    }
  }
  return {
    shell: {
      width: toFiniteNumber(shell.width, defaultDashboardReviewLayoutPreset.shell.width, 420, 980),
      height: toFiniteNumber(shell.height, defaultDashboardReviewLayoutPreset.shell.height, 170, 360),
    },
    titleTransform: {
      x: toFiniteNumber((titleTransform as Partial<ReviewTitleTransform>).x, 0, -120, 120),
      y: toFiniteNumber((titleTransform as Partial<ReviewTitleTransform>).y, 0, -40, 60),
      scale: toFiniteNumber((titleTransform as Partial<ReviewTitleTransform>).scale, 1, 0.7, 1.45),
    },
    cardBoxes: {
      math: normalizeCard('math'),
      science: normalizeCard('science'),
      english: normalizeCard('english'),
      social: normalizeCard('social'),
    },
  }
}

export function applyReviewPresetToShellBoxes<T extends { key: string; width: number; height: number }>(
  boxes: readonly T[],
  preset: DashboardReviewLayoutPreset
) {
  return boxes.map((box) =>
    box.key === 'review'
      ? { ...box, width: Number(preset.shell.width.toFixed(3)), height: Number(preset.shell.height.toFixed(3)) }
      : box
  )
}
