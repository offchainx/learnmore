import Image from 'next/image'
import { Card } from '@/components/ui/card'
import streakCampfireImage from '../../../.codex/artifacts/streak-assets/streak-campfire.png'
import streakTitleIcon from '../../../.codex/artifacts/streak-assets/streak-title-icon.png'
import pathBackgroundMountain from '../../../.codex/artifacts/path-assets/path-background-mountain.png'
import pathStepActive from '../../../.codex/artifacts/path-assets/path-step-active.png'
import pathStepDone from '../../../.codex/artifacts/path-assets/path-step-done.png'
import pathStepLocked from '../../../.codex/artifacts/path-assets/path-step-locked.png'
import pathStepTreasure from '../../../.codex/artifacts/path-assets/path-step-treasure.png'
import pathTitleIcon from '../../../.codex/artifacts/path-assets/path-title-icon.png'
export { DashboardReplicaTaskCard } from './DashboardReplicaTaskSection'

const streakDays = ['一', '二', '三', '四', '五', '六', '日', '一', '二', '三', '四', '五', '六', '日']

const pathSteps: Array<{
  label: string
  sublabel?: string
  tone: 'done' | 'active' | 'locked' | 'treasure'
  icon: typeof pathStepDone
}> = [
  { label: '起点', tone: 'done', icon: pathStepDone },
  { label: '基础完成', tone: 'done', icon: pathStepDone },
  { label: '第2级', sublabel: '进行中', tone: 'active', icon: pathStepActive },
  { label: '第3级', sublabel: '已锁定', tone: 'locked', icon: pathStepLocked },
  { label: '第4级', sublabel: '已锁定', tone: 'locked', icon: pathStepLocked },
  { label: '大师奖励', sublabel: '等待解锁', tone: 'treasure', icon: pathStepTreasure },
] as const

function ReplicaSectionTitle({
  iconSrc,
  iconAlt,
  title,
}: {
  iconSrc: string
  iconAlt: string
  title: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Image src={iconSrc} alt={iconAlt} width={20} height={20} className="h-5 w-5" />
      <h2 className="text-[17px] font-semibold tracking-tight text-[#242c38] sm:text-[18px]">
        {title}
      </h2>
    </div>
  )
}

export function DashboardReplicaPathCard({
  copy,
}: {
  copy: (zh: string, en: string) => string
}) {
  return (
    <Card className="overflow-hidden rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] p-0 shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]">
      <div className="relative min-h-[214px]">
        <div className="absolute left-[20px] top-[18px] z-30">
          <ReplicaSectionTitle
            iconSrc={pathTitleIcon.src}
            iconAlt={copy('学习路径图标', 'Learning path icon')}
            title={copy('学习路径', 'Learning Path')}
          />
        </div>

        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <Image
              src={pathBackgroundMountain}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-bottom opacity-[0.72]"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(249,253,251,0.44)_0%,rgba(255,250,242,0.16)_100%)]" />
        </div>

        <div className="pointer-events-none absolute inset-x-8 top-[30%]">
          <svg viewBox="0 0 1000 120" preserveAspectRatio="none" className="h-[42px] w-full">
            <path
              d="M 8 62 C 70 18, 132 18, 194 62 S 318 106, 380 62 S 504 18, 566 62 S 690 106, 752 62 S 876 18, 938 62"
              fill="none"
              stroke="#98a873"
              strokeDasharray="6 10"
              strokeLinecap="round"
              strokeWidth="4.5"
              opacity="0.9"
            />
          </svg>
        </div>

        <div className="relative z-10 grid h-full gap-3.5 px-3 pb-3 pt-10 sm:grid-cols-2 desktop:grid-cols-3 2xl:grid-cols-6">
          {pathSteps.map((step) => (
            <div key={step.label} className="relative text-center">
              <div
                className={`relative mx-auto flex items-center justify-center ${
                  step.tone === 'active' || step.tone === 'treasure'
                    ? 'h-[68px] w-[68px]'
                    : 'h-10 w-10'
                }`}
              >
                <Image
                  src={step.icon}
                  alt={step.label}
                  fill
                  sizes={
                    step.tone === 'active' || step.tone === 'treasure' ? '68px' : '40px'
                  }
                  className="object-contain"
                />
              </div>
              <div className="mt-2 text-[11px] font-semibold text-[#2c3541]">{step.label}</div>
              {step.sublabel ? (
                <div
                  className={`mt-1 text-[10px] ${
                    step.tone === 'active'
                      ? 'font-semibold text-[#ff6d18]'
                      : step.tone === 'treasure'
                        ? 'font-semibold text-[#ff7b16]'
                        : 'text-[#74808d]'
                  }`}
                >
                  {step.sublabel}
                </div>
              ) : null}
            </div>
          ))}
        </div>

      </div>
    </Card>
  )
}

export function DashboardStreakCard({
  copy,
  streak,
}: {
  copy: (zh: string, en: string) => string
  streak: number
}) {
  const visibleStreak = Math.max(0, streak)
  const filledDays = Math.min(visibleStreak, streakDays.length)

  return (
    <Card className="overflow-hidden rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] p-0 shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]">
      <div className="relative min-h-[216px]">
        <div className="absolute left-[20px] top-[18px] z-20">
          <ReplicaSectionTitle
            iconSrc={streakTitleIcon.src}
            iconAlt={copy('连续性图标', 'Streak icon')}
            title={copy('连续性', 'Streak')}
          />
        </div>

        <div className="absolute inset-x-0 top-0 z-0 rounded-[20px] bg-[linear-gradient(180deg,#fff9f0_0%,#fffdf7_100%)] px-4 pb-4 pt-11">
          <div className="relative min-h-[122px]">
            <div className="flex translate-x-[30px] items-start gap-3 pr-[176px]">
              <div className="min-w-0 flex-1">
                <div className="text-[40px] font-semibold leading-none tracking-tight text-[#ff6b1c]">
                  <span className="inline-flex items-end gap-1 whitespace-nowrap">
                    <span>{visibleStreak}</span>
                    <span className="pb-1 text-[18px]">{copy('天', 'd')}</span>
                  </span>
                </div>
                <div className="mt-2 text-[13px] font-semibold leading-none text-[#24303b]">
                  {copy('连续学习', 'Continuous learning')}
                </div>
                <div className="mt-1.5 text-[13px] font-semibold leading-none text-[#24303b]">
                  {visibleStreak > 0
                    ? copy('表现很棒！', 'Great consistency!')
                    : copy('从今天开始点亮第一天', 'Start your first streak today')}
                </div>
              </div>
            </div>

            <div className="absolute right-[18px] top-[-8px] h-[116px] w-[132px]">
              <Image
                src={streakCampfireImage}
                alt={copy('连续学习火堆插画', 'Streak campfire')}
                fill
                sizes="132px"
                className="object-contain object-center"
              />
            </div>

            <div className="mt-[30px] rounded-[14px] border border-[#ecd9c4] bg-white/82 px-2 py-1">
              <div className="flex items-center justify-between text-[10px] text-[#67727e]">
                {streakDays.map((day, index) => (
                  <span key={`${day}-${index}`}>{day}</span>
                ))}
              </div>
              <div className="mt-[5px] flex items-center justify-between gap-[2px]">
                {streakDays.map((_, index) => (
                  <div
                    key={index}
                    className={`flex h-3 w-3 items-center justify-center rounded-full text-[7px] ${
                      index < filledDays
                        ? 'bg-[#ff8b1f] text-white'
                        : 'bg-[#e7e1d9] text-[#999490]'
                    }`}
                  >
                    {index < filledDays ? '✓' : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function DashboardWeeklyGoalCard({
  copy,
  activeDays,
}: {
  copy: (zh: string, en: string) => string
  activeDays: number
}) {
  const completedDays = Math.max(0, Math.min(7, activeDays))
  const progress = Math.max(8, Math.round((completedDays / 7) * 100))
  const statusText =
    completedDays >= 5
      ? copy('进展不错！', 'Strong progress!')
      : completedDays >= 3
        ? copy('继续推进', 'Keep going')
        : copy('本周刚起步', 'Just getting started')

  return (
    <Card className="overflow-hidden rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] p-0 shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]">
      <div className="flex min-h-[216px] flex-col">
        <div className="pl-[30px] pt-[20px]">
          <ReplicaSectionTitle
            iconSrc="/preview/goal-assets/goal-title-trophy-imagegen.png"
            iconAlt={copy('本周目标进度图标', 'Weekly goal icon')}
            title={copy('本周目标进度', 'Weekly Goal Progress')}
          />
        </div>

        <div className="mt-[30px] flex flex-col gap-2.5 pl-[30px] sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="translate-x-[20px] -translate-y-[30px]">
              <div className="text-[14px] font-medium leading-none text-[#414b57]">
                {statusText}
              </div>
              <div className="mt-2 text-[14px] font-semibold leading-none text-[#ff6d1b]">
                {progress}%
              </div>
              <div className="mt-2 text-[14px] leading-none text-[#4b5663]">
                {copy(
                  `已完成 ${completedDays} / 7 天学习`,
                  `${completedDays} / 7 study days completed`
                )}
              </div>
            </div>
            <div className="mt-[30px] h-[10px] overflow-hidden rounded-full bg-[#f2e5d8]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#ff8b1e_0%,#ff5f18_100%)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="relative h-[116px] w-[126px] shrink-0 self-center sm:self-auto">
            <Image
              src="/preview/goal-assets/goal-right-trophy-imagegen.png"
              alt={copy('本周目标奖杯插画', 'Weekly goal trophy')}
              fill
              sizes="126px"
              className="object-contain object-center"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
