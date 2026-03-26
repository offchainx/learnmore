'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AdminClientWrapper } from '@/components/admin/common'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { PageHeroTitle } from '@/components/shared/PageHeroTitle'
import { SectionBlockHeader } from '@/components/shared/SectionBlockHeader'
import { pageTableShellClass } from '@/components/shared/pageSurfaces'
import { StatsCards } from '@/components/admin/content/StatsCards'
import { BatchTable } from '@/components/admin/content/BatchTable'
import { AdminActivityActions } from '@/components/admin/content/AdminActivityActions'
import { NewBatchImportModal } from '@/components/admin/content/NewBatchImportModal'
import { getSubjectLabel, type UiLang } from '@/lib/subjects'
import type {
  AuditLogEntry,
  BatchData,
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
  initialBatches: BatchData[]
  initialTasksError?: string | null
  initialStats: StatsData
  initialAuditLogs: AuditLogEntry[]
}

export function ImportClient({
  userRole,
  userLanguage,
  initialSubjects,
  initialBatches,
  initialTasksError,
  initialStats,
  initialAuditLogs,
}: ImportClientProps) {
  const router = useRouter()

  const batches = useMemo<BatchData[]>(
    () =>
      (initialBatches || []).map((batch) => ({
        ...batch,
        createdAt: toDate(batch.createdAt),
      })),
    [initialBatches]
  )

  const subjects = useMemo(
    () => buildLocalizedSubjects(initialSubjects || [], userLanguage),
    [initialSubjects, userLanguage]
  )

  const stats = useMemo<StatsData>(() => initialStats, [initialStats])
  const auditLogs = useMemo<AuditLogEntry[]>(
    () => initialAuditLogs || [],
    [initialAuditLogs]
  )
  const hasActiveBatches = useMemo(
    () =>
      batches.some(
        (task) =>
          task.status === 'Processing' || task.status === 'Pending'
      ),
    [batches]
  )

  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

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
                <AdminActivityActions
                  logs={auditLogs}
                  auditTitle="导入操作日志"
                  auditDescription="基于 source_files 真实记录生成的近期导入活动。"
                  emptyText="当前还没有可显示的导入日志。"
                  searchPlaceholder="搜索批次名、操作人、状态备注..."
                  footerText={`当前显示 ${auditLogs.length} 条真实导入日志`}
                />
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

      <NewBatchImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        subjects={subjects}
        onImportSuccess={handleImportSuccess}
      />
    </AdminClientWrapper>
  )
}
