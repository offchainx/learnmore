import { NextResponse } from 'next/server'
import {
  normalizeDashboardTimeLayoutPreset,
  type DashboardTimeLayoutPreset,
} from '@/components/dashboard/timeLayoutPreset'
import { saveDashboardTimeLayoutPreset } from '@/components/dashboard/timeLayoutPreset.server'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

export async function POST(request: Request) {
  if (!canAccessDashboardPreview(request.headers)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const body = (await request.json()) as unknown
    const preset = normalizeDashboardTimeLayoutPreset(body)
    const savedPreset = await saveDashboardTimeLayoutPreset(
      preset as DashboardTimeLayoutPreset
    )

    return NextResponse.json({ ok: true, preset: savedPreset })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to save time preset',
      },
      { status: 500 }
    )
  }
}
