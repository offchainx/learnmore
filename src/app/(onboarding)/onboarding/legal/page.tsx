import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { BadgeCheck, Bell, ShieldCheck } from 'lucide-react'

import { getCurrentUser } from '@/actions/user/auth'
import { LegalConsentCard } from '@/components/onboarding/LegalConsentCard'
import { resolveOnboardingRedirect } from '@/lib/auth/onboarding'

export const metadata: Metadata = {
  title: 'Legal consent | LearnMore',
  description:
    'Confirm the Terms of Service and Privacy Policy before continuing your onboarding.',
}

export default async function LegalOnboardingPage() {
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

  if (redirectTarget !== '/onboarding/legal') {
    redirect(redirectTarget)
  }

  return (
    <div className="w-full max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <section className="hidden min-h-[360px] rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-8 text-slate-900 shadow-[0_24px_80px_-46px_rgba(15,23,42,0.18)] lg:flex lg:min-h-[640px] lg:flex-col lg:justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
              <div className="flex size-8 items-center justify-center rounded-[10px] border border-slate-200 bg-white text-[11px] font-semibold tracking-[0.18em] text-slate-700">
                LM
              </div>
              LearnMore
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
                Step 1 of 2
              </p>
              <h1 className="max-w-xl text-balance text-4xl font-semibold tracking-tight text-slate-950">
                先确认使用条款，再进入学习档案。
              </h1>
              <p className="max-w-lg text-base leading-7 text-slate-600">
                这一步只做一次。完成后，我们才会收集学校和年级，并据此调整
                dashboard、提醒和内容推荐。
              </p>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-slate-600">
            <div className="flex items-start gap-3 rounded-[16px] border border-slate-200 bg-white px-4 py-4">
              <ShieldCheck className="mt-0.5 size-4 text-slate-700" />
              <div>
                <p className="font-medium text-slate-950">账号级同意</p>
                <p className="mt-1 leading-6">
                  会写入数据库，确保你在不同设备上看到的是同一份 onboarding
                  状态。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[16px] border border-slate-200 bg-white px-4 py-4">
              <BadgeCheck className="mt-0.5 size-4 text-slate-700" />
              <div>
                <p className="font-medium text-slate-950">下一步是资料补全</p>
                <p className="mt-1 leading-6">
                  同意后会立刻进入 profile step，不会绕回别的页面。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[16px] border border-slate-200 bg-white px-4 py-4">
              <Bell className="mt-0.5 size-4 text-slate-700" />
              <div>
                <p className="font-medium text-slate-950">后续推送会更准</p>
                <p className="mt-1 leading-6">
                  等 onboarding 结束后，内容和提醒才会开始按你的资料分发。
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex min-h-[360px] items-center lg:min-h-[640px]">
          <LegalConsentCard />
        </div>
      </div>
    </div>
  )
}
