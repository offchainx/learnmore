import Image from 'next/image'
import { ChevronRight, Medal, Star } from 'lucide-react'
import type { DashboardHeroLayoutPreset } from './heroLayoutPreset'

type DashboardHeroCardProps = {
  copy: (zh: string, en: string, ms?: string) => string
  xp: number
  onContinue: () => void
  preset: DashboardHeroLayoutPreset
}

export function DashboardHeroCard({
  copy,
  xp,
  onContinue,
  preset,
}: DashboardHeroCardProps) {
  const heroMetrics = [
    {
      icon: Star,
      value: (
        <>
          {xp}{' '}
          <span className="ml-1 text-[13px] font-medium text-[#69727f]">
            XP
          </span>
        </>
      ),
    },
    {
      icon: Medal,
      value: copy('7级 探索者', 'Level 7 Explorer'),
    },
  ] as const

  return (
    <section
      className="relative w-full overflow-hidden rounded-[30px] border border-[#ebd7c1] bg-[linear-gradient(135deg,#ffd56c_0%,#ffb942_18%,#ff9a25_58%,#ff7b18_100%)] shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)]"
      style={{
        width: `min(100%, ${preset.shell.width}px)`,
        minHeight: `${preset.shell.height}px`,
      }}
    >
      <div
        className="absolute"
        style={{
          left: `${preset.artFrame.x}px`,
          top: `${preset.artFrame.y}px`,
          width: `${preset.artFrame.width}px`,
          height: `${preset.artFrame.height}px`,
        }}
      >
        <Image
          src="/preview/crops/hero-art-generated-whitefade.png"
          alt="学习主视觉插画"
          fill
          sizes="(min-width: 1536px) 980px, (min-width: 1280px) calc(100vw - 560px), 100vw"
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0)_26%),linear-gradient(90deg,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0.36)_20%,rgba(255,255,255,0.12)_34%,rgba(255,255,255,0)_52%)]" />

      <div
        className="relative z-10 h-full p-4 sm:p-5"
        style={{ minHeight: `${preset.shell.height}px` }}
      >
        <div
          className="max-w-[432px]"
          style={{ maxWidth: `${preset.contentMaxWidth}px` }}
        >
          <div className="flex items-center gap-3 text-[#242c38]">
            <Star className="h-5 w-5 fill-[#ffbe2b] text-[#ef8622]" />
            <span className="text-[17px] font-semibold tracking-tight">
              {copy('学习总览', 'Learning Overview')}
            </span>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <h2 className="max-w-[320px] text-[35px] font-semibold leading-[1.04] tracking-tight text-[#252d39] sm:text-[41px]">
              {copy('保持你的', 'Keep your')}
              <br />
              {copy('连胜势头！', 'momentum going!')}
            </h2>
            <span className="mt-1 text-[30px] leading-none">🔥</span>
          </div>

          <p className="mt-3.5 max-w-[320px] text-[13px] text-[#596371]">
            {copy('你今天状态很好。', 'You are doing well today.')}
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {heroMetrics.map((metric) => {
              const Icon = metric.icon
              const iconClassName =
                Icon === Star
                  ? 'fill-[#ffcb29] text-[#f08b1f]'
                  : 'text-[#3ea653]'

              return (
                <div
                  key={Icon.displayName ?? String(Icon)}
                  className="flex items-center gap-3 rounded-[16px] border border-[#efd9bf] bg-white/85 px-4 py-2.5 shadow-[0_16px_28px_-24px_rgba(120,72,32,0.25)] backdrop-blur-[1px]"
                >
                  <Icon className={`h-6 w-6 ${iconClassName}`} />
                  <div className="text-[14px] font-semibold text-[#222b36]">
                    {metric.value}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div
          className="absolute left-5 z-10"
          style={{
            left: `${20 + preset.ctaOffset.x}px`,
            bottom: `${20 - preset.ctaOffset.y}px`,
          }}
        >
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-11 w-[206px] items-center justify-between rounded-[16px] bg-[linear-gradient(90deg,#ff8a1f_0%,#ff5e18_100%)] px-6 text-[14px] font-semibold text-white shadow-[0_22px_32px_-26px_rgba(255,102,25,0.9)]"
          >
            <span>{copy('继续学习', 'Continue')}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#ff7d19]">
              <ChevronRight className="h-5 w-5" />
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
