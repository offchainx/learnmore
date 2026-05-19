import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultDashboardPathLayoutPreset,
  normalizeDashboardPathLayoutPreset,
  type DashboardPathLayoutPreset,
} from './pathLayoutPreset'

const pathLayoutPresetPath = path.join(
  process.cwd(),
  'src/components/dashboard/dashboard-path-layout-preset.json'
)

export async function getDashboardPathLayoutPreset() {
  try {
    const raw = await readFile(pathLayoutPresetPath, 'utf8')
    return normalizeDashboardPathLayoutPreset(JSON.parse(raw))
  } catch {
    return defaultDashboardPathLayoutPreset
  }
}

export async function saveDashboardPathLayoutPreset(
  preset: DashboardPathLayoutPreset
) {
  const normalized = normalizeDashboardPathLayoutPreset(preset)
  await mkdir(path.dirname(pathLayoutPresetPath), { recursive: true })
  await writeFile(
    pathLayoutPresetPath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    'utf8'
  )

  return normalized
}
