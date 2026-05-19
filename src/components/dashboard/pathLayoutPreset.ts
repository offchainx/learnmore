export type PathTitleTransform = {
  x: number
  y: number
  scale: number
}

export type PathBackgroundOffset = {
  y: number
}

export type PathShellSize = {
  width: number
  height: number
}

export type DashboardPathLayoutPreset = {
  shell: PathShellSize
  titleTransform: PathTitleTransform
  backgroundOffset: PathBackgroundOffset
}

export const defaultDashboardPathLayoutPreset: DashboardPathLayoutPreset = {
  shell: {
    width: 1070.137,
    height: 143.196,
  },
  titleTransform: {
    x: 0,
    y: 0,
    scale: 1,
  },
  backgroundOffset: {
    y: 0,
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

export function normalizeDashboardPathLayoutPreset(
  input: unknown
): DashboardPathLayoutPreset {
  if (!input || typeof input !== 'object') {
    return defaultDashboardPathLayoutPreset
  }

  const candidate = input as Partial<DashboardPathLayoutPreset>
  const shell = candidate.shell ?? {}
  const titleTransform = candidate.titleTransform ?? {}
  const backgroundOffset = candidate.backgroundOffset ?? {}

  return {
    shell: {
      width: toFiniteNumber(
        (shell as Partial<PathShellSize>).width,
        defaultDashboardPathLayoutPreset.shell.width,
        700,
        1280
      ),
      height: toFiniteNumber(
        (shell as Partial<PathShellSize>).height,
        defaultDashboardPathLayoutPreset.shell.height,
        120,
        320
      ),
    },
    titleTransform: {
      x: toFiniteNumber(
        (titleTransform as Partial<PathTitleTransform>).x,
        defaultDashboardPathLayoutPreset.titleTransform.x,
        -120,
        120
      ),
      y: toFiniteNumber(
        (titleTransform as Partial<PathTitleTransform>).y,
        defaultDashboardPathLayoutPreset.titleTransform.y,
        -40,
        60
      ),
      scale: toFiniteNumber(
        (titleTransform as Partial<PathTitleTransform>).scale,
        defaultDashboardPathLayoutPreset.titleTransform.scale,
        0.7,
        1.45
      ),
    },
    backgroundOffset: {
      y: toFiniteNumber(
        (backgroundOffset as Partial<PathBackgroundOffset>).y,
        defaultDashboardPathLayoutPreset.backgroundOffset.y,
        -120,
        120
      ),
    },
  }
}

export function applyPathPresetToShellBoxes<
  T extends { key: string; width: number; height: number }
>(boxes: readonly T[], preset: DashboardPathLayoutPreset) {
  return boxes.map((box) =>
    box.key === 'path'
      ? {
          ...box,
          width: Number(preset.shell.width.toFixed(3)),
          height: Number(preset.shell.height.toFixed(3)),
        }
      : box
  )
}
