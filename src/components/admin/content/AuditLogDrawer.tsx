'use client'

import React, { useMemo, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { History, Search } from 'lucide-react'
import { AuditLogEntry } from '@/types/content-pipeline'

interface AuditLogDrawerProps {
  isOpen: boolean
  onClose: () => void
  logs: AuditLogEntry[]
  title?: string
  description?: string
  emptyText?: string
  searchPlaceholder?: string
  footerText?: string
}

export function AuditLogDrawer({
  isOpen,
  onClose,
  logs,
  title = '操作日志',
  description = '最近的系统活动和用户操作',
  emptyText = '当前没有可显示的日志。',
  searchPlaceholder = '搜索记录 (如: 操作人、目标、备注...)',
  footerText,
}: AuditLogDrawerProps) {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const filteredLogs = useMemo(() => {
    if (!normalizedQuery) return logs
    return logs.filter((log) =>
      [
        log.user,
        log.action,
        log.target,
        log.comment,
        log.timestamp,
        log.module,
        log.result,
        log.before,
        log.after,
        log.failureReason,
        log.idempotencyKey,
        log.source,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedQuery)
        )
    )
  }, [logs, normalizedQuery])

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:max-w-[400px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-borderTone dark:border-borderTone bg-surface-subtle dark:bg-surface-subtle">
          <SheetTitle className="text-lg font-semibold text-text-primary dark:text-text-primary flex items-center gap-2">
            <History className="h-5 w-5 text-text-secondary dark:text-text-secondary" />
            {title}
          </SheetTitle>
          <SheetDescription className="text-xs text-text-secondary dark:text-text-secondary">
            {description}
          </SheetDescription>
        </SheetHeader>

        <div className="border-b border-borderTone bg-surface-subtle p-4 dark:border-borderTone dark:bg-surface-subtle">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 border-borderTone bg-surface pl-9 dark:border-borderTone dark:bg-surface"
            />
          </div>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredLogs.length > 0 ? (
            <div className="relative ml-3.5 space-y-8 border-l border-borderTone dark:border-borderTone">
              {filteredLogs.map((log) => (
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
                      <span className="font-semibold text-text-primary dark:text-text-primary">
                        {log.user}
                      </span>{' '}
                      {log.action}{' '}
                      <span className="cursor-pointer text-primary hover:underline dark:text-primary">
                        {log.target}
                      </span>
                    </p>

                    {log.module || log.result ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {log.module ? (
                          <span className="rounded-full border border-borderTone bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                            模块：{log.module}
                          </span>
                        ) : null}
                        {log.result ? (
                          <span className="rounded-full border border-borderTone bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary">
                            结果：{log.result}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    {log.before || log.after ? (
                      <div className="mt-3 grid gap-2">
                        {log.before ? (
                          <div className="rounded-md border border-borderTone bg-surface px-3 py-2">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                              变更前
                            </div>
                            <p className="mt-1 text-xs leading-5 text-text-secondary">
                              {log.before}
                            </p>
                          </div>
                        ) : null}
                        {log.after ? (
                          <div className="rounded-md border border-borderTone bg-surface px-3 py-2">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                              变更后
                            </div>
                            <p className="mt-1 text-xs leading-5 text-text-secondary">
                              {log.after}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {log.idempotencyKey || log.failureReason ? (
                      <div className="mt-3 grid gap-2">
                        {log.idempotencyKey ? (
                          <div className="rounded-md border border-borderTone bg-surface px-3 py-2">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                              幂等键
                            </div>
                            <p className="mt-1 break-all text-xs leading-5 text-text-secondary">
                              {log.idempotencyKey}
                            </p>
                          </div>
                        ) : null}
                        {log.failureReason ? (
                          <div className="rounded-md border border-borderTone bg-surface px-3 py-2">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                              失败原因
                            </div>
                            <p className="mt-1 text-xs leading-5 text-text-secondary">
                              {log.failureReason}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {/* User Info */}
                    <div className="mt-2 flex items-center rounded-md border border-borderTone bg-surface-subtle p-2 transition-colors group-hover:border-[hsl(var(--border-strong))] dark:border-borderTone dark:bg-surface-subtle">
                      <History className="mr-2 h-3.5 w-3.5 shrink-0 text-text-tertiary dark:text-text-tertiary" />
                      <span className="truncate text-xs text-text-secondary dark:text-text-secondary">
                        {log.source || '通过 Web 端执行'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-borderTone bg-surface-subtle px-4 py-8 text-center text-sm text-text-secondary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary">
              {emptyText}
            </div>
          )}
        </div>

        <div className="border-t border-borderTone bg-surface-subtle px-4 py-3 text-xs text-text-secondary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary">
          {footerText || `当前显示 ${filteredLogs.length} 条真实日志`}
        </div>
      </SheetContent>
    </Sheet>
  )
}
