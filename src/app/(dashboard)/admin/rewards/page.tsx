import { redirect } from 'next/navigation'
import { getProfile } from '@/actions/user/profile'
import { getLeaderboard } from '@/actions/leaderboard'
import { getRewardCenterConsoleData } from '@/actions/admin/reward-center'
import { AdminClientWrapper } from '@/components/admin/common'
import { RewardCenterControlConsole } from '@/components/admin/rewards/RewardCenterControlConsole'

export default async function AdminRewardsPage() {
  const profile = await getProfile()

  if (!profile) {
    redirect('/login?redirectTo=/admin/rewards')
  }

  if (profile.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const [rewardCenterData, weeklyEntries, monthlyEntries, allTimeEntries] = await Promise.all([
    getRewardCenterConsoleData(),
    getLeaderboard('WEEKLY', 8),
    getLeaderboard('MONTHLY', 8),
    getLeaderboard('ALL_TIME', 8),
  ])

  return (
    <AdminClientWrapper user={profile} userRole={profile.role}>
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div className="mx-auto w-full max-w-[1820px] rounded-[32px] border border-borderTone bg-page p-2.5 text-text-primary shadow-surface-lg sm:p-3">
          <RewardCenterControlConsole
            initialRewardRules={rewardCenterData.rewardRules}
            initialAchievementRules={rewardCenterData.achievementRules}
            initialAdjustmentRecords={rewardCenterData.adjustmentRecords}
            initialOperationLogs={rewardCenterData.operationLogs}
            leaderboardSnapshots={[
              {
                period: 'WEEKLY',
                entries: weeklyEntries,
                myRank: null,
              },
              {
                period: 'MONTHLY',
                entries: monthlyEntries,
                myRank: null,
              },
              {
                period: 'ALL_TIME',
                entries: allTimeEntries,
                myRank: null,
              },
            ]}
          />
        </div>
      </div>
    </AdminClientWrapper>
  )
}
