export const DASHBOARD_HOME_MIN_ASIDE_WIDTH = 798

export type DashboardHomeDesktopLayoutPreset = {
  pageMaxWidth: number
  gridGap: number
  heroOffsetX: number
  heroOffsetY: number
  taskOffsetX: number
  taskOffsetY: number
  pathOffsetX: number
  pathOffsetY: number
  streakOffsetX: number
  streakOffsetY: number
  goalOffsetX: number
  goalOffsetY: number
  asideWidth: number
  asideOffsetX: number
  asideOffsetY: number
  asideStickyTop: number
}

export const defaultDashboardHomeDesktopLayoutPreset: DashboardHomeDesktopLayoutPreset =
  {
    pageMaxWidth: 1480,
    gridGap: 20,
    heroOffsetX: 0,
    heroOffsetY: 0,
    taskOffsetX: 0,
    taskOffsetY: 0,
    pathOffsetX: 0,
    pathOffsetY: 0,
    streakOffsetX: 0,
    streakOffsetY: 0,
    goalOffsetX: 0,
    goalOffsetY: 0,
    asideWidth: DASHBOARD_HOME_MIN_ASIDE_WIDTH,
    asideOffsetX: 0,
    asideOffsetY: 0,
    asideStickyTop: 16,
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

export function normalizeDashboardHomeDesktopLayoutPreset(
  input: unknown
): DashboardHomeDesktopLayoutPreset {
  if (!input || typeof input !== 'object') {
    return defaultDashboardHomeDesktopLayoutPreset
  }

  const candidate = input as Partial<DashboardHomeDesktopLayoutPreset>

  return {
    pageMaxWidth: toFiniteNumber(
      candidate.pageMaxWidth,
      defaultDashboardHomeDesktopLayoutPreset.pageMaxWidth,
      1200,
      1800
    ),
    gridGap: toFiniteNumber(
      candidate.gridGap,
      defaultDashboardHomeDesktopLayoutPreset.gridGap,
      8,
      64
    ),
    heroOffsetX: toFiniteNumber(
      candidate.heroOffsetX,
      defaultDashboardHomeDesktopLayoutPreset.heroOffsetX,
      -160,
      160
    ),
    heroOffsetY: toFiniteNumber(
      candidate.heroOffsetY,
      defaultDashboardHomeDesktopLayoutPreset.heroOffsetY,
      -160,
      160
    ),
    taskOffsetX: toFiniteNumber(
      candidate.taskOffsetX,
      defaultDashboardHomeDesktopLayoutPreset.taskOffsetX,
      -160,
      160
    ),
    taskOffsetY: toFiniteNumber(
      candidate.taskOffsetY,
      defaultDashboardHomeDesktopLayoutPreset.taskOffsetY,
      -160,
      160
    ),
    pathOffsetX: toFiniteNumber(
      candidate.pathOffsetX,
      defaultDashboardHomeDesktopLayoutPreset.pathOffsetX,
      -160,
      160
    ),
    pathOffsetY: toFiniteNumber(
      candidate.pathOffsetY,
      defaultDashboardHomeDesktopLayoutPreset.pathOffsetY,
      -160,
      160
    ),
    streakOffsetX: toFiniteNumber(
      candidate.streakOffsetX,
      defaultDashboardHomeDesktopLayoutPreset.streakOffsetX,
      -160,
      160
    ),
    streakOffsetY: toFiniteNumber(
      candidate.streakOffsetY,
      defaultDashboardHomeDesktopLayoutPreset.streakOffsetY,
      -160,
      160
    ),
    goalOffsetX: toFiniteNumber(
      candidate.goalOffsetX,
      defaultDashboardHomeDesktopLayoutPreset.goalOffsetX,
      -160,
      160
    ),
    goalOffsetY: toFiniteNumber(
      candidate.goalOffsetY,
      defaultDashboardHomeDesktopLayoutPreset.goalOffsetY,
      -160,
      160
    ),
    asideWidth: toFiniteNumber(
      candidate.asideWidth,
      defaultDashboardHomeDesktopLayoutPreset.asideWidth,
      DASHBOARD_HOME_MIN_ASIDE_WIDTH,
      700
    ),
    asideOffsetX: toFiniteNumber(
      candidate.asideOffsetX,
      defaultDashboardHomeDesktopLayoutPreset.asideOffsetX,
      -160,
      160
    ),
    asideOffsetY: toFiniteNumber(
      candidate.asideOffsetY,
      defaultDashboardHomeDesktopLayoutPreset.asideOffsetY,
      -160,
      160
    ),
    asideStickyTop: toFiniteNumber(
      candidate.asideStickyTop,
      defaultDashboardHomeDesktopLayoutPreset.asideStickyTop,
      0,
      80
    ),
  }
}
