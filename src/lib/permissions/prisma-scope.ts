import { TierKey } from './types';
import { RETENTION_CONFIG } from './config';

/**
 * 获取基于用户等级的数据保留截止日期
 * @param tier 用户等级
 * @param now 当前时间（用于测试）
 * @returns 截止日期，早于此日期的数据应被过滤掉
 */
export function getRetentionDate(tier: TierKey, now: Date = new Date()): Date {
  const days = RETENTION_CONFIG[tier];
  
  // 如果是 -1，代表永久保留
  if (days === -1) {
    return new Date(0); // 1970-01-01
  }
  
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  
  // 设置为当天的开始时间 00:00:00，确保逻辑一致
  date.setHours(0, 0, 0, 0);
  
  return date;
}
