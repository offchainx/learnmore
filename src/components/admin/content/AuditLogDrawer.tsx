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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { History, Search, Globe } from 'lucide-react'
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
        <SheetHeader className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <SheetTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            操作日志
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500 dark:text-slate-400">
            最近的系统活动和用户操作
          </SheetDescription>
        </SheetHeader>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3.5 space-y-8">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-8 group">
                {/* Timeline Dot */}
                <div
                  className={`
                    absolute -left-[9px] top-1.5 w-[18px] h-[18px] rounded-full border-[3px] border-white dark:border-slate-900 z-10
                    ${log.type === 'success' ? 'bg-green-500' : ''}
                    ${log.type === 'error' ? 'bg-red-500' : ''}
                    ${log.type === 'warning' ? 'bg-orange-500' : ''}
                    ${log.type === 'info' ? 'bg-blue-500' : ''}
                  `}
                />

                {/* Content */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-0.5">
                    {log.timestamp}
                  </span>
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    <span className="font-semibold text-slate-900 dark:text-white">{log.user}</span>{' '}
                    {log.action}{' '}
                    <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                      {log.target}
                    </span>
                  </p>

                  {/* User Info */}
                  <div className="flex items-center mt-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700/50 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-colors">
                    <Avatar className="w-5 h-5 mr-2">
                      <AvatarImage src={log.avatar} alt={log.user} className="grayscale opacity-70" />
                      <AvatarFallback className="text-[10px]">
                        {log.user.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                      <Globe className="h-3 w-3" />
                      <span>通过 Web 端执行</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
            >
              <History className="h-3 w-3 mr-1" />
              查看更多历史记录
            </Button>
          </div>
        </div>

        {/* Footer Search */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="搜索日志..."
              className="pl-9 h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
