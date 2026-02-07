'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { ProcessingStatus } from '@prisma/client'
import { resumeFailedImport } from '@/actions/content-pipeline/import-service'
import { toast } from '@/components/ui/use-toast'

export interface ImportTask {
  id: string
  filename: string
  fileUrl: string
  status: ProcessingStatus
  ocrStatus: ProcessingStatus
  questionsCount: number
  createdAt: Date
  processedAt: Date | null
}

interface ImportHistoryTableProps {
  tasks: ImportTask[]
}

export function ImportHistoryTable({ tasks }: ImportHistoryTableProps) {
  const [isResuming, setIsResuming] = React.useState<string | null>(null)

  const handleResume = async (id: string) => {
    setIsResuming(id)
    try {
      const result = await resumeFailedImport({ sourceFileId: id })
      if (result.success) {
        toast({
          title: '已重新开始导入任务',
          description: '任务已加入队列',
        })
        // In a real app, we might want to refresh the list here
        // router.refresh()
      } else {
        toast({
          title: '重试失败',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (_) {
      toast({
        title: '重试失败',
        variant: 'destructive',
      })
    } finally {
      setIsResuming(null)
    }
  }

  const getStatusBadge = (status: ProcessingStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500 hover:bg-green-600">成功</Badge>
      case 'FAILED':
        return <Badge variant="destructive">失败</Badge>
      case 'PROCESSING':
        return <Badge className="bg-blue-500 hover:bg-blue-600">处理中</Badge>
      case 'PENDING':
        return <Badge variant="secondary">等待中</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>文件名</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>题目数</TableHead>
            <TableHead>导入时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                暂无导入记录
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate max-w-[200px]" title={task.filename}>
                      {task.filename}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(task.status)}
                </TableCell>
                <TableCell>{task.questionsCount}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(task.createdAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {task.status === 'FAILED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResume(task.id)}
                      disabled={isResuming === task.id}
                    >
                      <RefreshCw
                        className={cn(
                          "mr-2 h-4 w-4",
                          isResuming === task.id && "animate-spin"
                        )}
                      />
                      重试
                    </Button>
                  )}
                  {task.status === 'COMPLETED' && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/admin/content?sourceFileId=${task.id}`}>
                        查看
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}