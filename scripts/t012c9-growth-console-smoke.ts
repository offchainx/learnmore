import 'dotenv/config'

import { randomUUID } from 'node:crypto'
import { UserRole } from '@prisma/client'
import prisma from '../src/lib/prisma'
import {
  getGrowthConsoleAvailableTabs,
  resolveGrowthConsoleInitialTab,
  resolveGrowthConsoleRoute,
} from '../src/lib/admin/growth-console'
import { getGrowthConsoleFieldMatrix } from '../src/lib/admin/growth-console-matrix'

type ConsoleSnapshot = {
  referralsCount: number
  vouchersCount: number
  adminTabs: ReturnType<typeof getGrowthConsoleAvailableTabs>
  teacherTabs: ReturnType<typeof getGrowthConsoleAvailableTabs>
  adminMatrix: ReturnType<typeof getGrowthConsoleFieldMatrix>
  teacherMatrix: ReturnType<typeof getGrowthConsoleFieldMatrix>
  initialRoute: ReturnType<typeof resolveGrowthConsoleRoute>
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

async function collectConsoleSnapshot(): Promise<ConsoleSnapshot> {
  const [referralsCount, vouchersCount, adminUser, teacherUser] =
    await Promise.all([
      prisma.referral.count(),
      prisma.voucherCode.count(),
      prisma.user.findFirst({
        where: { role: UserRole.ADMIN },
        select: { role: true },
      }),
      prisma.user.findFirst({
        where: { role: UserRole.TEACHER },
        select: { role: true },
      }),
    ])

  assert(adminUser, '数据库中未找到 ADMIN 用户，无法完成验证')
  assert(teacherUser, '数据库中未找到 TEACHER 用户，无法完成验证')

  return {
    referralsCount,
    vouchersCount,
    adminTabs: getGrowthConsoleAvailableTabs(adminUser.role),
    teacherTabs: getGrowthConsoleAvailableTabs(teacherUser.role),
    adminMatrix: getGrowthConsoleFieldMatrix(adminUser.role),
    teacherMatrix: getGrowthConsoleFieldMatrix(teacherUser.role),
    initialRoute: resolveGrowthConsoleRoute({
      role: adminUser.role,
      tab: resolveGrowthConsoleInitialTab({ role: adminUser.role, tab: 'vouchers' }),
    }),
  }
}

async function main() {
  const before = await collectConsoleSnapshot()

  assert(
    before.adminTabs.includes('referrals') && before.adminTabs.includes('vouchers'),
    'ADMIN 应可见 referrals 与 vouchers 两个 tab'
  )
  assert(
    before.teacherTabs.length === 1 && before.teacherTabs[0] === 'referrals',
    'TEACHER 只应可见 referrals tab'
  )
  assert(
    before.adminMatrix.voucherTableColumns.length > 0,
    'ADMIN 应可见 voucher 表字段'
  )
  assert(
    before.teacherMatrix.voucherTableColumns.length === 0,
    'TEACHER 不应可见 voucher 表字段'
  )
  assert(
    before.initialRoute === '/admin/referrals?tab=vouchers',
    'ADMIN vouchers tab 的跳转路径应收敛到 /admin/referrals?tab=vouchers'
  )

  const tempVoucherCode = `T012C9_${randomUUID().slice(0, 8).toUpperCase()}`
  const now = new Date()
  const tempVoucher = await prisma.voucherCode.create({
    data: {
      code: tempVoucherCode,
      discountType: 'AMOUNT',
      discountValue: 12,
      maxRedemptions: 3,
      redeemedCount: 0,
      isActive: true,
      validFrom: now,
      validTo: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      stripeCouponId: `cpn_${tempVoucherCode.toLowerCase()}`,
    },
    select: {
      id: true,
      code: true,
      isActive: true,
    },
  })

  try {
    const afterCreate = await prisma.voucherCode.count()
    assert(
      afterCreate === before.vouchersCount + 1,
      '创建临时优惠券后，voucher 数量应增加 1'
    )

    const createdRow = await prisma.voucherCode.findUnique({
      where: { id: tempVoucher.id },
      select: {
        code: true,
        isActive: true,
        redeemedCount: true,
        stripeCouponId: true,
      },
    })

    assert(createdRow?.code === tempVoucherCode, '临时优惠券代码应可回读')
    assert(createdRow?.isActive === true, '临时优惠券初始状态应为启用')
    assert(createdRow?.redeemedCount === 0, '临时优惠券初始核销数应为 0')
    assert(
      createdRow?.stripeCouponId === `cpn_${tempVoucherCode.toLowerCase()}`,
      '临时优惠券 Stripe 绑定应可回读'
    )

    await prisma.voucherCode.update({
      where: { id: tempVoucher.id },
      data: { isActive: false },
    })

    const toggledRow = await prisma.voucherCode.findUnique({
      where: { id: tempVoucher.id },
      select: { isActive: true },
    })

    assert(toggledRow?.isActive === false, '临时优惠券切换停用后应能回读到停用状态')
  } finally {
    await prisma.voucherCode.delete({
      where: { id: tempVoucher.id },
    })
  }

  const after = await collectConsoleSnapshot()
  assert(
    after.referralsCount === before.referralsCount,
    '验证收尾后 referral 数量应保持不变'
  )
  assert(
    after.vouchersCount === before.vouchersCount,
    '验证收尾后 voucher 数量应恢复到原始值'
  )

  console.log(
    JSON.stringify(
      {
        ok: true,
        before: {
          referralsCount: before.referralsCount,
          vouchersCount: before.vouchersCount,
          adminTabs: before.adminTabs,
          teacherTabs: before.teacherTabs,
        },
        after: {
          referralsCount: after.referralsCount,
          vouchersCount: after.vouchersCount,
        },
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error('[t012c9-growth-console-smoke] failed', error)
  process.exitCode = 1
})
