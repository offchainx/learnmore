import { NextResponse } from 'next/server'
import {
  normalizeDashboardSubjectLayoutPreset,
  type DashboardSubjectLayoutPreset,
} from '@/components/dashboard/subjectLayoutPreset'
import { saveDashboardSubjectLayoutPreset } from '@/components/dashboard/subjectLayoutPreset.server'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

export async function POST(request: Request) {
  if (!canAccessDashboardPreview(request.headers)) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  try {
    const body = (await request.json()) as unknown
    const preset = normalizeDashboardSubjectLayoutPreset(body)
    const savedPreset = await saveDashboardSubjectLayoutPreset(
      preset as DashboardSubjectLayoutPreset
    )

    return NextResponse.json({ ok: true, preset: savedPreset })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save subject preset',
      },
      { status: 500 }
    )
  }
}
