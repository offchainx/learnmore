'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { History, Plus, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AdminClientWrapper } from '@/components/admin/common'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { PageHeroTitle } from '@/components/shared/PageHeroTitle'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import { pageTableShellClass } from '@/components/shared/pageSurfaces'
import { StatsCards } from '@/components/admin/content/StatsCards'
import { BatchTable } from '@/components/admin/content/BatchTable'
import { AuditLogDrawer } from '@/components/admin/content/AuditLogDrawer'
import { NewBatchImportModal } from '@/components/admin/content/NewBatchImportModal'
import { mapImportTaskToBatchData } from '@/lib/content-pipeline/mappers'
import { getSubjectLabel, type UiLang } from '@/lib/subjects'
import type {
  AuditLogEntry,
  ImportTask,
  StatsData,
} from '@/types/content-pipeline'

interface RawSubject {
  id: string
  key: string
  name: string
}

function buildLocalizedSubjects(
  subjects: RawSubject[],
  language: UiLang
): Array<{ id: string; name: string }> {
  return subjects.map((subject) => ({
    id: subject.id,
    name: getSubjectLabel(subject.key, language, subject.name),
  }))
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value))
}

interface ImportClientProps {
  userRole: string
  userLanguage: UiLang
  initialSubjects: RawSubject[]
  initialHistory: ImportTask[]
  initialTasksError?: string | null
  initialStats: StatsData
}

export function ImportClient({
  userRole,
  userLanguage,
  initialSubjects,
  initialHistory,
  initialTasksError,
  initialStats,
}: ImportClientProps) {
  const router = useRouter()

  const history = useMemo<ImportTask[]>(
    () =>
      (initialHistory || []).map((task) => ({
        ...task,
        createdAt: toDate(task.createdAt),
        processedAt: task.processedAt ? toDate(task.processedAt) : null,
      })),
    [initialHistory]
  )

  const subjects = useMemo(
    () => buildLocalizedSubjects(initialSubjects || [], userLanguage),
    [initialSubjects, userLanguage]
  )

  const batches = useMemo(
    () => history.map(mapImportTaskToBatchData),
    [history]
  )

  const stats = useMemo<StatsData>(() => initialStats, [initialStats])
  const hasActiveBatches = useMemo(
    () =>
      history.some(
        (task) =>
          task.status === 'PROCESSING' || task.status === 'PENDING'
      ),
    [history]
  )

  const auditLogs = useMemo<AuditLogEntry[]>(
    () =>
      history.slice(0, 20).map((task) => ({
        id: task.id,
        user: 'System',
        avatar: '',
        action:
          task.status === 'COMPLETED'
            ? '完成导入任务'
            : task.status === 'FAILED'
              ? '导入任务失败'
              : task.status === 'PROCESSING'
                ? '开始处理导入任务'
                : '创建导入任务',
        target: task.filename,
        timestamp: format(task.createdAt, 'yyyy-MM-dd HH:mm:ss'),
        type:
          task.status === 'COMPLETED'
            ? 'success'
            : task.status === 'FAILED'
              ? 'error'
              : task.status === 'PROCESSING'
                ? 'info'
                : 'warning',
      })),
    [history]
  )

  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isRefreshing, startRefresh] = useTransition()

  useEffect(() => {
    if (!hasActiveBatches) return undefined

    const timer = setInterval(() => {
      router.refresh()
    }, 5000)

    return () => clearInterval(timer)
  }, [hasActiveBatches, router])

  const handleImportSuccess = () => {
    router.refresh()
  }

  const handleManualRefresh = () => {
    startRefresh(() => {
      router.refresh()
    })
  }

  return (
    <AdminClientWrapper userRole={userRole}>
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto w-full max-w-[1820px] space-y-3 rounded-[32px] border border-borderTone bg-page p-2.5 text-text-primary shadow-surface-lg sm:p-3">
          <PageHeroShell
            className="sm:py-4.5 px-4 py-4 sm:px-5"
            title={
              <PageHeroTitle
                title="批量导入"
                capsuleLabel="Import Pipeline v1.0"
              />
            }
            subtitle="统一管理 PDF、图像与网页抓取导入任务。"
            titleClassName="font-semibold"
            actions={
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="h-10 rounded-full border-borderTone bg-surface px-4 text-text-primary hover:bg-surface-subtle hover:text-text-primary"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                  刷新
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAuditDrawerOpen(true)}
                  className="h-10 rounded-full border-borderTone bg-surface px-4 text-text-primary hover:bg-surface-subtle hover:text-text-primary"
                >
                  <History className="h-4 w-4" />
                  操作日志
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsImportModalOpen(true)}
                  className="h-10 rounded-full bg-[#3B82F6] px-4 text-white hover:bg-[#2F6FDD]"
                >
                  <Plus className="h-4 w-4" />
                  批量导入
                </Button>
              </div>
            }
          />

          <StatsCards stats={stats} />

          {initialTasksError ? (
            <Alert
              variant="destructive"
              className="border-rose-200 bg-rose-50 text-rose-700"
            >
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              <AlertTitle>导入任务列表加载失败</AlertTitle>
              <AlertDescription className="text-rose-600">
                {initialTasksError}
                <span className="ml-1">
                  可先点击右上角“刷新”重试；任务原始记录仍在数据库
                  `source_files` 表。
                </span>
              </AlertDescription>
            </Alert>
          ) : null}

          <div className={pageTableShellClass}>
            <SectionBlockHeader
              title="批量任务管理"
              description="查看、重试和清理所有导入批次。"
              className="border-b border-borderTone px-5 py-5 dark:border-[#24324D]"
            />
            <div className="p-4 sm:p-5">
              <BatchTable
                batches={batches}
                onDataChanged={handleImportSuccess}
              />
            </div>
          </div>
        </div>
      </div>

      <AuditLogDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        logs={auditLogs}
      />

      <NewBatchImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        subjects={subjects}
        onImportSuccess={handleImportSuccess}
      />
    </AdminClientWrapper>
  )
}
