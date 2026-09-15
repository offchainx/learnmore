// 'use server' 文件只允许导出 async 函数——常量放在那里会被打成 server reference，
// 客户端 import 到的不是数组（实测：REFERRAL_SOURCES.map is not a function）。
// 所以这个闭集单独放一个普通模块，server action 和表单都从这里取。
// 库里有同名 CHECK 约束（迁移 20260915112446），改这里要同时改迁移。
export const REFERRAL_SOURCES = ['xhs', 'instagram', 'facebook', 'friend', 'other'] as const
export type ReferralSource = (typeof REFERRAL_SOURCES)[number]
