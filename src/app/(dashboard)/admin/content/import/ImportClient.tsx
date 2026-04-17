'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Plus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AdminClientWrapper } from '@/components/admin/common'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { PageHeroTitle } from '@/components/shared/PageHeroTitle'
import { StatsCards } from '@/components/admin/content/StatsCards'
import { BatchTable } from '@/components/admin/content/BatchTable'
import { AdminActivityActions } from '@/components/admin/content/AdminActivityActions'
import { NewBatchImportModal } from '@/components/admin/content/NewBatchImportModal'
import { getSubjectLabel, type UiLang } from '@/lib/subjects'
import {
  getImportDashboardStats,
  getImportTasks,
} from '@/actions/content-pipeline/import-service'
import { mapImportTaskToBatchData } from '@/lib/content-pipeline/mappers'
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

function normalizeBatches(rawBatches: BatchData[]): BatchData[] {
  return (rawBatches || []).map((batch) => ({
    ...batch,
    createdAt: toDate(batch.createdAt),
  }))
}

interface ImportClientProps {
  userRole: string
  userLanguage: UiLang
  initialSubjects: RawSubject[]
  initialBatches: BatchData[]
  initialPage: number
  initialPageSize: number
  initialTotalTasks: number
  initialTasksError?: string | null
  initialStats: StatsData
  initialAuditLogs: AuditLogEntry[]
}

export function ImportClient({
  userRole,
  userLanguage,
  initialSubjects,
  initialBatches,
  initialPage,
  initialPageSize,
  initialTotalTasks,
  initialTasksError,
  initialStats,
  initialAuditLogs,
}: ImportClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const normalizedInitialBatches = useMemo(
    () => normalizeBatches(initialBatches || []),
    [initialBatches]
  )

  const subjects = useMemo(
    () => buildLocalizedSubjects(initialSubjects || [], userLanguage),
    [initialSubjects, userLanguage]
  )

  const [batches, setBatches] = useState<BatchData[]>(normalizedInitialBatches)
  const [totalTasks, setTotalTasks] = useState(initialTotalTasks)
  const [stats, setStats] = useState<StatsData>(initialStats)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(new Date())

  useEffect(() => {
    setBatches(normalizedInitialBatches)
  }, [normalizedInitialBatches])

  useEffect(() => {
    setTotalTasks(initialTotalTasks)
  }, [initialTotalTasks])

  useEffect(() => {
    setStats(initialStats)
  }, [initialStats])

  useEffect(() => {
    if (!['ADMIN', 'TEACHER'].includes(userRole)) return

    void fetch('/api/admin/content/import/consume', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ trigger: 'import-page-mount' }),
    }).catch(() => undefined)
  }, [userRole])

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

  const handleImportQueued = (optimisticBatch: BatchData) => {
    if (initialPage === 1) {
      setBatches((prev) => {
        const next = [optimisticBatch, ...prev]
        return next.slice(0, initialPageSize)
      })
    } else {
      router.push(pathname)
    }
    setTotalTasks((prev) => prev + 1)
    setStats((prev) => ({
      ...prev,
      activeBatches: prev.activeBatches + 1,
      tasksToday: prev.tasksToday + 1,
    }))
    setLastSyncedAt(new Date())
  }

  const handleImportQueueFailed = (batchId: string) => {
    setBatches((prev) => prev.filter((batch) => batch.id !== batchId))
    setTotalTasks((prev) => Math.max(0, prev - 1))
    setStats((prev) => ({
      ...prev,
      activeBatches: Math.max(0, prev.activeBatches - 1),
      tasksToday: Math.max(0, prev.tasksToday - 1),
    }))
    setLastSyncedAt(new Date())
  }

  useEffect(() => {
    if (!hasActiveBatches) return undefined

    let disposed = false

    const syncLiveImportData = async () => {
      if (disposed) return
      setIsAutoRefreshing(true)
      try {
        const [tasksResult, statsResult] = await Promise.all([
          getImportTasks({
            limit: initialPageSize,
            offset: (initialPage - 1) * initialPageSize,
          }),
          getImportDashboardStats(),
        ])

        if (!disposed && tasksResult.success && tasksResult.data) {
          const nextBatches = normalizeBatches(
            tasksResult.data.tasks.map(mapImportTaskToBatchData)
          )
          setBatches(nextBatches)
          setTotalTasks(tasksResult.data.total)
        }

        if (!disposed && statsResult.success && statsResult.data) {
          setStats(statsResult.data)
        }

        if (!disposed) {
          setLastSyncedAt(new Date())
        }
      } finally {
        if (!disposed) {
          setIsAutoRefreshing(false)
        }
      }
    }

    void syncLiveImportData()

    const timer = setInterval(() => {
      void syncLiveImportData()
    }, 3000)

    return () => {
      disposed = true
      if (timer) clearInterval(timer)
    }
  }, [hasActiveBatches])

  const handleImportSuccess = () => {
    void (async () => {
      const [tasksResult, statsResult] = await Promise.all([
        getImportTasks({
          limit: initialPageSize,
          offset: (initialPage - 1) * initialPageSize,
        }),
        getImportDashboardStats(),
      ])

      if (tasksResult.success && tasksResult.data) {
        setBatches(
          normalizeBatches(tasksResult.data.tasks.map(mapImportTaskToBatchData))
        )
        setTotalTasks(tasksResult.data.total)
      } else {
        router.refresh()
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
      }
      setLastSyncedAt(new Date())
    })()
  }

  const handlePageChange = (nextPage: number, nextPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (nextPageSize !== initialPageSize) {
      if (nextPageSize === 10) {
        params.delete('pageSize')
      } else {
        params.set('pageSize', String(nextPageSize))
      }
      params.delete('page')
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname)
      return
    }

    if (nextPage <= 1) {
      params.delete('page')
    } else {
      params.set('page', String(nextPage))
    }
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname)
  }

  return (
    <AdminClientWrapper userRole={userRole}>
      <div className="min-w-0 px-3 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto w-full max-w-[1820px] min-w-0 space-y-3 rounded-[32px] border border-borderTone bg-page p-2.5 text-text-primary shadow-surface-lg sm:p-3">
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

          <BatchTable
            batches={batches}
            currentPage={initialPage}
            totalItems={totalTasks}
            pageSize={initialPageSize}
            onDataChanged={handleImportSuccess}
            onPageChange={handlePageChange}
            isAutoRefreshing={isAutoRefreshing}
            lastSyncedAt={lastSyncedAt}
          />
        </div>
      </div>

        <NewBatchImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          subjects={subjects}
          onImportQueued={handleImportQueued}
          onImportQueueFailed={handleImportQueueFailed}
          onImportSuccess={handleImportSuccess}
        />
    </AdminClientWrapper>
  )
}
