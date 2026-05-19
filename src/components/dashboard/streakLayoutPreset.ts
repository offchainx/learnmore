export type StreakTitleTransform = {
  x: number
  y: number
  scale: number
}

export type StreakCampfireFrame = {
  x: number
  y: number
  width: number
  height: number
}

export type StreakShellSize = {
  width: number
  height: number
}

export type DashboardStreakLayoutPreset = {
  shell: StreakShellSize
  titleTransform: StreakTitleTransform
  campfireFrame: StreakCampfireFrame
}

export const defaultDashboardStreakLayoutPreset: DashboardStreakLayoutPreset = {
  shell: {
    width: 529.07,
    height: 217.5,
  },
  titleTransform: {
    x: 15.113,
    y: 20.973,
    scale: 1,
  },
  campfireFrame: {
    x: 249.21,
    y: -8,
    width: 132,
    height: 116,
  },
}

function toFiniteNumber(
  value: unknown,
  fallback: number,
  min?: number,
  max?: number
) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  let next = value
  if (typeof min === 'number') {
    next = Math.max(min, next)
  }
  if (typeof max === 'number') {
    next = Math.min(max, next)
  }

  return Number(next.toFixed(3))
}

export function normalizeDashboardStreakLayoutPreset(
  input: unknown
): DashboardStreakLayoutPreset {
  if (!input || typeof input !== 'object') {
    return defaultDashboardStreakLayoutPreset
  }

  const candidate = input as Partial<DashboardStreakLayoutPreset>
  const shell = candidate.shell ?? {}
  const titleTransform = candidate.titleTransform ?? {}
  const campfireFrame = candidate.campfireFrame ?? {}

  return {
    shell: {
      width: toFiniteNumber(
        (shell as Partial<StreakShellSize>).width,
        defaultDashboardStreakLayoutPreset.shell.width,
        300,
        800
      ),
      height: toFiniteNumber(
        (shell as Partial<StreakShellSize>).height,
        defaultDashboardStreakLayoutPreset.shell.height,
        170,
        360
      ),
    },
    titleTransform: {
      x: toFiniteNumber(
        (titleTransform as Partial<StreakTitleTransform>).x,
        defaultDashboardStreakLayoutPreset.titleTransform.x,
        -120,
        120
      ),
      y: toFiniteNumber(
        (titleTransform as Partial<StreakTitleTransform>).y,
        defaultDashboardStreakLayoutPreset.titleTransform.y,
        -40,
        80
      ),
      scale: toFiniteNumber(
        (titleTransform as Partial<StreakTitleTransform>).scale,
        defaultDashboardStreakLayoutPreset.titleTransform.scale,
        0.7,
        1.45
      ),
    },
    campfireFrame: {
      x: toFiniteNumber(
        (campfireFrame as Partial<StreakCampfireFrame>).x,
        defaultDashboardStreakLayoutPreset.campfireFrame.x,
        120,
        420
      ),
      y: toFiniteNumber(
        (campfireFrame as Partial<StreakCampfireFrame>).y,
        defaultDashboardStreakLayoutPreset.campfireFrame.y,
        -80,
        80
      ),
      width: toFiniteNumber(
        (campfireFrame as Partial<StreakCampfireFrame>).width,
        defaultDashboardStreakLayoutPreset.campfireFrame.width,
        80,
        220
      ),
      height: toFiniteNumber(
        (campfireFrame as Partial<StreakCampfireFrame>).height,
        defaultDashboardStreakLayoutPreset.campfireFrame.height,
        70,
        220
      ),
    },
  }
}

export function applyStreakPresetToShellBoxes<
  T extends { key: string; width: number; height: number }
>(boxes: readonly T[], preset: DashboardStreakLayoutPreset) {
  return boxes.map((box) =>
    box.key === 'streak'
      ? {
          ...box,
          width: Number(preset.shell.width.toFixed(3)),
          height: Number(preset.shell.height.toFixed(3)),
        }
      : box
  )
}
