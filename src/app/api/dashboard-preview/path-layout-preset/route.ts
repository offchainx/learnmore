import { NextResponse } from 'next/server'
import {
  normalizeDashboardPathLayoutPreset,
  type DashboardPathLayoutPreset,
} from '@/components/dashboard/pathLayoutPreset'
import { saveDashboardPathLayoutPreset } from '@/components/dashboard/pathLayoutPreset.server'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

export async function POST(request: Request) {
  if (!canAccessDashboardPreview(request.headers)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const body = (await request.json()) as unknown
    const preset = normalizeDashboardPathLayoutPreset(body)
    const savedPreset = await saveDashboardPathLayoutPreset(
      preset as DashboardPathLayoutPreset
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
          error instanceof Error ? error.message : 'Failed to save path preset',
      },
      { status: 500 }
    )
  }
}
