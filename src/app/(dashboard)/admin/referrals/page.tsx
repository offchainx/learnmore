import { getProfile } from '@/actions/user/profile'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { AdminClientWrapper } from '@/components/admin/common'
import { AdminReferralsView } from '@/components/admin/referrals/AdminReferralsView'
import type { AdminReferralMetric } from '@/components/admin/referrals/admin-referrals.types'

export const dynamic = 'force-dynamic'

const statusOrder = ['PENDING', 'DEFERRED', 'COMPLETED', 'EXPIRED', 'CANCELLED'] as const

export default async function AdminReferralsPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'ADMIN' && profile.role !== 'TEACHER') {
    redirect('/dashboard')
  }

  const referrals = await prisma.referral.findMany({
    include: {
      referrer: { select: { username: true, email: true, role: true } },
      referee: { select: { username: true, email: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const metrics: AdminReferralMetric[] = [
    { key: 'total', label: '总推荐记录', value: String(referrals.length) },
    {
      key: 'pending',
      label: '待完成',
      value: String(referrals.filter((item) => item.status === 'PENDING').length),
    },
    {
      key: 'deferred',
      label: '延迟发放',
      value: String(referrals.filter((item) => item.status === 'DEFERRED').length),
    },
    {
      key: 'conversion',
      label: '完成转化率',
      value: referrals.length > 0
        ? `${Math.round((referrals.filter((item) => item.status === 'COMPLETED').length / referrals.length) * 100)}%`
        : '0%',
    },
  ]

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
      deferredSettledAt: referral.deferredSettledAt ? referral.deferredSettledAt.toISOString() : null,
      createdAt: referral.createdAt.toISOString(),
    }))
    .sort((a, b) => {
      const orderA = statusOrder.indexOf(a.status as (typeof statusOrder)[number])
      const orderB = statusOrder.indexOf(b.status as (typeof statusOrder)[number])

      if (orderA !== orderB) {
        return orderA - orderB
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <AdminReferralsView
        metrics={metrics}
        rows={rows}
        filters={{ keyword: '', status: 'ALL', role: 'ALL', dateRange: 'ALL' }}
        pagination={{ page: 1, pageSize: 10, total: rows.length }}
        lastUpdatedLabel={new Date().toLocaleString('zh-CN', { hour12: false })}
      />
    </AdminClientWrapper>
  )
}
