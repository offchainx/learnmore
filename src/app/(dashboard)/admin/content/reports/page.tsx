import { AdminClientWrapper } from "@/components/admin/common"
import { getProfile } from "@/actions/user/profile"
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
