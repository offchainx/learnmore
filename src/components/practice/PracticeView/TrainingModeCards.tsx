import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BrainCircuit, Eraser, TimerReset, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/providers';

interface PracticeModeGridProps {
  selectedSubjectId: string;
  currentSubjectTitle: string;
  chapterCount: number;
  pastPaperCount: number;
  weakChapterCount: number;
  strongestSignal: string;
  onOpenSmartDrillPreview?: () => void;
  onOpenErrorWiperPreview?: () => void;
  onOpenMockArenaPreview?: () => void;
}

interface PrimaryModeCardProps {
  active: boolean;
  compactMeta: string;
  description: string;
  disabled: boolean;
  icon: React.ElementType;
  modeLabel: string;
  onActivate: () => void;
  onDeactivate: () => void;
  onStart: () => void;
  primaryAction: string;
  subtitle: string;
  title: string;
  visualClassName: string;
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
        if (!disabled) onActivate();
      }}
      onMouseLeave={onDeactivate}
      onFocus={() => {
        if (!disabled) onActivate();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onDeactivate();
        }
      }}
      className={`group relative min-h-[188px] overflow-hidden rounded-[28px] border text-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 ${
        active
          ? 'z-10 -translate-y-1 scale-[1.015] border-white/20 shadow-[0_28px_58px_rgba(2,8,23,0.48)]'
          : 'border-white/10 shadow-[0_14px_28px_rgba(2,8,23,0.22)] hover:-translate-y-0.5 hover:border-white/14'
      } ${disabled ? 'opacity-60' : 'cursor-pointer'} ${visualClassName}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.44)_55%,rgba(2,6,23,0.86)_100%)]" />
      <div className={`absolute inset-0 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>
      <div className="absolute inset-[1px] rounded-[27px] border border-white/6" />

      <div className="relative flex h-full flex-col justify-between p-4">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-sm transition-all duration-500 ${active ? 'scale-105 bg-white/14 shadow-[0_12px_22px_rgba(15,23,42,0.16)]' : ''}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">
              {modeLabel}
            </span>
          </div>

          <div className="mt-5">
            <h3 className="text-[26px] font-black leading-none tracking-tight">{title}</h3>
            <p className="mt-1.5 text-[12px] font-semibold text-slate-100/90">{subtitle}</p>
            <p className={`mt-2 max-w-[30ch] text-[11px] leading-[18px] text-slate-300 transition-all duration-500 ${active ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}>
              {description}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <div className={`transition-all duration-500 ${active ? 'opacity-0' : 'opacity-100'}`}>
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-200 backdrop-blur-sm">
              {compactMeta}
            </span>
          </div>

          <div className={`mt-2.5 flex items-center gap-3 transition-all duration-500 ${active ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}>
            <Button
              className="h-9 rounded-2xl bg-white px-4 text-slate-950 shadow-[0_10px_20px_rgba(255,255,255,0.12)] hover:bg-slate-100"
              onClick={(event) => {
                event.stopPropagation();
                if (!disabled) {
                  onStart();
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
  );
}

export const PracticeModeGrid: React.FC<PracticeModeGridProps> = ({
  selectedSubjectId,
  currentSubjectTitle,
  chapterCount,
  pastPaperCount,
  weakChapterCount,
  strongestSignal,
  onOpenSmartDrillPreview,
  onOpenErrorWiperPreview,
  onOpenMockArenaPreview,
}) => {
  const router = useRouter();
  const { lang } = useApp();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const hasSubject = Boolean(selectedSubjectId);

  const copy = {
    zh: {
      badge: '核心模式',
      heading: '三种主要练习模式',
      subheading: '首屏只保留最核心的三个入口，先开始练习，再向下看章节和真题。',
      smart: {
        title: 'Smart Drill',
        subtitle: hasSubject ? `${currentSubjectTitle} 的默认主路径` : '先选科目再开始',
        description: `根据当前做题进展和答题表现，动态出一轮最值得做的题。${strongestSignal}。`,
        compactMeta: weakChapterCount > 0 ? `${weakChapterCount} 个弱点待处理` : '首轮推荐题组',
        action: '开始智能训练',
      },
      error: {
        title: 'Error Wiper',
        subtitle: '重新刷一遍最近错题',
        description: '把之前做错的题集中处理一轮，更适合巩固失分点和收口薄弱题型。',
        compactMeta: weakChapterCount > 0 ? '优先修复错题' : '等待错题累积',
        action: '开始错题复训',
      },
      mock: {
        title: 'Mock Arena',
        subtitle: '进入完整模拟考场',
        description: '在限时氛围里完成整套模拟卷，检查真实考试中的节奏、时间分配和稳定性。',
        compactMeta: pastPaperCount > 0 ? `${pastPaperCount} 套可开始` : '等待卷库数据',
        action: '进入模拟考场',
      },
    },
    en: {
      badge: 'Core Modes',
      heading: 'Three Core Practice Modes',
      subheading: 'Keep the first screen focused on the three main entry points, then move into chapters and papers below.',
      smart: {
        title: 'Smart Drill',
        subtitle: hasSubject ? `Default path for ${currentSubjectTitle}` : 'Pick a subject first',
        description: `Generate the most valuable adaptive pack from recent progress and answer quality. ${strongestSignal}.`,
        compactMeta: weakChapterCount > 0 ? `${weakChapterCount} weak areas pending` : 'First recommended pack',
        action: 'Start Smart Drill',
      },
      error: {
        title: 'Error Wiper',
        subtitle: 'Redo recent mistakes',
        description: 'Run through recent wrong answers in a focused loop to repair unstable patterns before the next session.',
        compactMeta: weakChapterCount > 0 ? 'Repair mistakes first' : 'Waiting for error history',
        action: 'Start Error Wiper',
      },
      mock: {
        title: 'Mock Arena',
        subtitle: 'Full exam simulation',
        description: 'Complete a timed paper and check pacing, exam rhythm, and final stability under pressure.',
        compactMeta: pastPaperCount > 0 ? `${pastPaperCount} papers ready` : 'Paper bank pending',
        action: 'Enter Mock Arena',
      },
    },
    ms: {
      badge: 'Mod Utama',
      heading: 'Tiga Mod Latihan Utama',
      subheading: 'Paparan pertama hanya simpan tiga pintu masuk utama, kemudian barulah ke bab dan kertas.',
      smart: {
        title: 'Smart Drill',
        subtitle: hasSubject ? `Laluan utama untuk ${currentSubjectTitle}` : 'Pilih subjek dahulu',
        description: `Hasilkan set latihan adaptif paling bernilai berdasarkan kemajuan dan mutu jawapan semasa. ${strongestSignal}.`,
        compactMeta: weakChapterCount > 0 ? `${weakChapterCount} kelemahan menunggu` : 'Set cadangan pertama',
        action: 'Mula Smart Drill',
      },
      error: {
        title: 'Error Wiper',
        subtitle: 'Ulang kesilapan terkini',
        description: 'Ulang semula soalan yang salah dalam pusingan yang lebih fokus untuk baiki pola yang belum stabil.',
        compactMeta: weakChapterCount > 0 ? 'Baiki kesilapan dahulu' : 'Menunggu sejarah salah',
        action: 'Mula Error Wiper',
      },
      mock: {
        title: 'Mock Arena',
        subtitle: 'Simulasi peperiksaan penuh',
        description: 'Lengkapkan kertas berhad masa untuk semak rentak, pengurusan masa dan kestabilan prestasi sebenar.',
        compactMeta: pastPaperCount > 0 ? `${pastPaperCount} kertas sedia` : 'Bank kertas belum ada',
        action: 'Masuk Mock Arena',
      },
    },
  }[lang];

  const modes = [
    {
      ...copy.smart,
      icon: BrainCircuit,
      modeLabel: 'Adaptive',
      visualClassName:
        'bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_25%),linear-gradient(135deg,_#132340,_#09152a_58%,_#07101f)]',
      onStart: () => {
        if (onOpenSmartDrillPreview) {
          onOpenSmartDrillPreview();
          return;
        }
        router.push(`/dashboard/practice/smart-drill?subjectId=${selectedSubjectId}`);
      },
    },
    {
      ...copy.error,
      icon: Eraser,
      modeLabel: 'Recovery',
      visualClassName:
        'bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.18),_transparent_25%),linear-gradient(135deg,_#2A1E2A,_#10182B_60%,_#09111F)]',
      onStart: () => {
        if (onOpenErrorWiperPreview) {
          onOpenErrorWiperPreview();
          return;
        }
        router.push(`/dashboard/practice/error-wiper?subjectId=${selectedSubjectId}`);
      },
    },
    {
      ...copy.mock,
      icon: Trophy,
      modeLabel: 'Exam',
      visualClassName:
        'bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.2),_transparent_28%),linear-gradient(135deg,_#2B2959,_#121C39_60%,_#0A1326)]',
      onStart: () => {
        if (onOpenMockArenaPreview) {
          onOpenMockArenaPreview();
          return;
        }
        router.push(`/dashboard/practice/mock-arena?subjectId=${selectedSubjectId}`);
      },
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[22px] font-black tracking-tight text-slate-950 dark:text-white">{copy.heading}</h3>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <TimerReset className="h-3 w-3" />
          {copy.badge}
        </div>
      </div>
      <div>
        <p className="max-w-2xl text-[13px] leading-5 text-slate-600 dark:text-slate-300">{copy.subheading}</p>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
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
  );
};
