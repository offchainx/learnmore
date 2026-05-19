import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultDashboardProfileLayoutPreset,
  normalizeDashboardProfileLayoutPreset,
  type DashboardProfileLayoutPreset,
} from './profileLayoutPreset'

const profileLayoutPresetPath = path.join(
  process.cwd(),
  'src/components/dashboard/dashboard-profile-layout-preset.json'
)

export async function getDashboardProfileLayoutPreset() {
  try {
    const raw = await readFile(profileLayoutPresetPath, 'utf8')
    return normalizeDashboardProfileLayoutPreset(JSON.parse(raw))
  } catch {
    return defaultDashboardProfileLayoutPreset
  }
}

export async function saveDashboardProfileLayoutPreset(
  preset: DashboardProfileLayoutPreset
) {
  const normalized = normalizeDashboardProfileLayoutPreset(preset)
  await mkdir(path.dirname(profileLayoutPresetPath), { recursive: true })
  await writeFile(
    profileLayoutPresetPath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    'utf8'
  )

  return normalized
}
