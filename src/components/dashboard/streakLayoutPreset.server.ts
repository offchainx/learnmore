import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultDashboardStreakLayoutPreset,
  normalizeDashboardStreakLayoutPreset,
  type DashboardStreakLayoutPreset,
} from './streakLayoutPreset'

const streakLayoutPresetPath = path.join(
  process.cwd(),
  'src/components/dashboard/dashboard-streak-layout-preset.json'
)

export async function getDashboardStreakLayoutPreset() {
  try {
    const raw = await readFile(streakLayoutPresetPath, 'utf8')
    return normalizeDashboardStreakLayoutPreset(JSON.parse(raw))
  } catch {
    return defaultDashboardStreakLayoutPreset
  }
}

export async function saveDashboardStreakLayoutPreset(
  preset: DashboardStreakLayoutPreset
) {
  const normalized = normalizeDashboardStreakLayoutPreset(preset)
  await mkdir(path.dirname(streakLayoutPresetPath), { recursive: true })
  await writeFile(
    streakLayoutPresetPath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    'utf8'
  )

  return normalized
}
