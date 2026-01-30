import { AdminClientWrapper } from "@/components/admin/AdminClientWrapper"
import { getProfile } from "@/actions/profile"
import { redirect } from "next/navigation"
import { ReportsClient } from "@/components/admin/content-reports/ReportsClient"

export default async function ReportsPage() {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }

  return (
    <AdminClientWrapper userRole={profile.role}>
      <ReportsClient />
    </AdminClientWrapper>
  )
}
