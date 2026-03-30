import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/actions/user/auth'
import { ensurePendingWebImportQueueRunning } from '@/actions/content-pipeline/import-service'

export async function POST() {
  const currentUser = await getCurrentUser()
  if (!currentUser || !['ADMIN', 'TEACHER'].includes(currentUser.role)) {
    return NextResponse.json(
      {
        success: false,
        error: '未授权',
      },
      { status: 401 }
    )
  }

  await ensurePendingWebImportQueueRunning()

  return NextResponse.json({
    success: true,
    queued: true,
  })
}
