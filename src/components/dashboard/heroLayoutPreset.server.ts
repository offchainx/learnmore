import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultDashboardHeroLayoutPreset,
  normalizeDashboardHeroLayoutPreset,
  type DashboardHeroLayoutPreset,
} from './heroLayoutPreset'

const heroLayoutPresetPath = path.join(
  process.cwd(),
  'src/components/dashboard/dashboard-hero-layout-preset.json'
)

export async function getDashboardHeroLayoutPreset() {
  try {
    const raw = await readFile(heroLayoutPresetPath, 'utf8')
    return normalizeDashboardHeroLayoutPreset(JSON.parse(raw))
  } catch {
    return defaultDashboardHeroLayoutPreset
  }
}

export async function saveDashboardHeroLayoutPreset(
  preset: DashboardHeroLayoutPreset
) {
  const normalized = normalizeDashboardHeroLayoutPreset(preset)
  await mkdir(path.dirname(heroLayoutPresetPath), { recursive: true })
  await writeFile(
    heroLayoutPresetPath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    'utf8'
  )

  return normalized
}
