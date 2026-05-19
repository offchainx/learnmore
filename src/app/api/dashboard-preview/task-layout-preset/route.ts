import { NextResponse } from 'next/server'
import {
  normalizeDashboardTaskLayoutPreset,
  type DashboardTaskLayoutPreset,
} from '@/components/dashboard/taskLayoutPreset'
import { saveDashboardTaskLayoutPreset } from '@/components/dashboard/taskLayoutPreset.server'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

export async function POST(request: Request) {
  if (!canAccessDashboardPreview(request.headers)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const body = (await request.json()) as unknown
    const preset = normalizeDashboardTaskLayoutPreset(body)
    const savedPreset = await saveDashboardTaskLayoutPreset(
      preset as DashboardTaskLayoutPreset
    )

    return NextResponse.json({
      ok: true,
      preset: savedPreset,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to save task preset',
      },
      { status: 500 }
    )
  }
}
