import { ImportClient } from './ImportClient'
import { getImportTasks } from '@/actions/content-pipeline/import-service'
import { getAllSubjects } from '@/actions/courses/subject'
import { getProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '批量导入 - 内容管理',
}

export default async function ImportPage() {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }

  // Fetch subjects
  const subjectsResult = await getAllSubjects()
  const subjects = subjectsResult.success ? subjectsResult.data || [] : []

  // Fetch import history
  const tasksResult = await getImportTasks({ limit: 10 })
  const tasks = tasksResult.success ? tasksResult.data?.tasks || [] : []

  return (
    <ImportClient 
      userRole={profile.role}
      initialSubjects={subjects}
      initialHistory={tasks}
    />
  )
}
