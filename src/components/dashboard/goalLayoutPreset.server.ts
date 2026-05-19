import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultDashboardGoalLayoutPreset,
  normalizeDashboardGoalLayoutPreset,
  type DashboardGoalLayoutPreset,
} from './goalLayoutPreset'

const goalLayoutPresetPath = path.join(
  process.cwd(),
  'src/components/dashboard/dashboard-goal-layout-preset.json'
)

export async function getDashboardGoalLayoutPreset() {
  try {
    const raw = await readFile(goalLayoutPresetPath, 'utf8')
    return normalizeDashboardGoalLayoutPreset(JSON.parse(raw))
  } catch {
    return defaultDashboardGoalLayoutPreset
  }
}

export async function saveDashboardGoalLayoutPreset(
  preset: DashboardGoalLayoutPreset
) {
  const normalized = normalizeDashboardGoalLayoutPreset(preset)
  await mkdir(path.dirname(goalLayoutPresetPath), { recursive: true })
  await writeFile(
    goalLayoutPresetPath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    'utf8'
  )

  return normalized
}
