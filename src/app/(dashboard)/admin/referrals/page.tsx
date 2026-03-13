import { getProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { AdminClientWrapper } from '@/components/admin/common'
import { GrowthToolsConsole } from '@/components/admin/referrals/GrowthToolsConsole'

export const dynamic = 'force-dynamic'

const statusOrder = [
  'PENDING',
  'DEFERRED',
  'COMPLETED',
  'EXPIRED',
  'CANCELLED',
] as const

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>
}) {
  const profile = await getProfile()
  const params = await searchParams

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'ADMIN' && profile.role !== 'TEACHER') {
    redirect('/dashboard')
  }

  const [referrals, vouchers] = await Promise.all([
    prisma.referral.findMany({
      include: {
        referrer: { select: { username: true, email: true, role: true } },
        referee: { select: { username: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    profile.role === 'ADMIN'
      ? prisma.voucherCode.findMany({
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
        })
      : Promise.resolve([]),
  ])

  const rows = referrals
    .map((referral) => ({
      id: referral.id,
      referrer: {
        username: referral.referrer.username || '未设置',
        email: referral.referrer.email,
        role: referral.referrer.role,
      },
      referee: {
        username: referral.referee.username || '未设置',
        email: referral.referee.email,
        role: referral.referee.role,
      },
      referralCode: referral.referralCode,
      status: referral.status,
      rewardGranted: referral.rewardGranted,
      deferredRewardTier: referral.deferredRewardTier,
      deferredRewardWeeks: referral.deferredRewardWeeks,
      deferredSettledAt: referral.deferredSettledAt
        ? referral.deferredSettledAt.toISOString()
        : null,
      createdAt: referral.createdAt.toISOString(),
    }))
    .sort((a, b) => {
      const orderA = statusOrder.indexOf(
        a.status as (typeof statusOrder)[number]
      )
      const orderB = statusOrder.indexOf(
        b.status as (typeof statusOrder)[number]
      )

      if (orderA !== orderB) {
        return orderA - orderB
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto w-full max-w-[1820px] rounded-[32px] border border-[#24324D] bg-[#0B1220] p-2.5 text-[#E6EDF7] sm:p-3">
          <GrowthToolsConsole
            referrals={rows}
            vouchers={vouchers.map((voucher) => ({
              ...voucher,
              validFrom: voucher.validFrom
                ? voucher.validFrom.toISOString()
                : null,
              validTo: voucher.validTo ? voucher.validTo.toISOString() : null,
              createdAt: voucher.createdAt.toISOString(),
            }))}
            isAdmin={profile.role === 'ADMIN'}
            initialTab={
              profile.role === 'ADMIN' && params?.tab === 'vouchers'
                ? 'vouchers'
                : 'referrals'
            }
          />
        </div>
      </div>
    </AdminClientWrapper>
  )
}
