import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import prisma from '@/lib/prisma'
import { AdminClientWrapper } from '@/components/admin/common'
import { VoucherAdminClient } from './VoucherAdminClient'

export default async function AdminVouchersPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const vouchers = await prisma.voucherCode.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      code: true,
      discountType: true,
      discountValue: true,
      isActive: true,
      maxRedemptions: true,
      redeemedCount: true,
      validFrom: true,
      validTo: true,
      stripeCouponId: true,
      createdAt: true,
    },
    take: 200,
  })

  return (
    <AdminClientWrapper userRole={profile.role}>
      <div className="w-full space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Voucher 管理</h1>
          <p className="text-sm text-muted-foreground">
            创建、启停与追踪 Voucher 使用情况（仅管理员可见）。
          </p>
        </div>
        <VoucherAdminClient
          vouchers={vouchers.map((voucher) => ({
            ...voucher,
            validFrom: voucher.validFrom ? voucher.validFrom.toISOString() : null,
            validTo: voucher.validTo ? voucher.validTo.toISOString() : null,
            createdAt: voucher.createdAt.toISOString(),
          }))}
        />
      </div>
    </AdminClientWrapper>
  )
}
