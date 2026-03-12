'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { History, Plus, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AdminClientWrapper } from '@/components/admin/common'
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
    const timer = setInterval(() => {
      router.refresh()
    }, 5000)

    return () => clearInterval(timer)
  }, [router])

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
        <div className="mx-auto w-full max-w-[1820px] space-y-3 rounded-[32px] border border-[#24324D] bg-[#0B1220] p-2.5 sm:p-3">
          <div className="relative overflow-hidden rounded-[28px] border border-[#24324D] bg-[linear-gradient(135deg,#111A2E_0%,#0F1A2F_55%,#0B1220_100%)] px-4 py-4 shadow-[0_22px_50px_rgba(2,8,23,0.35)] sm:px-5 sm:py-4">
            <motion.div
              className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2563EB]/10 blur-3xl"
              animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.24, 0.12] }}
              transition={{ duration: 5.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 left-16 h-24 w-24 rounded-full bg-[#22C55E]/10 blur-3xl"
              animate={{ scale: [1, 1.16, 1], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 6.2, repeat: Infinity, delay: 0.8 }}
            />

            <div className="relative flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-[#E6EDF7] sm:text-[30px]">
                      批量导入
                    </h1>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#274066] bg-[#10203C] px-2.5 py-1 text-[11px] font-medium text-[#D6E7FF]">
                      <Sparkles className="h-3 w-3 text-[#60A5FA]" />
                      Import Pipeline v1.0
                    </div>
                  </div>
                  <p className="text-sm text-[#B2C3DA]">
                    统一管理 PDF/图像与网页抓取导入任务
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 border-[#24324D] bg-[#151F36] text-[#E6EDF7] hover:bg-[#1A2744] hover:text-[#E6EDF7]"
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
                  className="flex items-center gap-2 border-[#24324D] bg-[#151F36] text-[#E6EDF7] hover:bg-[#1A2744] hover:text-[#E6EDF7]"
                >
                  <History className="h-4 w-4" />
                  操作日志
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-2 bg-[#3B82F6] text-white hover:bg-[#2F6FDD]"
                >
                  <Plus className="h-4 w-4" />
                  批量导入
                </Button>
              </div>
            </div>
          </div>

          <StatsCards stats={stats} />

          {initialTasksError ? (
            <Alert
              variant="destructive"
              className="border-[#7F1D1D] bg-[#2A1118] text-[#FECACA]"
            >
              <AlertTriangle className="h-4 w-4 text-[#F87171]" />
              <AlertTitle>导入任务列表加载失败</AlertTitle>
              <AlertDescription className="text-[#FCA5A5]">
                {initialTasksError}
                <span className="ml-1">
                  可先点击右上角“刷新”重试；任务原始记录仍在数据库
                  `source_files` 表。
                </span>
              </AlertDescription>
            </Alert>
          ) : null}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#E6EDF7]">
                  批量任务管理
                </h2>
                <p className="text-sm text-[#9FB0C9]">
                  查看、重试和清理所有导入批次
                </p>
              </div>
            </div>
            <BatchTable batches={batches} onDataChanged={handleImportSuccess} />
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
