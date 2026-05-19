import { NextResponse } from 'next/server'
import {
  normalizeDashboardReviewLayoutPreset,
  type DashboardReviewLayoutPreset,
} from '@/components/dashboard/reviewLayoutPreset'
import { saveDashboardReviewLayoutPreset } from '@/components/dashboard/reviewLayoutPreset.server'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

export async function POST(request: Request) {
  if (!canAccessDashboardPreview(request.headers)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const body = (await request.json()) as unknown
    const preset = normalizeDashboardReviewLayoutPreset(body)
    const savedPreset = await saveDashboardReviewLayoutPreset(
      preset as DashboardReviewLayoutPreset
    )

    return NextResponse.json({ ok: true, preset: savedPreset })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save review preset',
      },
      { status: 500 }
    )
  }
}
