export type GoalTitleTransform = {
  x: number
  y: number
  scale: number
}

export type GoalSummaryOffset = {
  x: number
  y: number
}

export type GoalTrophyFrame = {
  x: number
  y: number
  width: number
  height: number
}

export type GoalShellSize = {
  width: number
  height: number
}

export type DashboardGoalLayoutPreset = {
  shell: GoalShellSize
  titleTransform: GoalTitleTransform
  summaryOffset: GoalSummaryOffset
  trophyFrame: GoalTrophyFrame
}

export const defaultDashboardGoalLayoutPreset: DashboardGoalLayoutPreset = {
  shell: {
    width: 529.07,
    height: 217.5,
  },
  titleTransform: {
    x: 0,
    y: 0,
    scale: 1,
  },
  summaryOffset: {
    x: 20,
    y: -30,
  },
  trophyFrame: {
    x: 0,
    y: 0,
    width: 126,
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

export function normalizeDashboardGoalLayoutPreset(
  input: unknown
): DashboardGoalLayoutPreset {
  if (!input || typeof input !== 'object') {
    return defaultDashboardGoalLayoutPreset
  }

  const candidate = input as Partial<DashboardGoalLayoutPreset>
  const shell = candidate.shell ?? {}
  const titleTransform = candidate.titleTransform ?? {}
  const summaryOffset = candidate.summaryOffset ?? {}
  const trophyFrame = candidate.trophyFrame ?? {}

  return {
    shell: {
      width: toFiniteNumber(
        (shell as Partial<GoalShellSize>).width,
        defaultDashboardGoalLayoutPreset.shell.width,
        300,
        800
      ),
      height: toFiniteNumber(
        (shell as Partial<GoalShellSize>).height,
        defaultDashboardGoalLayoutPreset.shell.height,
        170,
        360
      ),
    },
    titleTransform: {
      x: toFiniteNumber(
        (titleTransform as Partial<GoalTitleTransform>).x,
        defaultDashboardGoalLayoutPreset.titleTransform.x,
        -120,
        120
      ),
      y: toFiniteNumber(
        (titleTransform as Partial<GoalTitleTransform>).y,
        defaultDashboardGoalLayoutPreset.titleTransform.y,
        -40,
        60
      ),
      scale: toFiniteNumber(
        (titleTransform as Partial<GoalTitleTransform>).scale,
        defaultDashboardGoalLayoutPreset.titleTransform.scale,
        0.7,
        1.45
      ),
    },
    summaryOffset: {
      x: toFiniteNumber(
        (summaryOffset as Partial<GoalSummaryOffset>).x,
        defaultDashboardGoalLayoutPreset.summaryOffset.x,
        -40,
        80
      ),
      y: toFiniteNumber(
        (summaryOffset as Partial<GoalSummaryOffset>).y,
        defaultDashboardGoalLayoutPreset.summaryOffset.y,
        -80,
        40
      ),
    },
    trophyFrame: {
      x: toFiniteNumber(
        (trophyFrame as Partial<GoalTrophyFrame>).x,
        defaultDashboardGoalLayoutPreset.trophyFrame.x,
        -60,
        80
      ),
      y: toFiniteNumber(
        (trophyFrame as Partial<GoalTrophyFrame>).y,
        defaultDashboardGoalLayoutPreset.trophyFrame.y,
        -60,
        80
      ),
      width: toFiniteNumber(
        (trophyFrame as Partial<GoalTrophyFrame>).width,
        defaultDashboardGoalLayoutPreset.trophyFrame.width,
        80,
        200
      ),
      height: toFiniteNumber(
        (trophyFrame as Partial<GoalTrophyFrame>).height,
        defaultDashboardGoalLayoutPreset.trophyFrame.height,
        80,
        200
      ),
    },
  }
}

export function applyGoalPresetToShellBoxes<
  T extends { key: string; width: number; height: number }
>(boxes: readonly T[], preset: DashboardGoalLayoutPreset) {
  return boxes.map((box) =>
    box.key === 'goal'
      ? {
          ...box,
          width: Number(preset.shell.width.toFixed(3)),
          height: Number(preset.shell.height.toFixed(3)),
        }
      : box
  )
}
