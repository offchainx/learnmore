'use client'

import React, { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, History, Plus, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { AdminClientWrapper } from '@/components/admin/common'
import { StatsCards } from '@/components/admin/content/StatsCards'
import { BatchTable } from '@/components/admin/content/BatchTable'
import { AuditLogDrawer } from '@/components/admin/content/AuditLogDrawer'
import { NewBatchImportModal } from '@/components/admin/content/NewBatchImportModal'
import { mapImportTaskToBatchData } from '@/lib/content-pipeline/mappers'
import type { AuditLogEntry, ImportTask, StatsData } from '@/types/content-pipeline'
import { format } from 'date-fns'

type UiLang = 'zh' | 'en' | 'ms'

interface RawSubject {
  id: string
  key: string
  name: string
}

const SUBJECT_LABELS: Record<string, Record<UiLang, string>> = {
  chinese: { zh: '中文', en: 'Chinese', ms: 'Bahasa Cina' },
  malay: { zh: '马来西亚文', en: 'Malay', ms: 'Bahasa Melayu' },
  english: { zh: '英文', en: 'English', ms: 'Bahasa Inggeris' },
  math: { zh: '数学', en: 'Mathematics', ms: 'Matematik' },
  science: { zh: '科学', en: 'Science', ms: 'Sains' },
  history: { zh: '历史', en: 'History', ms: 'Sejarah' },
  geography: { zh: '地理', en: 'Geography', ms: 'Geografi' },
  other: { zh: '其他', en: 'Other', ms: 'Lain-lain' },
}

function buildLocalizedSubjects(subjects: RawSubject[], language: UiLang): Array<{ id: string; name: string }> {
  return subjects.map((subject) => ({
    id: subject.id,
    name: SUBJECT_LABELS[subject.key]?.[language] || subject.name,
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
  initialStats: StatsData
}

export function ImportClient({ userRole, userLanguage, initialSubjects, initialHistory, initialStats }: ImportClientProps) {
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

  const subjects = useMemo(() => buildLocalizedSubjects(initialSubjects || [], userLanguage), [initialSubjects, userLanguage])

  const batches = useMemo(() => history.map(mapImportTaskToBatchData), [history])

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
    // Refresh page or fetch new data
    router.refresh()
  }

  const handleManualRefresh = () => {
    startRefresh(() => {
      router.refresh()
    })
  }

  return (
    <AdminClientWrapper userRole={userRole}>
      <div className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto max-w-[1440px] rounded-xl border border-[#24324D] bg-[#0B1220] p-3 sm:p-4 space-y-4">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-[#24324D] bg-[#111A2E] px-4 py-4">
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/content/review"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#151F36] border border-[#24324D] hover:bg-[#1A2744] transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-[#9FB0C9]" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#E6EDF7]">批量导入</h1>
                <p className="text-sm text-[#9FB0C9]">
                  统一管理 PDF/图像与网页抓取导入任务
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-[#151F36] px-3 py-1.5 rounded-md border border-[#24324D]">
                <span className="text-xs font-semibold text-[#9FB0C9]">Import Pipeline v1.0</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 border-[#24324D] bg-[#151F36] text-[#E6EDF7] hover:bg-[#1A2744] hover:text-[#E6EDF7]"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
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

          {/* Stats Cards */}
          <StatsCards stats={stats} />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#E6EDF7]">批量任务管理</h2>
                <p className="text-sm text-[#9FB0C9]">查看和管理所有导入批次</p>
              </div>
            </div>
            <BatchTable batches={batches} onDataChanged={handleImportSuccess} />
          </div>
        </div>
      </div>

      {/* Audit Log Drawer */}
      <AuditLogDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        logs={auditLogs}
      />

      {/* New Batch Import Modal */}
      <NewBatchImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        subjects={subjects}
        onImportSuccess={handleImportSuccess}
      />
    </AdminClientWrapper>
  )
}
