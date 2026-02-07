'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles, History, Plus, HelpCircle, FileText as FileTextIcon, AlertCircle as AlertCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { AdminClientWrapper } from '@/components/admin/common'
import { StatsCards } from '@/components/admin/content/StatsCards'
import { BatchTable } from '@/components/admin/content/BatchTable'
import { AuditLogDrawer } from '@/components/admin/content/AuditLogDrawer'
import { NewBatchImportModal } from '@/components/admin/content/NewBatchImportModal'
import { MOCK_STATS, MOCK_BATCHES, MOCK_AUDIT_LOGS } from '@/__dev__/mock/content-pipeline-data'

interface ImportClientProps {
  userRole: string
  initialSubjects: any[]
  initialHistory: any[]
}

export function ImportClient({ userRole, initialSubjects, initialHistory }: ImportClientProps) {
  const router = useRouter()

  // 状态管理
  const [subjects] = useState<any[]>(initialSubjects)
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const handleImportSuccess = () => {
    // Refresh page or fetch new data
    router.refresh()
  }

  return (
    <AdminClientWrapper userRole={userRole}>
      <div className="min-h-screen py-10 px-4">
        <div className="container mx-auto space-y-8 max-w-7xl">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/content/review"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  批量导入 <span className="text-blue-600 dark:text-blue-400">AI</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  上传试卷，开启 AI 自动化题目识别
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 fill-blue-600/20" />
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">AI Pipeline v1.0</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAuditDrawerOpen(true)}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                操作日志
              </Button>
              <Button
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                批量导入
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={MOCK_STATS} />

          {/* Batch Management Table */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">批量任务管理</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">查看和管理所有导入批次</p>
              </div>
            </div>
            <BatchTable batches={MOCK_BATCHES} />
          </div>

          {/* Footer Links */}
          <div className="mt-8 flex justify-center items-center gap-6 text-xs text-slate-600 dark:text-slate-400 pb-4">
            <button className="flex items-center hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors">
              <HelpCircle className="h-4 w-4 mr-1" />
              帮助中心
            </button>
            <button className="flex items-center hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors">
              <FileTextIcon className="h-4 w-4 mr-1" />
              使用文档
            </button>
            <button className="flex items-center hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer transition-colors">
              <AlertCircleIcon className="h-4 w-4 mr-1" />
              报告问题
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Drawer */}
      <AuditLogDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        logs={MOCK_AUDIT_LOGS}
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
