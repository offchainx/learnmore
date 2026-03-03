import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/user/auth';
import prisma from '@/lib/prisma';
import { VoucherAdminClient } from './VoucherAdminClient';

export default async function AdminVouchersPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
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
  });

  return (
    <div className="container py-8 space-y-6">
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
  );
}
