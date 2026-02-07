/**
 * Practice Center - Common Utility Types
 * 工具类型定义
 */

/**
 * 数据服务返回结果
 */
export interface DataServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}
