/**
 * Practice Center - Knowledge Hive Types
 * 知识蜂巢（Knowledge Hive）类型定义
 */

/**
 * 蜂巢节点掌握状态
 */
export type HiveNodeStatus = 'strong' | 'fair' | 'weak' | 'locked'

/**
 * 蜂巢节点数据
 */
export interface HiveNode {
  chapterId: string
  chapterTitle: string
  masteryLevel: number           // 0-3 (对应 ErrorBook 中的 masteryLevel)
  correctRate: number            // 0-100 百分比
  totalAttempts: number          // 总答题次数
  status: HiveNodeStatus         // 根据 correctRate 计算的状态
  color: string                  // CSS 颜色值
}

/**
 * 状态对应颜色映射
 */
export const HIVE_STATUS_COLORS: Record<HiveNodeStatus, string> = {
  strong: '#22c55e',  // green-500
  fair: '#eab308',    // yellow-500
  weak: '#ef4444',    // red-500
  locked: '#6b7280',  // gray-500
}

/**
 * 根据正确率计算蜂巢节点状态
 */
export function getHiveStatus(correctRate: number, totalAttempts: number): HiveNodeStatus {
  if (totalAttempts === 0) return 'locked'
  if (correctRate >= 80) return 'strong'
  if (correctRate >= 60) return 'fair'
  return 'weak'
}
