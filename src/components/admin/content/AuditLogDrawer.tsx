'use client'

import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { History, Search } from 'lucide-react'
import { AuditLogEntry } from '@/types/content-pipeline'

interface AuditLogDrawerProps {
  isOpen: boolean
  onClose: () => void
  logs: AuditLogEntry[]
}

export function AuditLogDrawer({ isOpen, onClose, logs }: AuditLogDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:max-w-[400px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-borderTone dark:border-borderTone bg-surface-subtle dark:bg-surface-subtle">
          <SheetTitle className="text-lg font-semibold text-text-primary dark:text-text-primary flex items-center gap-2">
            <History className="h-5 w-5 text-text-secondary dark:text-text-secondary" />
            操作日志
          </SheetTitle>
          <SheetDescription className="text-xs text-text-secondary dark:text-text-secondary">
            最近的系统活动和用户操作
          </SheetDescription>
        </SheetHeader>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative ml-3.5 space-y-8 border-l border-borderTone dark:border-borderTone">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-8 group">
                {/* Timeline Dot */}
                <div
                  className={`
                    absolute -left-[9px] top-1.5 z-10 h-[18px] w-[18px] rounded-full border-[3px] border-surface dark:border-surface
                    ${log.type === 'success' ? 'bg-[hsl(var(--state-success-fg))]' : ''}
                    ${log.type === 'error' ? 'bg-[hsl(var(--state-danger-fg))]' : ''}
                    ${log.type === 'warning' ? 'bg-[hsl(var(--state-warning-fg))]' : ''}
                    ${log.type === 'info' ? 'bg-[hsl(var(--state-info-fg))]' : ''}
                  `}
                />

                {/* Content */}
                <div className="flex flex-col gap-1">
                  <span className="mb-0.5 text-xs font-mono text-text-secondary dark:text-text-secondary">
                    {log.timestamp}
                  </span>
                  <p className="text-sm text-text-primary dark:text-text-primary">
                    {log.comment}
                  </p>
                  <p className="text-sm text-text-secondary dark:text-text-secondary">
                    <span className="font-semibold text-text-primary dark:text-text-primary">{log.user}</span>{' '}
                    {log.action}{' '}
                    <span className="cursor-pointer text-primary hover:underline dark:text-primary">
                      {log.target}
                    </span>
                  </p>

                  {/* User Info */}
                  <div className="mt-2 flex items-center rounded-md border border-borderTone bg-surface-subtle p-2 transition-colors group-hover:border-[hsl(var(--border-strong))] dark:border-borderTone dark:bg-surface-subtle">
                    <History className="mr-2 h-3.5 w-3.5 shrink-0 text-text-tertiary dark:text-text-tertiary" />
                    <span className="truncate text-xs text-text-secondary dark:text-text-secondary">
                      通过 Web 端执行
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-text-secondary hover:text-primary dark:text-text-secondary dark:hover:text-primary"
            >
              <History className="h-3 w-3 mr-1" />
              查看更多历史记录
            </Button>
          </div>
        </div>

        {/* Footer Search */}
        <div className="border-t border-borderTone bg-surface-subtle p-4 dark:border-borderTone dark:bg-surface-subtle">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
            <Input
              placeholder="搜索记录 (如: 操作人、备注...)"
              className="h-9 border-borderTone bg-surface pl-9 dark:border-borderTone dark:bg-surface"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
