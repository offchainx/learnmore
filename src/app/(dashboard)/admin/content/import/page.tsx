import { prisma } from '@/lib/prisma'
import { getImportTasks } from '@/actions/content-pipeline/import-service'
import { ImportForm } from '@/components/admin/ImportForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '批量导入 - 内容管理',
}

export default async function ImportPage() {
  // Fetch subjects
  const subjects = await prisma.subject.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, name: true }
  })

  // Fetch import history
  const tasksResult = await getImportTasks({ limit: 10 })
  const tasks = tasksResult.success ? tasksResult.data?.tasks || [] : []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">批量导入题目</h1>
      <ImportForm subjects={subjects} initialTasks={tasks} />
    </div>
  )
}