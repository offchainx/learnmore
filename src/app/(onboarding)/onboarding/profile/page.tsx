import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ChartLine, ClipboardList, GraduationCap } from 'lucide-react'

import { getCurrentUser } from '@/actions/user/auth'
import { OnboardingProfileForm } from '@/components/onboarding/OnboardingProfileForm'
import { resolveOnboardingRedirect } from '@/lib/auth/onboarding'

export const metadata: Metadata = {
  title: 'Profile setup | LearnMore',
  description:
    'Complete your learning profile so we can personalize your dashboard and recommendations.',
}

export default async function ProfileOnboardingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const redirectTarget = resolveOnboardingRedirect({
    legalConsentAcceptedAt: user.legalConsentAcceptedAt,
    displayName: user.displayName,
    school: user.school,
    grade: user.grade,
    onboardingCompletedAt: user.onboardingCompletedAt,
    onboardingStep: user.onboardingStep,
  })

  if (redirectTarget !== '/onboarding/profile') {
    redirect(redirectTarget)
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="mb-6 hidden items-center justify-between gap-4 desktop:flex">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
            <div className="flex size-8 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-700">
              <GraduationCap className="size-4" />
            </div>
            LearnMore
          </div>
          <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight text-slate-950">
            补全学习档案，dashboard 就会按这个配置启动。
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            这里只收姓名、学校、年级和头像。信息越准确，推荐内容和提醒就越贴近你的实际情况。
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)]">
          <ClipboardList className="size-4 text-slate-700" />
          <span>资料补齐后直接进入 dashboard</span>
        </div>
      </div>

      <div className="grid gap-3 desktop:hidden">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
          <div className="flex size-8 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-slate-700">
            <GraduationCap className="size-4" />
          </div>
          LearnMore
        </div>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-950">
          补全学习档案，dashboard 就会按这个配置启动。
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          这里只收姓名、学校、年级和头像。信息越准确，推荐内容和提醒就越贴近你的实际情况。
        </p>
        <div className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)]">
          <ChartLine className="size-4 text-slate-700" />
          <span>步骤 2/2</span>
        </div>
      </div>

      <div className="mt-6 desktop:mt-8">
        <OnboardingProfileForm
          displayName={user.displayName || user.username || user.email}
          school={user.school}
          grade={user.grade}
          avatar={user.avatar}
          usernameFallback={user.displayName || user.username || user.email}
        />
      </div>
    </div>
  )
}
