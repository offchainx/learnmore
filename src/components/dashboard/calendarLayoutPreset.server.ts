import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultDashboardCalendarLayoutPreset,
  normalizeDashboardCalendarLayoutPreset,
  type DashboardCalendarLayoutPreset,
} from './calendarLayoutPreset'

const calendarLayoutPresetPath = path.join(
  process.cwd(),
  'src/components/dashboard/dashboard-calendar-layout-preset.json'
)

export async function getDashboardCalendarLayoutPreset() {
  try {
    const raw = await readFile(calendarLayoutPresetPath, 'utf8')
    return normalizeDashboardCalendarLayoutPreset(JSON.parse(raw))
  } catch {
    return defaultDashboardCalendarLayoutPreset
  }
}

export async function saveDashboardCalendarLayoutPreset(
  preset: DashboardCalendarLayoutPreset
) {
  const normalized = normalizeDashboardCalendarLayoutPreset(preset)
  await mkdir(path.dirname(calendarLayoutPresetPath), { recursive: true })
  await writeFile(
    calendarLayoutPresetPath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    'utf8'
  )

  return normalized
}
