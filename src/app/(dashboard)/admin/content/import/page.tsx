import { redirect } from "next/navigation"
import { getProfile } from "@/actions/profile"
import { getAllSubjects } from "@/actions/subject"
import { getImportTasks } from "@/actions/content-pipeline/import-service"
import { ImportClient } from "./ImportClient"

export const dynamic = 'force-dynamic'

export default async function ContentImportPage() {
  const profile = await getProfile()
  
  if (!profile) {
    redirect('/login')
  }

  // 预加载数据
  const [subjectsRes, historyRes] = await Promise.all([
    getAllSubjects(),
    getImportTasks({ limit: 5 })
  ])

  return (
    <ImportClient 
      userRole={profile.role} 
      initialSubjects={subjectsRes.success ? (subjectsRes.data || []) : []}
      initialHistory={historyRes.success && historyRes.data ? historyRes.data.tasks : []}
    />
  )
}
