import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BrainCircuit,
  Eraser,
  Flag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRoutePrefetch } from '@/lib/hooks'
import {
  pageDisplayTitleClass,
  pageHeroEyebrowClass,
  pageMetaTextClass,
} from '@/components/shared/pageTypography'
import { cn } from '@/lib/utils'
import { useApp } from '@/providers'

interface PracticeModeGridProps {
  selectedSubjectId: string
  currentSubjectTitle: string
  weakChapterCount: number
  strongestSignal: string
  onOpenSmartDrillPreview?: () => void
  onOpenErrorWiperPreview?: () => void
  onOpenMockArenaPreview?: () => void
}

interface PrimaryModeCardProps {
  active: boolean
  compactMeta: string
  description: string
  disabled: boolean
  icon: React.ElementType
  modeLabel: string
  heroImage: string
  heroOverlayLabel: string
  heroOverlayTitle: string
  heroOverlayNote: string
  onActivate: () => void
  onDeactivate: () => void
  onStart: () => void
  primaryAction: string
  subtitle: string
  title: string
  visualClassName: string
}

function PrimaryModeCard({
  active,
  compactMeta,
  description,
  disabled,
  icon: Icon,
  modeLabel,
  heroImage,
  heroOverlayLabel,
  heroOverlayTitle,
  heroOverlayNote,
  onActivate,
  onDeactivate,
  onStart,
  primaryAction,
  subtitle,
  title,
  visualClassName,
}: PrimaryModeCardProps) {
  return (
    <article
      tabIndex={disabled ? -1 : 0}
      onMouseEnter={() => {
        if (!disabled) onActivate()
      }}
      onMouseLeave={onDeactivate}
      onFocus={() => {
        if (!disabled) onActivate()
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onDeactivate()
        }
      }}
      style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
      className={`group relative min-h-[188px] overflow-hidden rounded-[28px] border text-text-primary transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))]/40 dark:text-text-primary display:min-h-[264px] ${
        active
          ? 'z-10 -translate-y-1 scale-[1.015] border-borderTone shadow-[0_28px_58px_rgba(2,8,23,0.12)] dark:border-borderTone dark:shadow-[0_28px_58px_rgba(2,8,23,0.48)]'
          : 'hover:-translate-y-0.5 border-borderTone shadow-surface hover:border-[hsl(var(--border-strong))] dark:border-borderTone dark:shadow-[0_14px_28px_rgba(2,8,23,0.22)] dark:hover:border-[hsl(var(--border-strong))]'
      } ${disabled ? 'opacity-60' : 'cursor-pointer'} ${visualClassName}`}
    >
      <div className="absolute inset-0 bg-surface dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.44)_55%,rgba(2,6,23,0.86)_100%)]" />
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[hsl(var(--state-info-bg))]/80 blur-3xl dark:bg-[hsl(var(--state-info-bg))]/20" />
        <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-primary/12 blur-3xl dark:bg-primary/10" />
      </div>
      <div className="border-transparent absolute inset-[1px] rounded-[27px] border dark:border-borderTone/60" />
      <div
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: [
            'linear-gradient(90deg, rgba(255,250,244,0.98) 0%, rgba(255,250,244,0.94) 24%, rgba(255,250,244,0.70) 48%, rgba(255,250,244,0.26) 72%, rgba(255,250,244,0.08) 100%)',
            'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0.12) 100%)',
            `url(${heroImage})`,
          ].join(','),
          backgroundSize: 'cover, cover, cover',
          backgroundPosition: 'center, center, center',
          backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
          opacity: '0.98',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_28%,rgba(255,255,255,0.52)_0%,rgba(255,255,255,0.22)_36%,rgba(255,255,255,0)_72%)]" />
      <div
        className={`absolute right-4 top-4 z-10 w-[42%] max-w-[320px] rounded-[24px] border border-borderTone/70 bg-[rgba(255,255,255,0.56)] p-4 backdrop-blur-sm transition-all duration-500 dark:border-borderTone/70 dark:bg-[rgba(15,23,42,0.28)] ${active ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}`}
      >
        <div className="flex h-full flex-col justify-between gap-6">
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                pageHeroEyebrowClass,
                'rounded-full border border-borderTone bg-surface-subtle px-3 py-1 text-text-secondary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary'
              )}
            >
              {heroOverlayLabel}
            </span>
          </div>

          <div className="max-w-[18ch]">
            <div className="text-[22px] font-semibold tracking-tight text-text-primary dark:text-text-primary">
              {heroOverlayTitle}
            </div>
            <p className="mt-2 text-[13px] leading-6 text-text-secondary dark:text-text-secondary">
              {heroOverlayNote}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-20 flex h-full min-w-0 flex-col justify-between p-4 display:p-5">
        <div className="max-w-[56%]">
          <div className="flex items-start justify-between gap-4">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-2xl border border-borderTone bg-surface-subtle backdrop-blur-sm transition-all duration-500 dark:border-borderTone dark:bg-surface-subtle ${active ? 'scale-105 bg-surface shadow-[0_12px_22px_rgba(15,23,42,0.08)] dark:bg-surface dark:shadow-[0_12px_22px_rgba(15,23,42,0.16)]' : ''}`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span
              className={cn(
                pageHeroEyebrowClass,
                'rounded-full border border-borderTone bg-surface-subtle px-3 py-1 text-text-secondary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary'
              )}
            >
              {modeLabel}
            </span>
          </div>

          <div className="mt-5">
            <h3
              className={cn(pageDisplayTitleClass, 'leading-none text-text-primary dark:text-text-primary')}
            >
              {title}
            </h3>
            {subtitle ? (
              <p
                className={cn(
                  pageMetaTextClass,
                  'mt-1.5 text-text-secondary dark:text-text-secondary'
                )}
              >
                {subtitle}
              </p>
            ) : null}
            <p
              className={cn(
                pageMetaTextClass,
                `mt-2 max-w-[30ch] text-text-secondary dark:text-text-secondary transition-all duration-500 ${active ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`
              )}
            >
              {description}
            </p>
          </div>
        </div>

        <div className="mt-3 max-w-[56%]">
          <div
            className={`transition-all duration-500 ${active ? 'opacity-0' : 'opacity-100'}`}
          >
            <span
              className={cn(
                pageHeroEyebrowClass,
                'inline-flex rounded-full border border-borderTone bg-surface-subtle px-3 py-1 text-text-secondary backdrop-blur-sm dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary'
              )}
            >
              {compactMeta}
            </span>
          </div>

          <div
            className={`mt-2.5 flex items-center gap-3 transition-all duration-500 ${active ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
          >
            <Button
              className="h-9 rounded-2xl bg-text-primary px-4 text-surface shadow-[0_10px_20px_rgba(15,23,42,0.12)] hover:bg-text-secondary dark:bg-surface-inverse dark:text-text-inverse dark:shadow-[0_10px_20px_rgba(255,255,255,0.12)] dark:hover:bg-surface-inverse"
              onClick={(event) => {
                event.stopPropagation()
                if (!disabled) {
                  onStart()
                }
              }}
              disabled={disabled}
            >
              {primaryAction}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export const PracticeModeGrid: React.FC<PracticeModeGridProps> = ({
  selectedSubjectId,
  currentSubjectTitle,
  weakChapterCount,
  strongestSignal,
  onOpenSmartDrillPreview,
  onOpenErrorWiperPreview,
  onOpenMockArenaPreview,
}) => {
  const router = useRouter()
  const { lang } = useApp()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const hasSubject = Boolean(selectedSubjectId)
  useRoutePrefetch({
    enabled: hasSubject,
    routes: hasSubject
      ? [
          `/dashboard/practice/smart-drill?subjectId=${encodeURIComponent(selectedSubjectId)}`,
          `/dashboard/practice/error-wiper?subjectId=${encodeURIComponent(selectedSubjectId)}`,
          `/dashboard/practice/mock-arena?subjectId=${encodeURIComponent(selectedSubjectId)}`,
        ]
      : [],
  })

  const copy = {
    zh: {
      smart: {
        title: 'Smart Drill',
        subtitle: '',
        description: `根据当前做题进展和答题表现，动态出一轮最值得做的题。${strongestSignal}。`,
        compactMeta:
          weakChapterCount > 0
            ? `${weakChapterCount} 个弱点待处理`
            : '首轮推荐题组',
        action: '开始智能训练',
      },
      error: {
        title: 'Error Wiper',
        subtitle: '重新刷一遍最近错题',
        description:
          '把之前做错的题集中处理一轮，更适合巩固失分点和收口薄弱题型。',
        compactMeta: weakChapterCount > 0 ? '优先修复错题' : '等待错题累积',
        action: '开始错题复训',
      },
      mock: {
        title: 'Mock Arena',
        subtitle: '限时整卷演练',
        description:
          '按题量和难度组一套完整模拟卷，更适合在阶段训练后做一次综合检验。',
        compactMeta: hasSubject ? '整卷限时训练' : '先选科目再开始',
        action: '进入模拟考场',
      },
    },
    en: {
      smart: {
        title: 'Smart Drill',
        subtitle: '',
        description: `Generate the most valuable adaptive pack from recent progress and answer quality. ${strongestSignal}.`,
        compactMeta:
          weakChapterCount > 0
            ? `${weakChapterCount} weak areas pending`
            : 'First recommended pack',
        action: 'Start Smart Drill',
      },
      error: {
        title: 'Error Wiper',
        subtitle: 'Redo recent mistakes',
        description:
          'Run through recent wrong answers in a focused loop to repair unstable patterns before the next session.',
        compactMeta:
          weakChapterCount > 0
            ? 'Repair mistakes first'
            : 'Waiting for error history',
        action: 'Start Error Wiper',
      },
      mock: {
        title: 'Mock Arena',
        subtitle: 'Timed full-paper simulation',
        description:
          'Generate a complete timed paper by question count and difficulty for a more exam-like check.',
        compactMeta: hasSubject ? 'Full-paper timed run' : 'Pick a subject first',
        action: 'Enter Mock Arena',
      },
    },
    ms: {
      smart: {
        title: 'Smart Drill',
        subtitle: '',
        description: `Hasilkan set latihan adaptif paling bernilai berdasarkan kemajuan dan mutu jawapan semasa. ${strongestSignal}.`,
        compactMeta:
          weakChapterCount > 0
            ? `${weakChapterCount} kelemahan menunggu`
            : 'Set cadangan pertama',
        action: 'Mula Smart Drill',
      },
      error: {
        title: 'Error Wiper',
        subtitle: 'Ulang kesilapan terkini',
        description:
          'Ulang semula soalan yang salah dalam pusingan yang lebih fokus untuk baiki pola yang belum stabil.',
        compactMeta:
          weakChapterCount > 0
            ? 'Baiki kesilapan dahulu'
            : 'Menunggu sejarah salah',
        action: 'Mula Error Wiper',
      },
      mock: {
        title: 'Mock Arena',
        subtitle: 'Simulasi kertas penuh berjadual',
        description:
          'Bina satu set peperiksaan lengkap mengikut jumlah soalan dan tahap kesukaran untuk semakan menyeluruh.',
        compactMeta: hasSubject ? 'Latihan berjadual penuh' : 'Pilih subjek dahulu',
        action: 'Masuk Mock Arena',
      },
    },
  }[lang]

  const modes = [
    {
      ...copy.smart,
      icon: BrainCircuit,
      modeLabel: 'Adaptive',
      heroImage: '/images/practice-modes/smart-drill.png',
      heroOverlayLabel: '核心入口',
      heroOverlayTitle: '智能训练',
      heroOverlayNote: '根据当前做题进展，动态出一轮最值得做的题。',
      visualClassName:
        'bg-[hsl(var(--state-info-bg))]/50 dark:bg-[radial-gradient(circle_at_top_left,hsl(var(--state-info-fg))_0%,transparent_25%),linear-gradient(135deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_58%,hsl(var(--page-bg-elevated))_100%)]',
      onStart: () => {
        if (onOpenSmartDrillPreview) {
          onOpenSmartDrillPreview()
          return
        }
        router.push(
          `/dashboard/practice/smart-drill?subjectId=${selectedSubjectId}`
        )
      },
    },
    {
      ...copy.error,
      icon: Eraser,
      modeLabel: 'Recovery',
      heroImage: '/images/practice-modes/error-wiper.png',
      heroOverlayLabel: '修复入口',
      heroOverlayTitle: '错题复训',
      heroOverlayNote: '优先收口最近失分点，把错误集中修复一轮。',
      visualClassName:
        'bg-[hsl(var(--state-danger-bg))]/50 dark:bg-[radial-gradient(circle_at_top_left,hsl(var(--state-danger-fg))_0%,transparent_25%),linear-gradient(135deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_60%,hsl(var(--page-bg-elevated))_100%)]',
      onStart: () => {
        if (onOpenErrorWiperPreview) {
          onOpenErrorWiperPreview()
          return
        }
        router.push(
          `/dashboard/practice/error-wiper?subjectId=${selectedSubjectId}`
        )
      },
    },
    {
      ...copy.mock,
      icon: Flag,
      modeLabel: 'Timed',
      heroImage: '/images/practice-modes/mock-arena.png',
      heroOverlayLabel: '挑战入口',
      heroOverlayTitle: '模拟考场',
      heroOverlayNote: '按题量与难度生成整卷，做一次完整限时演练。',
      visualClassName:
        'bg-[hsl(var(--state-warning-bg))]/50 dark:bg-[radial-gradient(circle_at_top_left,hsl(var(--state-warning-fg))_0%,transparent_25%),linear-gradient(135deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_58%,hsl(var(--page-bg-elevated))_100%)]',
      onStart: () => {
        if (onOpenMockArenaPreview) {
          onOpenMockArenaPreview()
          return
        }
        router.push(
          `/dashboard/practice/mock-arena?subjectId=${selectedSubjectId}`
        )
      },
    },
  ]

  return (
    <section>
      <div className="grid gap-3 display:grid-cols-3">
        {modes.map((mode, index) => (
          <PrimaryModeCard
            key={mode.title}
            active={activeIndex === index}
            compactMeta={mode.compactMeta}
            description={mode.description}
            disabled={!hasSubject}
            heroImage={mode.heroImage}
            heroOverlayLabel={mode.heroOverlayLabel}
            heroOverlayNote={mode.heroOverlayNote}
            heroOverlayTitle={mode.heroOverlayTitle}
            icon={mode.icon}
            modeLabel={mode.modeLabel}
            onActivate={() => setActiveIndex(index)}
            onDeactivate={() => setActiveIndex(null)}
            onStart={mode.onStart}
            primaryAction={mode.action}
            subtitle={mode.subtitle}
            title={mode.title}
            visualClassName={mode.visualClassName}
          />
        ))}
      </div>
    </section>
  )
}
