export type TaskCardKey = 'math' | 'science' | 'english' | 'bonus'

export type TaskTitleTransform = {
  x: number
  y: number
  scale: number
}

export type TaskCardBox = {
  x: number
  y: number
  width: number
  height: number
}

export type TaskCardBoxes = Record<TaskCardKey, TaskCardBox>

export type DashboardTaskLayoutPreset = {
  titleTransform: TaskTitleTransform
  taskCardBoxes: TaskCardBoxes
}

export const defaultDashboardTaskLayoutPreset: DashboardTaskLayoutPreset = {
  titleTransform: {
    x: 0,
    y: 0,
    scale: 1,
  },
  taskCardBoxes: {
    math: { x: 20, y: 50, width: 235.034, height: 128 },
    science: { x: 285.034, y: 50, width: 235.034, height: 128 },
    english: { x: 550.068, y: 50, width: 235.034, height: 128 },
    bonus: { x: 815.102, y: 50, width: 235.034, height: 128 },
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

export function normalizeDashboardTaskLayoutPreset(
  input: unknown
): DashboardTaskLayoutPreset {
  if (!input || typeof input !== 'object') {
    return defaultDashboardTaskLayoutPreset
  }

  const candidate = input as Partial<DashboardTaskLayoutPreset>
  const titleTransform = candidate.titleTransform ?? {}
  const cardBoxes = candidate.taskCardBoxes ?? {}

  const normalizeTaskCardBox = (key: TaskCardKey): TaskCardBox => {
    const fallback = defaultDashboardTaskLayoutPreset.taskCardBoxes[key]
    const box = (cardBoxes as Partial<Record<TaskCardKey, Partial<TaskCardBox>>>)[key] ?? {}

    return {
      x: toFiniteNumber(box.x, fallback.x, -120, 980),
      y: toFiniteNumber(box.y, fallback.y, 0, 120),
      width: toFiniteNumber(box.width, fallback.width, 160, 320),
      height: toFiniteNumber(box.height, fallback.height, 96, 180),
    }
  }

  return {
    titleTransform: {
      x: toFiniteNumber(
        (titleTransform as Partial<TaskTitleTransform>).x,
        defaultDashboardTaskLayoutPreset.titleTransform.x,
        -120,
        120
      ),
      y: toFiniteNumber(
        (titleTransform as Partial<TaskTitleTransform>).y,
        defaultDashboardTaskLayoutPreset.titleTransform.y,
        -40,
        60
      ),
      scale: toFiniteNumber(
        (titleTransform as Partial<TaskTitleTransform>).scale,
        defaultDashboardTaskLayoutPreset.titleTransform.scale,
        0.7,
        1.45
      ),
    },
    taskCardBoxes: {
      math: normalizeTaskCardBox('math'),
      science: normalizeTaskCardBox('science'),
      english: normalizeTaskCardBox('english'),
      bonus: normalizeTaskCardBox('bonus'),
    },
  }
}
