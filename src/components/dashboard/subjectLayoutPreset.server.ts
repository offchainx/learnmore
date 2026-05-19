import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultDashboardSubjectLayoutPreset,
  normalizeDashboardSubjectLayoutPreset,
  type DashboardSubjectLayoutPreset,
} from './subjectLayoutPreset'

const subjectLayoutPresetPath = path.join(
  process.cwd(),
  'src/components/dashboard/dashboard-subject-layout-preset.json'
)

export async function getDashboardSubjectLayoutPreset() {
  try {
    const raw = await readFile(subjectLayoutPresetPath, 'utf8')
    return normalizeDashboardSubjectLayoutPreset(JSON.parse(raw))
  } catch {
    return defaultDashboardSubjectLayoutPreset
  }
}

export async function saveDashboardSubjectLayoutPreset(
  preset: DashboardSubjectLayoutPreset
) {
  const normalized = normalizeDashboardSubjectLayoutPreset(preset)
  await mkdir(path.dirname(subjectLayoutPresetPath), { recursive: true })
  await writeFile(
    subjectLayoutPresetPath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    'utf8'
  )

  return normalized
}
