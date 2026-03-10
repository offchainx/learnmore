/**
 * Content Pipeline Mappers
 * 数据转换和映射函数
 *
 * 从 types/content-pipeline.ts 移动过来
 * types/ 目录应该只包含纯类型定义
 */

import { ProcessingStatus } from '@prisma/client'
import type { BatchStatusUI, BatchData, ImportTask } from '@/types/content-pipeline'

/**
 * 将数据库 ProcessingStatus 转换为 UI BatchStatusUI
 */
export function mapProcessingStatusToBatchStatus(status: ProcessingStatus): BatchStatusUI {
  switch (status) {
    case 'COMPLETED':
      return 'Completed'
    case 'FAILED':
      return 'Error'
    case 'PROCESSING':
      return 'Processing'
    case 'PENDING':
      return 'Queued'
    default:
      return 'Pending'
  }
}

/**
 * 将 ImportTask 转换为 BatchData（用于UI展示）
 */
export function mapImportTaskToBatchData(task: ImportTask): BatchData {
  const sourceRemark = task.source?.trim() || task.filename

  return {
    id: task.id,
    name: sourceRemark,
    fileCount: 1,
    subject: task.subject?.name || '未知科目',
    curriculum: task.curriculum || 'UEC',
    progress: task.status === 'COMPLETED' ? 100 : task.status === 'PROCESSING' ? 50 : 0,
    status: mapProcessingStatusToBatchStatus(task.status),
    statusMessage: getStatusMessage(task.status),
    createdAt: task.createdAt,
    questionsCount: task.questionsCount,
    sourceRemark,
    sourceFileUrl: task.fileUrl,
    events: task.events ?? ['IMPORT_TASK_CREATED'],
  }
}

/**
 * 获取状态消息（内部辅助函数）
 */
function getStatusMessage(status: ProcessingStatus): string | undefined {
  switch (status) {
    case 'PROCESSING':
      return '正在处理...'
    case 'FAILED':
      return '处理失败'
    case 'PENDING':
      return '等待处理...'
    default:
      return undefined
  }
}
