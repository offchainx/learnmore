import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { canAccessDashboardPreview } from '@/lib/dashboard-preview-access'

export default async function UIKitDebugPage() {
  const requestHeaders = await headers()

  if (!canAccessDashboardPreview(requestHeaders)) {
    notFound()
  }

  redirect('/dashboard/preview')
}
