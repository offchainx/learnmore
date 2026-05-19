export type ProfileSectionKey = 'avatar' | 'greeting' | 'stats' | 'badge'

export type ProfileSectionBox = {
  x: number
  y: number
  width: number
  height: number
}

export type ProfileSectionBoxes = Record<ProfileSectionKey, ProfileSectionBox>

export type ProfileShellSize = {
  width: number
  height: number
}

export type DashboardProfileLayoutPreset = {
  shell: ProfileShellSize
  sectionBoxes: ProfileSectionBoxes
}

export const defaultDashboardProfileLayoutPreset: DashboardProfileLayoutPreset = {
  shell: {
    width: 793.973,
    height: 166.21,
  },
  sectionBoxes: {
    avatar: { x: 30.247, y: 16.418, width: 178.871, height: 136.902 },
    greeting: { x: 243.204, y: 37.742, width: 374.192, height: 114.625 },
    stats: { x: 425.566, y: 39.468, width: 261.93, height: 101.035 },
    badge: { x: 570.351, y: 8.824, width: 156.184, height: 171.793 },
  },
}

function toFiniteNumber(
  value: unknown,
  fallback: number,
  min?: number,
  max?: number
) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  let next = value
  if (typeof min === 'number') next = Math.max(min, next)
  if (typeof max === 'number') next = Math.min(max, next)
  return Number(next.toFixed(3))
}

export function normalizeDashboardProfileLayoutPreset(
  input: unknown
): DashboardProfileLayoutPreset {
  if (!input || typeof input !== 'object') return defaultDashboardProfileLayoutPreset
  const candidate = input as Partial<DashboardProfileLayoutPreset>
  const shell: Partial<ProfileShellSize> = candidate.shell ?? {}
  const sections = candidate.sectionBoxes ?? {}

  const normalizeSection = (key: ProfileSectionKey) => {
    const base = defaultDashboardProfileLayoutPreset.sectionBoxes[key]
    const box = (sections as Partial<Record<ProfileSectionKey, Partial<ProfileSectionBox>>>)[key] ?? {}
    return {
      x: toFiniteNumber(box.x, base.x, 0, 760),
      y: toFiniteNumber(box.y, base.y, -20, 220),
      width: toFiniteNumber(box.width, base.width, 44, 320),
      height: toFiniteNumber(box.height, base.height, 44, 220),
    }
  }

  return {
    shell: {
      width: toFiniteNumber(shell.width, defaultDashboardProfileLayoutPreset.shell.width, 360, 980),
      height: toFiniteNumber(shell.height, defaultDashboardProfileLayoutPreset.shell.height, 130, 320),
    },
    sectionBoxes: {
      avatar: normalizeSection('avatar'),
      greeting: normalizeSection('greeting'),
      stats: normalizeSection('stats'),
      badge: normalizeSection('badge'),
    },
  }
}

export function applyProfilePresetToShellBoxes<T extends { key: string; width: number; height: number }>(
  boxes: readonly T[],
  preset: DashboardProfileLayoutPreset
) {
  return boxes.map((box) =>
    box.key === 'profile'
      ? { ...box, width: Number(preset.shell.width.toFixed(3)), height: Number(preset.shell.height.toFixed(3)) }
      : box
  )
}
