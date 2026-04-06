export type ReferralOverviewItem = {
  status: 'PENDING' | 'COMPLETED' | 'DEFERRED' | 'EXPIRED' | 'CANCELLED'
}

export type ReferralOverviewInput = {
  referralsGiven: Array<ReferralOverviewItem>
  referralLimit: number
}

export type ReferralOverviewStats = {
  totalInvites: number
  completedInvites: number
  deferredInvites: number
  pendingInvites: number
  remainingQuota: number
  rewardSummary: string
}

export function buildReferralOverviewStats(
  input: ReferralOverviewInput
): ReferralOverviewStats {
  const totalInvites = input.referralsGiven.length
  const completedInvites = input.referralsGiven.filter(
    (referral) => referral.status === 'COMPLETED'
  ).length
  const deferredInvites = input.referralsGiven.filter(
    (referral) => referral.status === 'DEFERRED'
  ).length
  const pendingInvites = input.referralsGiven.filter(
    (referral) => referral.status === 'PENDING'
  ).length

  return {
    totalInvites,
    completedInvites,
    deferredInvites,
    pendingInvites,
    remainingQuota: Math.max(
      0,
      input.referralLimit - completedInvites - deferredInvites
    ),
    rewardSummary:
      totalInvites === 0
        ? '当前暂无推荐记录'
        : `已结算 ${completedInvites}，延迟发放 ${deferredInvites}，待完成 ${pendingInvites}`,
  }
}
