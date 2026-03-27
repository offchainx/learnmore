import { ImportClient } from './ImportClient'
import {
  getImportActivityLogs,
  getImportDashboardStats,
  getImportTasks,
} from '@/actions/content-pipeline/import-service'
import { getImportSubjects } from '@/actions/courses/subject'
import { getProfile } from '@/actions/user/profile'
import { mapImportTaskToBatchData } from '@/lib/content-pipeline/mappers'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '批量导入 - 内容管理',
}

interface ImportPageProps {
  searchParams?: Promise<{
    page?: string
  }>
}

export default async function ImportPage({ searchParams }: ImportPageProps) {
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

  const resolvedSearchParams = (await searchParams) || {}
  const parsedPage = Number(resolvedSearchParams.page)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const pageSize = 10

  // Fetch import history
  const tasksResult = await getImportTasks({
    limit: pageSize,
    offset: (page - 1) * pageSize,
  })
  const tasks = tasksResult.success ? tasksResult.data?.tasks || [] : []
  const batches = tasks.map(mapImportTaskToBatchData)
  const totalTasks = tasksResult.success ? tasksResult.data?.total || 0 : 0
  const tasksError = tasksResult.success ? null : tasksResult.error || '导入任务查询失败'

  // Fetch dashboard stats
  const [statsResult, auditLogsResult] = await Promise.all([
    getImportDashboardStats(),
    getImportActivityLogs({ limit: 40 }),
  ])
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
  const auditLogs =
    auditLogsResult.success && auditLogsResult.data ? auditLogsResult.data : []

  return (
    <ImportClient 
      userRole={profile.role}
      userLanguage={userLanguage}
      initialSubjects={subjects}
      initialBatches={batches}
      initialPage={page}
      initialPageSize={pageSize}
      initialTotalTasks={totalTasks}
      initialTasksError={tasksError}
      initialStats={stats}
      initialAuditLogs={auditLogs}
    />
  )
}
