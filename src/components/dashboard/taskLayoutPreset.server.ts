import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultDashboardTaskLayoutPreset,
  normalizeDashboardTaskLayoutPreset,
  type DashboardTaskLayoutPreset,
} from './taskLayoutPreset'

const taskLayoutPresetPath = path.join(
  process.cwd(),
  'src/components/dashboard/dashboard-task-layout-preset.json'
)

export async function getDashboardTaskLayoutPreset() {
  try {
    const raw = await readFile(taskLayoutPresetPath, 'utf8')
    return normalizeDashboardTaskLayoutPreset(JSON.parse(raw))
  } catch {
    return defaultDashboardTaskLayoutPreset
  }
}

export async function saveDashboardTaskLayoutPreset(
  preset: DashboardTaskLayoutPreset
) {
  const normalized = normalizeDashboardTaskLayoutPreset(preset)
  await mkdir(path.dirname(taskLayoutPresetPath), { recursive: true })
  await writeFile(
    taskLayoutPresetPath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    'utf8'
  )

  return normalized
}
