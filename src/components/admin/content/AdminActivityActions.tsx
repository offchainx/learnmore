'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { History, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuditLogDrawer } from '@/components/admin/content/AuditLogDrawer'
import type { AuditLogEntry } from '@/types/content-pipeline'

interface AdminActivityActionsProps {
  logs: AuditLogEntry[]
  auditTitle?: string
  auditDescription?: string
  emptyText?: string
  searchPlaceholder?: string
  footerText?: string
}

export function AdminActivityActions({
  logs,
  auditTitle,
  auditDescription,
  emptyText,
  searchPlaceholder,
  footerText,
}: AdminActivityActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false)

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isPending}
          className="h-10 rounded-full border-borderTone bg-surface px-4 text-text-primary hover:bg-surface-subtle hover:text-text-primary"
        >
          <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
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
      </div>

      <AuditLogDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
        logs={logs}
        title={auditTitle}
        description={auditDescription}
        emptyText={emptyText}
        searchPlaceholder={searchPlaceholder}
        footerText={footerText}
      />
    </>
  )
}
