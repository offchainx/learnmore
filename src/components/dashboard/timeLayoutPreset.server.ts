import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultDashboardTimeLayoutPreset,
  normalizeDashboardTimeLayoutPreset,
  type DashboardTimeLayoutPreset,
} from './timeLayoutPreset'

const timeLayoutPresetPath = path.join(
  process.cwd(),
  'src/components/dashboard/dashboard-time-layout-preset.json'
)

export async function getDashboardTimeLayoutPreset() {
  try {
    const raw = await readFile(timeLayoutPresetPath, 'utf8')
    return normalizeDashboardTimeLayoutPreset(JSON.parse(raw))
  } catch {
    return defaultDashboardTimeLayoutPreset
  }
}

export async function saveDashboardTimeLayoutPreset(
  preset: DashboardTimeLayoutPreset
) {
  const normalized = normalizeDashboardTimeLayoutPreset(preset)
  await mkdir(path.dirname(timeLayoutPresetPath), { recursive: true })
  await writeFile(
    timeLayoutPresetPath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    'utf8'
  )

  return normalized
}
