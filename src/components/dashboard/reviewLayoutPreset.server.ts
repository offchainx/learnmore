import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  defaultDashboardReviewLayoutPreset,
  normalizeDashboardReviewLayoutPreset,
  type DashboardReviewLayoutPreset,
} from './reviewLayoutPreset'

const reviewLayoutPresetPath = path.join(
  process.cwd(),
  'src/components/dashboard/dashboard-review-layout-preset.json'
)

export async function getDashboardReviewLayoutPreset() {
  try {
    const raw = await readFile(reviewLayoutPresetPath, 'utf8')
    return normalizeDashboardReviewLayoutPreset(JSON.parse(raw))
  } catch {
    return defaultDashboardReviewLayoutPreset
  }
}

export async function saveDashboardReviewLayoutPreset(
  preset: DashboardReviewLayoutPreset
) {
  const normalized = normalizeDashboardReviewLayoutPreset(preset)
  await mkdir(path.dirname(reviewLayoutPresetPath), { recursive: true })
  await writeFile(
    reviewLayoutPresetPath,
    `${JSON.stringify(normalized, null, 2)}\n`,
    'utf8'
  )

  return normalized
}
