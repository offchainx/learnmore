'use client'

import React, { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FolderArchive,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Pause,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { BatchData, BatchStatusUI } from '@/types/content-pipeline'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface BatchTableProps {
  batches: BatchData[]
}

const ITEMS_PER_PAGE = 4

export function BatchTable({ batches }: BatchTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Status Badge Helper
  const getStatusBadge = (status: BatchStatusUI) => {
    const baseClasses = 'px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border'
    switch (status) {
      case 'Processing':
        return (
          <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
            处理中
          </Badge>
        )
      case 'Completed':
        return (
          <Badge className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
            完成
          </Badge>
        )
      case 'Error':
        return (
          <Badge className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
            错误
          </Badge>
        )
      case 'Queued':
      case 'Pending':
        return (
          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
            排队中
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Status Icon Helper
  const getStatusIcon = (status: BatchStatusUI) => {
    switch (status) {
      case 'Processing':
        return (
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <FolderArchive className="h-5 w-5" />
          </div>
        )
      case 'Completed':
        return (
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        )
      case 'Error':
        return (
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
          </div>
        )
      default:
        return (
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
            <Clock className="h-5 w-5" />
          </div>
        )
    }
  }

  // Progress Bar Color Helper
  const getProgressColor = (status: BatchStatusUI) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-600'
      case 'Completed':
        return 'bg-green-500'
      case 'Error':
        return 'bg-red-500'
      default:
        return 'bg-slate-500'
    }
  }

  // Filter batches
  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.subject.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredBatches.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedBatches = filteredBatches.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Filter Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-900/50">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
          </div>
          <Input
            className="pl-10 h-10 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-blue-500"
            placeholder="搜索考试季、ID 或科目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              状态:
            </span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="Processing">处理中</SelectItem>
                <SelectItem value="Completed">已完成</SelectItem>
                <SelectItem value="Error">失败</SelectItem>
                <SelectItem value="Queued">排队中</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-slate-600 dark:text-slate-400">考试季 / 批次名称</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">科目 & 年份</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400 w-1/4">进度</TableHead>
              <TableHead className="text-slate-600 dark:text-slate-400">状态</TableHead>
              <TableHead className="text-right text-slate-600 dark:text-slate-400">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBatches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500 dark:text-slate-400">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              paginatedBatches.map((batch) => (
                <TableRow
                  key={batch.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  <TableCell>
                    <div className="flex items-center">
                      {getStatusIcon(batch.status)}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                          {batch.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ID: {batch.id} • {batch.fileCount} 文件
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-700 dark:text-slate-300">{batch.subject}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{batch.year}</div>
                  </TableCell>
                  <TableCell>
                    <div className="w-full">
                      <div className="flex justify-between text-xs mb-1">
                        <span
                          className={`font-medium ${
                            batch.status === 'Error'
                              ? 'text-red-600 dark:text-red-400'
                              : batch.status === 'Processing'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {batch.statusMessage || batch.status}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">{batch.progress}%</span>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-slate-200 dark:bg-slate-700/50">
                        <div
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${getProgressColor(
                            batch.status
                          )}`}
                          style={{ width: `${batch.progress}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(batch.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {batch.status === 'Processing' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pause className="h-4 w-4 text-slate-400" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="bg-white dark:bg-slate-900 px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between sm:px-6">
        <div className="flex-1 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              显示{' '}
              <span className="font-medium text-slate-900 dark:text-white">
                {filteredBatches.length > 0 ? startIndex + 1 : 0}
              </span>{' '}
              到{' '}
              <span className="font-medium text-slate-900 dark:text-white">
                {Math.min(endIndex, filteredBatches.length)}
              </span>{' '}
              共 <span className="font-medium text-slate-900 dark:text-white">{filteredBatches.length}</span>{' '}
              批次
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-l-md border-slate-200 dark:border-slate-800"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant="outline"
                  className={`h-9 px-4 border-slate-200 dark:border-slate-800 ${
                    currentPage === page
                      ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                      : ''
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-r-md border-slate-200 dark:border-slate-800"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
