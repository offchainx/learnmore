import { ImportClient } from './ImportClient'
import { getImportDashboardStats, getImportTasks } from '@/actions/content-pipeline/import-service'
import { getImportSubjects } from '@/actions/courses/subject'
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

  const userLanguage =
    profile.settings?.language === 'en' || profile.settings?.language === 'ms'
      ? profile.settings.language
      : 'zh'

  // Fetch subjects
  const subjectsResult = await getImportSubjects()
  const subjects = subjectsResult.success ? subjectsResult.data || [] : []

  // Fetch import history
  const tasksResult = await getImportTasks({ limit: 10 })
  const tasks = tasksResult.success ? tasksResult.data?.tasks || [] : []

  // Fetch dashboard stats
  const statsResult = await getImportDashboardStats()
  const stats = statsResult.success && statsResult.data
    ? statsResult.data
    : {
        tasksToday: 0,
        completedTasks: 0,
        failedTasks: 0,
        successRate: 0,
        pendingReviewQuestions: 0,
        importedQuestions7d: 0,
        activeBatches: 0,
        storageUsed: 0,
        storageLimit: 1024,
      }

  return (
    <ImportClient 
      userRole={profile.role}
      userLanguage={userLanguage}
      initialSubjects={subjects}
      initialHistory={tasks}
      initialStats={stats}
    />
  )
}
