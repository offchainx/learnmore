import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultDashboardHomeDesktopLayoutPreset,
  normalizeDashboardHomeDesktopLayoutPreset,
  type DashboardHomeDesktopLayoutPreset,
} from './dashboardHomeDesktopLayoutPreset'

const dashboardHomeDesktopLayoutPresetPath = path.join(
  process.cwd(),
  'src/components/dashboard/dashboard-home-desktop-layout-preset.json'
)

export async function getDashboardHomeDesktopLayoutPreset() {
  try {
    const raw = await readFile(dashboardHomeDesktopLayoutPresetPath, 'utf8')
    return normalizeDashboardHomeDesktopLayoutPreset(JSON.parse(raw))
  } catch {
    return defaultDashboardHomeDesktopLayoutPreset
  }
}

export async function saveDashboardHomeDesktopLayoutPreset(
  preset: DashboardHomeDesktopLayoutPreset
) {
  const normalized = normalizeDashboardHomeDesktopLayoutPreset(preset)
  await mkdir(path.dirname(dashboardHomeDesktopLayoutPresetPath), {
    recursive: true,
  })
  await writeFile(
    dashboardHomeDesktopLayoutPresetPath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    'utf8'
  )

  return normalized
}
