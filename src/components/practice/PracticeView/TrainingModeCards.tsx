import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  BrainCircuit,
  Eraser,
  Flag,
  TimerReset,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  pageDisplayTitleClass,
  pageHeroEyebrowClass,
  pageMetaTextClass,
  pageSectionDescriptionClass,
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
      className={`ease-[cubic-bezier(0.22,1,0.36,1)] group relative min-h-[188px] overflow-hidden rounded-[28px] border text-text-primary transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))]/40 dark:text-text-primary ${
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

      <div className="relative flex h-full flex-col justify-between p-4">
        <div>
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
            <p className={cn(pageMetaTextClass, 'mt-1.5 text-text-secondary dark:text-text-secondary')}>
              {subtitle}
            </p>
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

        <div className="mt-3">
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

  const copy = {
    zh: {
      badge: '核心模式',
      heading: '三种主要练习模式',
      subheading:
        '首屏先保留最核心的三个入口，先开始训练，再向下看章节和真题。',
      smart: {
        title: 'Smart Drill',
        subtitle: hasSubject
          ? `${currentSubjectTitle} 的默认主路径`
          : '先选科目再开始',
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
      badge: 'Core Modes',
      heading: 'Three Core Practice Modes',
      subheading:
        'Keep the first screen focused on the three main entry points, then move into chapters and papers below.',
      smart: {
        title: 'Smart Drill',
        subtitle: hasSubject
          ? `Default path for ${currentSubjectTitle}`
          : 'Pick a subject first',
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
      badge: 'Mod Utama',
      heading: 'Tiga Mod Latihan Utama',
      subheading:
        'Paparan pertama hanya simpan tiga pintu masuk utama, kemudian barulah ke bab dan kertas.',
      smart: {
        title: 'Smart Drill',
        subtitle: hasSubject
          ? `Laluan utama untuk ${currentSubjectTitle}`
          : 'Pilih subjek dahulu',
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
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className={pageDisplayTitleClass}>{copy.heading}</h3>
        <div
          className={cn(
            pageHeroEyebrowClass,
            'inline-flex items-center gap-2 rounded-full bg-surface-subtle px-3 py-1 text-text-secondary dark:bg-surface-subtle dark:text-text-secondary'
          )}
        >
          <TimerReset className="h-3 w-3" />
          {copy.badge}
        </div>
      </div>
      <div>
        <p
          className={cn(
            pageSectionDescriptionClass,
            'max-w-2xl text-text-secondary dark:text-text-secondary'
          )}
        >
          {copy.subheading}
        </p>
      </div>

      <div className="grid gap-3 2xl:grid-cols-3">
        {modes.map((mode, index) => (
          <PrimaryModeCard
            key={mode.title}
            active={activeIndex === index}
            compactMeta={mode.compactMeta}
            description={mode.description}
            disabled={!hasSubject}
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
