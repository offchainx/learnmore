import { getCurrentUser } from '@/actions/user/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

export default async function AdminReferralsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
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

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">推荐关系管理</h1>

      <div className="bg-card rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">推荐人</th>
              <th className="p-4 text-left">被推荐人</th>
              <th className="p-4 text-left">推荐码</th>
              <th className="p-4 text-left">状态</th>
              <th className="p-4 text-left">奖励发放</th>
              <th className="p-4 text-left">延迟奖励</th>
              <th className="p-4 text-left">注册时间</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((ref) => (
              <tr key={ref.id} className="border-b">
                <td className="p-4">
                  <div>
                    <div className="font-medium">
                      {ref.referrer.username || '未设置'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ref.referrer.email}
                    </div>
                    <div className="text-xs text-blue-600">
                      {ref.referrer.role}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-medium">
                      {ref.referee.username || '未设置'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ref.referee.email}
                    </div>
                    <div className="text-xs text-green-600">
                      {ref.referee.role}
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono text-sm">{ref.referralCode}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      ref.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : ref.status === 'DEFERRED'
                          ? 'bg-indigo-100 text-indigo-800'
                        : ref.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {ref.status}
                  </span>
                </td>
                <td className="p-4">
                  {ref.rewardGranted ? (
                    <span className="text-green-600">✅ 已发放</span>
                  ) : (
                    <span className="text-gray-400">未发放</span>
                  )}
                </td>
                <td className="p-4 text-xs">
                  {ref.status === 'DEFERRED' || ref.deferredRewardWeeks > 0 ? (
                    <div className="space-y-1">
                      <div>
                        <span className="text-slate-500">Tier:</span>{' '}
                        <span className="font-medium">{ref.deferredRewardTier || 'STANDARD'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Weeks:</span>{' '}
                        <span className="font-medium">{ref.deferredRewardWeeks}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Settled:</span>{' '}
                        <span className="font-medium">
                          {ref.deferredSettledAt
                            ? new Date(ref.deferredSettledAt).toLocaleString('zh-CN')
                            : 'No'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(ref.createdAt).toLocaleDateString('zh-CN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
