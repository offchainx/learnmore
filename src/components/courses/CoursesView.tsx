import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HeroCapsule } from '@/components/shared/HeroCapsule'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Bookmark,
  Brain,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock3,
  Coffee,
  FileText,
  Flame,
  GraduationCap,
  HelpCircle,
  List,
  Lock,
  Notebook,
  PlayCircle,
  Search,
  Target,
  X,
  Zap,
} from 'lucide-react'
import {
  subjectsData,
  mockUserContent,
  Section,
  SubTabType,
} from '@/components/shared/data'
import { LessonPlayer } from './LessonPlayer'
import { useApp } from '@/providers'
import { getSubjectLabel } from '@/lib/subjects'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import {
  pageCardTitleClass,
  pageHeroNumericValueClass,
  pageKickerClass,
  pageMetaTextClass,
  pageNumericValueClass,
  pageNumericValueCompactClass,
  pageSectionDescriptionClass,
  pageSectionTitleClass,
} from '@/components/shared/pageTypography'
import {
  pageBadgeClass,
  pageEmptyStateClass,
  pageHeroShellClass,
  pageInputClass,
  pageInsetClass,
  pagePanelClass,
  pagePillActiveClass,
  pagePillInactiveClass,
  pageSegmentedButtonClass,
  pageSegmentedControlClass,
  pageShellFrameClass,
  pageSoftInsetClass,
} from '@/components/shared/pageSurfaces'
import {
  pageCardPaddingClass,
  pageCardTitleGapClass,
  pageGridGapClass,
  pageListGapClass,
  pageSectionGapClass,
} from '@/components/shared/pageSpacing'

const shellClassName = pagePanelClass

const panelClassName = pagePanelClass

type ViewMode = 'curriculum' | 'review' | 'notebook'

const courseHeroThemes: Record<
  string,
  {
    accentClass: string
    statBorderClass: string
    patternSvg: string
    patternImage?: string
  }
> = {
  chinese: {
    accentClass: 'from-cyan-500/18 via-sky-400/10 to-blue-500/12',
    statBorderClass: 'border-cyan-400/12',
    patternImage: '/images/course-themes/chinese-hero-theme.png',
    patternSvg:
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 220' fill='none'><g stroke='white' stroke-opacity='.08' stroke-width='8' stroke-linecap='round'><path d='M45 70c28-18 56-24 92-18'/><path d='M76 48c16 22 24 42 24 74'/><path d='M145 56c18 24 22 46 18 72'/><path d='M202 78c32-18 68-24 112-12'/><path d='M230 48c20 24 28 48 30 86'/><path d='M294 42c14 16 24 38 30 68'/></g><g fill='white' fill-opacity='.045'><circle cx='78' cy='158' r='16'/><rect x='194' y='142' width='44' height='44' rx='8'/><circle cx='320' cy='152' r='18'/></g></svg>",
  },
  malay: {
    accentClass: 'from-cyan-500/14 via-teal-400/10 to-emerald-400/10',
    statBorderClass: 'border-teal-300/12',
    patternImage: '/images/course-themes/malay-hero-theme.png',
    patternSvg:
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 220' fill='none'><g stroke='white' stroke-opacity='.075' stroke-width='6'><path d='M46 150c42-54 84-54 126 0'/><path d='M196 150c36-44 74-44 110 0'/><path d='M84 118c16-16 34-24 54-24'/><path d='M238 112c14-12 30-18 48-18'/></g><g fill='white' fill-opacity='.05'><circle cx='72' cy='72' r='18'/><circle cx='284' cy='74' r='24'/><rect x='168' y='54' width='34' height='34' rx='8'/></g></svg>",
  },
  english: {
    accentClass: 'from-sky-500/16 via-indigo-400/10 to-cyan-400/10',
    statBorderClass: 'border-sky-300/12',
    patternImage: '/images/course-themes/english-hero-theme.png',
    patternSvg:
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 220' fill='none'><g stroke='white' stroke-opacity='.08' stroke-width='6'><path d='M66 152 96 60l30 92'/><path d='M78 118h36'/><path d='M164 154V66h56'/><path d='M164 110h42'/><path d='M164 154h58'/><path d='M274 154V66h54'/><path d='M274 110h40'/></g><g fill='white' fill-opacity='.045'><circle cx='324' cy='62' r='14'/><circle cx='232' cy='154' r='12'/></g></svg>",
  },
  math: {
    accentClass: 'from-cyan-500/14 via-emerald-400/10 to-sky-500/10',
    statBorderClass: 'border-emerald-300/12',
    patternImage: '/images/course-themes/math-hero-theme.png',
    patternSvg:
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 220' fill='none'><g stroke='white' stroke-opacity='.075' stroke-width='4'><path d='M48 170 102 74l54 96'/><circle cx='218' cy='112' r='44'/><path d='M156 112h124'/><path d='M218 50v124'/><path d='M292 166c18-18 34-70 54-102'/></g><g fill='white' fill-opacity='.045'><circle cx='82' cy='56' r='12'/><rect x='316' y='46' width='26' height='26' rx='6'/></g></svg>",
  },
  science: {
    accentClass: 'from-cyan-500/16 via-sky-400/10 to-teal-400/10',
    statBorderClass: 'border-cyan-300/12',
    patternImage: '/images/course-themes/science-hero-theme.png',
    patternSvg:
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 220' fill='none'><g stroke='white' stroke-opacity='.075' stroke-width='4'><circle cx='90' cy='92' r='22'/><circle cx='152' cy='78' r='16'/><circle cx='146' cy='136' r='14'/><path d='M110 86 138 80'/><path d='M106 102 134 128'/><circle cx='276' cy='108' r='38'/><path d='M238 108h76'/><path d='M276 70v76'/><ellipse cx='276' cy='108' rx='18' ry='38'/></g><g fill='white' fill-opacity='.045'><circle cx='328' cy='58' r='10'/><circle cx='338' cy='154' r='14'/></g></svg>",
  },
  history: {
    accentClass: 'from-cyan-500/12 via-amber-300/8 to-sky-500/10',
    statBorderClass: 'border-amber-200/12',
    patternImage: '/images/course-themes/history-hero-theme.png',
    patternSvg:
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 220' fill='none'><g stroke='white' stroke-opacity='.075' stroke-width='5'><path d='M54 162h116'/><path d='M72 162V78'/><path d='M96 162V66'/><path d='M122 162V84'/><path d='M146 162V72'/><path d='M60 76h102'/><path d='M222 64v96'/><path d='M250 64v96'/><path d='M278 64v96'/><path d='M210 92h80'/><path d='M210 130h80'/></g><g fill='white' fill-opacity='.045'><rect x='318' y='54' width='34' height='34' rx='8'/><circle cx='334' cy='150' r='16'/></g></svg>",
  },
  geography: {
    accentClass: 'from-cyan-500/16 via-sky-400/12 to-blue-500/10',
    statBorderClass: 'border-sky-300/12',
    patternImage: '/images/course-themes/geography-hero-theme.png',
    patternSvg:
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 220' fill='none'><g stroke='white' stroke-opacity='.075' stroke-width='4'><ellipse cx='118' cy='108' rx='56' ry='36'/><path d='M62 108h112'/><path d='M118 72v72'/><path d='M82 82c12 18 12 54 0 72'/><path d='M154 82c-12 18-12 54 0 72'/><path d='M226 152c24-18 42-56 82-80'/><path d='M236 78c24 22 42 18 82 4'/></g><g fill='white' fill-opacity='.045'><circle cx='298' cy='140' r='18'/></g></svg>",
  },
  other: {
    accentClass: 'from-cyan-500/14 via-slate-300/8 to-blue-500/10',
    statBorderClass: 'border-slate-300/12',
    patternImage: '/images/course-themes/other-hero-theme.png',
    patternSvg:
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 220' fill='none'><g stroke='white' stroke-opacity='.07' stroke-width='4'><rect x='70' y='72' width='58' height='58' rx='14'/><rect x='146' y='58' width='82' height='82' rx='18'/><circle cx='302' cy='98' r='34'/><path d='M76 154h246'/></g></svg>",
  },
}

function svgToDataUri(svg: string) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function copyByLang(lang: string, zh: string, en: string, ms?: string) {
  if (lang.startsWith('zh')) return zh
  if (lang.startsWith('ms')) return ms ?? en
  return en
}

function getContentTypeMeta(
  type: string,
  copy: (zh: string, en: string) => string
) {
  switch (type) {
    case 'video':
      return {
        label: copy('视频课', 'Video'),
        icon: PlayCircle,
        className: 'text-cyan-600 dark:text-cyan-300',
      }
    case 'reading':
      return {
        label: copy('阅读课', 'Reading'),
        icon: FileText,
        className: 'text-emerald-600 dark:text-emerald-300',
      }
    case 'quiz':
      return {
        label: copy('随堂测', 'Quiz'),
        icon: HelpCircle,
        className: 'text-amber-600 dark:text-amber-300',
      }
    default:
      return {
        label: copy('课程', 'Lesson'),
        icon: PlayCircle,
        className: 'text-text-tertiary dark:text-slate-300',
      }
  }
}

function EmptyPanel({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className={pageEmptyStateClass}>
      <div className="text-sm font-bold text-text-primary dark:text-text-primary">
        {title}
      </div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary dark:text-text-secondary">
        {description}
      </p>
      <Button
        onClick={onAction}
        className="mt-5 rounded-2xl px-4 py-2 text-sm font-bold"
      >
        {actionLabel}
      </Button>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CoursesView = ({ t }: { t: any }) => {
  const { lang } = useApp()
  const copy = (zh: string, en: string, ms?: string) =>
    copyByLang(lang, zh, en, ms)

  const subjectIds = useMemo(() => Object.keys(subjectsData), [])
  const [activeLesson, setActiveLesson] = useState<
    (Section & { chapterTitle: string }) | null
  >(null)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjectIds[0] || 'chinese'
  )
  const [activeViewMode, setActiveViewMode] = useState<ViewMode>('curriculum')
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)
  const [hasLiveClass, setHasLiveClass] = useState(true)
  const [isReviewSessionOpen, setIsReviewSessionOpen] = useState(false)
  const [notebookFilter, setNotebookFilter] = useState<SubTabType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const currentSubject =
    subjectsData[selectedSubjectId] || subjectsData[subjectIds[0]]
  const currentHeroTheme =
    courseHeroThemes[selectedSubjectId] || courseHeroThemes.other

  useEffect(() => {
    setExpandedChapter(null)
  }, [selectedSubjectId])

  const allSections = useMemo(
    () =>
      currentSubject.chapters.flatMap((chapter) =>
        chapter.sections.map((section) => ({
          ...section,
          chapterTitle: chapter.title,
        }))
      ),
    [currentSubject]
  )

  const nextLesson = useMemo(
    () =>
      allSections.find(
        (section) => !section.isCompleted && !section.isLocked
      ) ??
      allSections.find((section) => !section.isLocked) ??
      null,
    [allSections]
  )

  const completedSections = allSections.filter(
    (section) => section.isCompleted
  ).length
  const unlockedSections = allSections.filter(
    (section) => !section.isLocked
  ).length
  const lowConfidence = allSections.filter(
    (section) => section.userConfidence === 'low'
  )
  const mediumConfidence = allSections.filter(
    (section) => section.userConfidence === 'medium'
  )
  const highConfidence = allSections.filter(
    (section) => section.userConfidence === 'high'
  )
  const reviewQueue = [...lowConfidence, ...mediumConfidence]

  const notebookItems = useMemo(
    () =>
      mockUserContent.filter((item) => {
        const typeMatch =
          notebookFilter === 'all' ||
          item.type === notebookFilter ||
          item.type === `${notebookFilter.slice(0, -1)}`
        const query = searchQuery.trim().toLowerCase()
        const textMatch =
          query.length === 0 ||
          item.content.toLowerCase().includes(query) ||
          item.chapter.toLowerCase().includes(query)
        return item.subjectId === selectedSubjectId && typeMatch && textMatch
      }),
    [notebookFilter, searchQuery, selectedSubjectId]
  )

  if (activeLesson) {
    return (
      <LessonPlayer
        lesson={activeLesson}
        onBack={() => setActiveLesson(null)}
        onComplete={() => setActiveLesson(null)}
        t={t}
      />
    )
  }

  const renderSubjectSelector = () => (
    <div className="relative overflow-hidden rounded-[24px] border border-borderTone bg-surface px-4 py-3 shadow-none dark:border-borderTone dark:bg-surface">
      <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-text-tertiary dark:text-text-tertiary">
        {copy('选择科目', 'Select Subject')}
      </div>
      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
        {Object.values(subjectsData).map((subject) => {
          const isActive = selectedSubjectId === subject.id
          const localizedName = getSubjectLabel(subject.id, lang, subject.title)
          return (
            <button
              key={subject.id}
              onClick={() => setSelectedSubjectId(subject.id)}
              className={`flex min-h-[42px] shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? 'scale-[1.02] border-transparent bg-slate-900 text-white shadow-[0_12px_26px_rgba(15,23,42,0.12)] dark:bg-white dark:text-slate-950'
                  : 'bg-white/92 border-slate-200/80 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-slate-300 hover:bg-white hover:text-slate-700 dark:border-slate-700/50 dark:bg-slate-800/90 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              <subject.icon
                className={`h-4 w-4 ${
                  isActive
                    ? 'text-white dark:text-slate-950'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <span>{localizedName}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderCurriculum = () => (
    <div className={`animate-fade-in-up ${pageSectionGapClass}`}>
      {currentSubject.chapters.map((chapter) => (
        <Card key={chapter.id} className={`${panelClassName} overflow-hidden`}>
          <button
            type="button"
            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface-subtle dark:hover:bg-surface-selected"
            onClick={() =>
              setExpandedChapter(
                expandedChapter === chapter.id ? null : chapter.id
              )
            }
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-borderTone bg-surface-subtle text-sky-600 dark:border-borderTone dark:bg-surface-subtle dark:text-cyan-200">
                {expandedChapter === chapter.id ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-text-primary dark:text-text-primary">
                  {chapter.title}
                </div>
                <div className="mt-1 text-xs text-text-secondary dark:text-text-secondary">
                  {copy('本章已完成', 'Completed')}{' '}
                  {
                    chapter.sections.filter((section) => section.isCompleted)
                      .length
                  }
                  /{chapter.sections.length}
                </div>
              </div>
            </div>
            <span className={pageBadgeClass}>
              {copy(
                `${chapter.sections.length} 节`,
                `${chapter.sections.length} lessons`
              )}
            </span>
          </button>

          {expandedChapter === chapter.id ? (
            <div className="border-t border-borderTone bg-surface-subtle/70 px-4 py-3 dark:border-borderTone dark:bg-surface-subtle/80">
              <div className={pageListGapClass}>
                {chapter.sections.map((section) => {
                  const meta = getContentTypeMeta(section.contentType, copy)
                  const MetaIcon = meta.icon
                  const isNext = nextLesson?.id === section.id

                  return (
                    <div
                      key={section.id}
                      className={`flex items-center justify-between rounded-[20px] border px-4 py-3 transition-all ${
                        isNext
                          ? 'border-cyan-300/40 bg-cyan-50 text-text-primary dark:border-cyan-400/25 dark:bg-cyan-400/[0.08]'
                          : 'border-borderTone bg-surface hover:border-blue-300/60 hover:bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle dark:hover:border-sky-400/20 dark:hover:bg-surface-selected'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {section.isCompleted ? (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                            <CircleCheck className="h-4 w-4" />
                          </div>
                        ) : section.isLocked ? (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-text-tertiary dark:bg-surface-subtle dark:text-text-tertiary">
                            <Lock className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
                            <MetaIcon className="h-4 w-4" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div
                              className={`text-[11px] font-black uppercase tracking-[0.16em] ${meta.className}`}
                            >
                              {meta.label}
                            </div>
                            {isNext ? (
                              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-cyan-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-100">
                                {copy('继续学习', 'Continue')}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-1 truncate text-sm font-bold text-text-primary dark:text-text-primary">
                            {section.title}
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-text-secondary dark:text-text-secondary">
                            <span className="flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {section.duration}
                            </span>
                            <span>+{section.xp} XP</span>
                          </div>
                        </div>
                      </div>

                      {!section.isLocked ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            setActiveLesson({
                              ...section,
                              chapterTitle: chapter.title,
                            })
                          }
                          className={`rounded-2xl px-4 text-xs font-bold ${
                            section.isCompleted
                              ? 'border border-blue-200 bg-surface-selected text-sky-700 hover:bg-blue-100 dark:border-borderTone dark:bg-surface-selected dark:text-white dark:hover:bg-surface-selected'
                              : ''
                          }`}
                        >
                          {section.isCompleted
                            ? copy('回看', 'Review')
                            : isNext
                              ? copy('继续', 'Continue')
                              : copy('开始', 'Start')}
                        </Button>
                      ) : (
                        <div className="px-3 text-xs font-bold text-text-tertiary">
                          {copy('未解锁', 'Locked')}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}
        </Card>
      ))}
    </div>
  )

  const renderSmartReview = () => (
    <div className={`animate-fade-in-up ${pageSectionGapClass}`}>
      <div className={`grid md:grid-cols-3 ${pageGridGapClass}`}>
        {[
          {
            label: copy('低信心', 'Low Confidence'),
            value: lowConfidence.length,
            hint: copy('优先复盘', 'Urgent review'),
            className:
              'border-red-200 bg-red-50 text-red-700 dark:border-red-400/15 dark:bg-red-400/[0.08] dark:text-red-200',
            icon: AlertTriangle,
          },
          {
            label: copy('中信心', 'Medium Confidence'),
            value: mediumConfidence.length,
            hint: copy('继续加固', 'Needs reinforcement'),
            className:
              'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/[0.08] dark:text-amber-200',
            icon: Brain,
          },
          {
            label: copy('高信心', 'High Confidence'),
            value: highConfidence.length,
            hint: copy('保持节奏', 'Keep momentum'),
            className:
              'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/[0.08] dark:text-emerald-200',
            icon: CircleCheck,
          },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card
              key={item.label}
              className={`${panelClassName} ${pageCardPaddingClass}`}
            >
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${item.className}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
              <div className="mt-4 text-[28px] font-black text-text-primary dark:text-text-primary">
                {item.value}
              </div>
              <div className="mt-1 text-xs text-text-secondary dark:text-text-secondary">
                {item.hint}
              </div>
            </Card>
          )
        })}
      </div>

      <Card className={`${panelClassName} ${pageCardPaddingClass}`}>
        <div
          className={`flex items-start justify-between gap-4 ${pageCardTitleGapClass}`}
        >
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary dark:text-text-primary">
              <Flame className="h-5 w-5 text-amber-300" />
              {copy('今日复习队列', 'Today’s Review Queue')}
            </h3>
            <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary">
              {copy(
                '先把低信心和中信心内容补齐，再回到正常课程推进。',
                'Close low and medium confidence gaps first, then return to the normal path.'
              )}
            </p>
          </div>
          {reviewQueue.length > 0 ? (
            <Button
              className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
              onClick={() => setIsReviewSessionOpen(true)}
            >
              {copy('开始复习', 'Start Review')}
            </Button>
          ) : null}
        </div>

        {reviewQueue.length > 0 ? (
          <div className={pageListGapClass}>
            {reviewQueue.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  setActiveLesson({
                    ...section,
                    chapterTitle: copy('复习模式', 'Review Mode'),
                  })
                }
                className="group flex w-full items-center justify-between rounded-[22px] border border-borderTone bg-surface px-4 py-4 text-left shadow-surface transition-all hover:-translate-y-0.5 hover:border-blue-300/60 hover:bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle dark:hover:border-cyan-400/25 dark:hover:bg-surface-selected"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-bold text-text-primary dark:text-text-primary">
                      {section.title}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] ${
                        section.userConfidence === 'low'
                          ? 'bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-200'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200'
                      }`}
                    >
                      {section.userConfidence === 'low'
                        ? copy('优先', 'Urgent')
                        : copy('加固', 'Reinforce')}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-text-secondary dark:text-text-secondary">
                    {copy(
                      '建议今天完成这一项复习',
                      'Recommended to finish today'
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-sky-600 dark:text-text-tertiary dark:group-hover:text-cyan-200" />
              </button>
            ))}
          </div>
        ) : (
          <EmptyPanel
            title={copy('当前没有需要优先复习的内容', 'No urgent review items')}
            description={copy(
              '继续保持课程学习节奏，系统会在检测到波动时把内容推到这里。',
              'Keep your learning momentum. Items will appear here when the system detects instability.'
            )}
            actionLabel={copy('继续课程学习', 'Continue Courses')}
            onAction={() => setActiveViewMode('curriculum')}
          />
        )}
      </Card>
    </div>
  )

  const renderNotebook = () => (
    <div className={`animate-fade-in-up ${pageSectionGapClass}`}>
      <Card className={`${panelClassName} ${pageCardPaddingClass}`}>
        <div className="dark:border-white/8 flex flex-col gap-4 border-b border-borderTone pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            {[
              { key: 'all', label: copy('全部', 'All') },
              { key: 'notes', label: copy('笔记', 'Notes') },
              { key: 'bookmarks', label: copy('书签', 'Bookmarks') },
              { key: 'highlights', label: copy('高亮', 'Highlights') },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setNotebookFilter(item.key as SubTabType)}
                className={`rounded-2xl px-3 py-2 text-sm font-bold transition-all ${
                  notebookFilter === item.key
                    ? pagePillActiveClass
                    : pagePillInactiveClass
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={copy('搜索笔记...', 'Search notes...')}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={`${pageInputClass} py-2 pl-9 pr-3`}
            />
          </div>
        </div>

        <div className={`mt-4 grid ${pageGridGapClass}`}>
          {notebookItems.length > 0 ? (
            notebookItems.map((item) => (
              <Card
                key={item.id}
                className="rounded-[22px] border border-borderTone bg-surface p-4 text-text-primary shadow-surface transition-all hover:border-blue-300/60 hover:bg-surface-subtle dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:border-cyan-400/25 dark:hover:bg-white/[0.06]"
              >
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {item.type === 'note' ? (
                      <Notebook className="h-4 w-4 text-cyan-300" />
                    ) : null}
                    {item.type === 'bookmark' ? (
                      <Bookmark className="h-4 w-4 text-red-300" />
                    ) : null}
                    {item.type === 'highlight' ? (
                      <Zap className="h-4 w-4 text-amber-300" />
                    ) : null}
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-text-tertiary dark:text-slate-400">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-xs text-text-tertiary dark:text-slate-500">
                    {item.date}
                  </span>
                </div>
                <div className="text-sm font-bold text-text-primary dark:text-white">
                  {item.chapter}
                </div>
                <p className="mt-2 text-sm leading-6 text-text-secondary dark:text-slate-300">
                  {item.content}
                </p>
              </Card>
            ))
          ) : (
            <EmptyPanel
              title={copy(
                '当前没有匹配的笔记内容',
                'No matching notebook items'
              )}
              description={copy(
                '切换筛选或搜索关键词后，这里会展示你在当前科目下保存的笔记、书签和高亮。',
                'Change the filter or search query to find your saved notes, bookmarks, and highlights.'
              )}
              actionLabel={copy('清空筛选', 'Clear Filters')}
              onAction={() => {
                setNotebookFilter('all')
                setSearchQuery('')
              }}
            />
          )}
        </div>
      </Card>
    </div>
  )

  return (
    <div className="relative px-3 py-1.5 sm:px-4 sm:py-2">
      {isReviewSessionOpen ? (
        <div className="fixed inset-0 z-[100] flex animate-fade-in-up flex-col bg-page/95 backdrop-blur-sm dark:bg-slate-950/95">
          <div className="dark:border-white/8 flex items-center justify-between border-b border-borderTone px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-primary dark:text-white">
                  {copy('专注复习模式', 'Focus Review Mode')}
                </h2>
                <p className="text-xs text-text-secondary dark:text-slate-400">
                  {copy(
                    '本轮将优先处理低信心内容',
                    'This round prioritizes low confidence topics'
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsReviewSessionOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-borderTone bg-surface text-text-tertiary transition-colors hover:text-text-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300 shadow-[0_0_70px_rgba(251,191,36,0.16)]">
              <Brain className="h-14 w-14" />
            </div>
            <h1 className="text-4xl font-black text-text-primary dark:text-white">
              {copy(
                `你有 ${reviewQueue.length} 项内容需要复习`,
                `You have ${reviewQueue.length} items to review`
              )}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-text-secondary dark:text-slate-400">
              {copy(
                '预计耗时 15 分钟左右。现在开始，把不稳的点先补齐。',
                'Estimated time is about 15 minutes. Start now and close your weak points first.'
              )}
            </p>
            <Button
              className="mt-10 rounded-full px-10 py-6 text-lg font-bold"
              onClick={() => {
                setIsReviewSessionOpen(false)
                if (reviewQueue[0]) {
                  setActiveLesson({
                    ...reviewQueue[0],
                    chapterTitle: copy('智能复习', 'Smart Review'),
                  })
                }
              }}
            >
              {copy('开始这一轮复习', 'Start Review Session')}
            </Button>
          </div>
        </div>
      ) : null}

      <div
        className={`mx-auto w-full max-w-[1820px] ${pageShellFrameClass} sm:p-2.5`}
      >
        <div className={pageSectionGapClass}>
          <PageHeroShell
            className={`${pageHeroShellClass} bg-surface bg-none shadow-none`}
            title={
              <>
                <span>{copy('课程学习', 'Course Learning')}</span>
                <HeroCapsule label="Courses" />
              </>
            }
            subtitle={copy(
              '继续你的课程推进、进入复习模式，或回看当前科目的笔记与高亮。',
              'Continue your course progress, switch into review mode, or revisit your notebook for the current subject.'
            )}
            titleClassName="flex flex-wrap items-center gap-2 text-2xl sm:text-[30px]"
          />

          {renderSubjectSelector()}

          <section
            className={`grid xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,0.95fr)] ${pageGridGapClass}`}
          >
            <div className={pageSectionGapClass}>
              <Card
                className={`${shellClassName} overflow-hidden p-0 shadow-none`}
              >
                <div className="relative px-5 py-5">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(241,247,255,0.95))]" />
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${currentHeroTheme.accentClass}`}
                    style={{ opacity: 0.2 }}
                  />
                  <div className="bg-cyan-400/8 absolute -right-6 -top-8 h-36 w-36 rounded-full blur-3xl" />
                  <div className="bg-sky-500/6 absolute -left-10 bottom-0 h-28 w-28 rounded-full blur-3xl" />
                  {currentHeroTheme.patternImage ? (
                    <div
                      className="pointer-events-none absolute inset-0 hidden xl:block"
                      style={{
                        backgroundImage: [
                          'linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.92) 28%, rgba(255,255,255,0.74) 46%, rgba(255,255,255,0.34) 66%, rgba(255,255,255,0.16) 100%)',
                          'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0.12) 100%)',
                          `url(${currentHeroTheme.patternImage})`,
                        ].join(','),
                        backgroundSize: 'cover, cover, cover',
                        backgroundPosition: 'center, center, center',
                        backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
                        opacity: '0.92',
                      }}
                    />
                  ) : null}
                  <div
                    className="bg-right-center pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] bg-no-repeat xl:block"
                    style={{
                      backgroundImage: currentHeroTheme.patternImage
                        ? 'none'
                        : svgToDataUri(currentHeroTheme.patternSvg),
                      backgroundSize: 'min(420px, 92%) auto',
                    }}
                  />

                  <div className="relative flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700 backdrop-blur-sm dark:border-cyan-300/15 dark:bg-white/[0.07] dark:text-cyan-100">
                        {getSubjectLabel(
                          selectedSubjectId,
                          lang,
                          currentSubject.title
                        )}
                      </div>
                      <h2
                        className={`mt-3 ${pageHeroNumericValueClass} text-text-primary dark:text-white`}
                      >
                        {currentSubject.title}
                      </h2>
                      <p className="mt-1 text-[13px] leading-6 text-text-secondary dark:text-slate-200">
                        {currentSubject.subTitle}
                      </p>
                      <p className="mt-3 max-w-xl text-[13px] leading-6 text-text-secondary dark:text-text-secondary">
                        {copy(
                          '把课程进度、已完成内容和待复习内容收在同一个总览里，先看清状态，再决定继续上课还是切到复习。',
                          'Keep progress, completed lessons, and review backlog in one overview before deciding whether to continue the path or switch into review.'
                        )}
                      </p>
                    </div>

                    <div
                      className={`grid grid-cols-2 xl:w-[420px] ${pageGridGapClass}`}
                    >
                      <div
                        className={`${pageSoftInsetClass} px-4 py-3 backdrop-blur-sm ${currentHeroTheme.statBorderClass}`}
                      >
                        <div className={pageKickerClass}>
                          {copy('课程进度', 'Progress')}
                        </div>
                        <div className={pageNumericValueClass}>
                          {currentSubject.progress}%
                        </div>
                      </div>
                      <div
                        className={`${pageSoftInsetClass} px-4 py-3 backdrop-blur-sm ${currentHeroTheme.statBorderClass}`}
                      >
                        <div className={pageKickerClass}>
                          {copy('已解锁课程', 'Unlocked')}
                        </div>
                        <div className={pageNumericValueClass}>
                          {unlockedSections}
                        </div>
                      </div>
                      <div
                        className={`${pageSoftInsetClass} px-4 py-3 backdrop-blur-sm ${currentHeroTheme.statBorderClass}`}
                      >
                        <div className={pageKickerClass}>
                          {copy('已完成', 'Completed')}
                        </div>
                        <div className={pageNumericValueClass}>
                          {completedSections}
                        </div>
                      </div>
                      <div
                        className={`${pageSoftInsetClass} px-4 py-3 backdrop-blur-sm ${currentHeroTheme.statBorderClass}`}
                      >
                        <div className={pageKickerClass}>
                          {copy('待复习', 'Review Queue')}
                        </div>
                        <div className={pageNumericValueClass}>
                          {reviewQueue.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div
                      className="h-3 rounded-full bg-[linear-gradient(90deg,#22D3EE,#60A5FA)] shadow-[0_0_18px_rgba(34,211,238,0.28)]"
                      style={{ width: `${currentSubject.progress}%` }}
                    />
                  </div>
                </div>
              </Card>

              <div className={pageSegmentedControlClass}>
                {[
                  {
                    key: 'curriculum' as ViewMode,
                    label: copy('课程目录', 'Curriculum'),
                    icon: List,
                  },
                  {
                    key: 'review' as ViewMode,
                    label: copy('智能复习', 'Smart Review'),
                    icon: Brain,
                  },
                  {
                    key: 'notebook' as ViewMode,
                    label: copy('我的笔记', 'Notebook'),
                    icon: Notebook,
                  },
                ].map((item) => {
                  const Icon = item.icon
                  const isActive = activeViewMode === item.key
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveViewMode(item.key)}
                      className={`${pageSegmentedButtonClass} flex items-center gap-2 ${
                        isActive
                          ? pagePillActiveClass
                          : `border border-transparent ${pagePillInactiveClass}`
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  )
                })}
              </div>

              <div className="min-h-[420px]">
                {activeViewMode === 'curriculum' ? renderCurriculum() : null}
                {activeViewMode === 'review' ? renderSmartReview() : null}
                {activeViewMode === 'notebook' ? renderNotebook() : null}
              </div>
            </div>

            <div className={pageSectionGapClass}>
              <Card className={`${panelClassName} ${pageCardPaddingClass}`}>
                <div
                  className={`flex items-start justify-between gap-4 ${pageCardTitleGapClass}`}
                >
                  <div>
                    <h3
                      className={`flex items-center gap-2 ${pageSectionTitleClass}`}
                    >
                      <GraduationCap className="h-5 w-5 text-cyan-300" />
                      {copy('学习目标', 'Study Goal')}
                    </h3>
                    <p className={pageSectionDescriptionClass}>
                      {copy(
                        '当前科目的目标、进度和下一步动作。',
                        'Target grade, progress, and the next best action for this subject.'
                      )}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-500" />
                </div>

                <div className={`${pageInsetClass} p-4`}>
                  <div className={pageKickerClass}>
                    {copy('目标等级', 'Target Grade')}
                  </div>
                  <div className={`mt-2 ${pageHeroNumericValueClass}`}>A*</div>
                  <div className={`mt-3 grid grid-cols-2 ${pageGridGapClass}`}>
                    <div className={`${pageSoftInsetClass} px-3 py-3`}>
                      <div className={pageKickerClass}>
                        {copy('完成进度', 'Progress')}
                      </div>
                      <div className={`mt-1 ${pageNumericValueCompactClass}`}>
                        {currentSubject.progress}%
                      </div>
                    </div>
                    <div className={`${pageSoftInsetClass} px-3 py-3`}>
                      <div className={pageKickerClass}>
                        {copy('推荐动作', 'Next')}
                      </div>
                      <div className={`mt-1 ${pageCardTitleClass}`}>
                        {nextLesson
                          ? copy('继续下一课', 'Continue Lesson')
                          : copy('进入复习', 'Review')}
                      </div>
                    </div>
                  </div>
                  {nextLesson ? (
                    <div className="border-cyan-400/12 mt-4 rounded-[20px] border bg-cyan-400/[0.06] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-sky-700 dark:text-cyan-200">
                            {copy('推荐继续', 'Continue')}
                          </div>
                          <div className={`mt-2 ${pageSectionTitleClass}`}>
                            {nextLesson.title}
                          </div>
                          <div className={`mt-1 ${pageMetaTextClass}`}>
                            {nextLesson.chapterTitle}
                          </div>
                          <div
                            className={`mt-4 flex items-center gap-3 ${pageMetaTextClass}`}
                          >
                            <span className="flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {nextLesson.duration}
                            </span>
                            <span>+{nextLesson.xp} XP</span>
                          </div>
                        </div>
                        <BookOpenCheck className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />
                      </div>
                      <Button
                        className="mt-4 w-full rounded-2xl"
                        onClick={() => setActiveLesson(nextLesson)}
                      >
                        {copy('进入这一课', 'Start This Lesson')}
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <EmptyPanel
                        title={copy(
                          '当前没有可继续的课程',
                          'No lesson available'
                        )}
                        description={copy(
                          '当前科目的课程已经完成或暂未开放。你可以先进入智能复习模式。',
                          'This subject is completed or temporarily unavailable. You can switch into smart review first.'
                        )}
                        actionLabel={copy('进入智能复习', 'Open Review')}
                        onAction={() => setActiveViewMode('review')}
                      />
                    </div>
                  )}
                </div>
              </Card>

              {hasLiveClass ? (
                <Card className={`${panelClassName} ${pageCardPaddingClass}`}>
                  <div
                    className={`flex items-start justify-between gap-4 ${pageCardTitleGapClass}`}
                  >
                    <div>
                      <h3 className={pageSectionTitleClass}>
                        {copy('下一节直播课', 'Next Live Class')}
                      </h3>
                      <p className={pageSectionDescriptionClass}>
                        {copy(
                          '如果你想跟上本周节奏，可以先预留时间。',
                          'Reserve time if you want to stay on pace this week.'
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setHasLiveClass(false)}
                      className="text-xs font-medium text-text-tertiary transition-colors hover:text-text-primary dark:text-slate-500 dark:hover:text-white"
                    >
                      {copy('隐藏', 'Dismiss')}
                    </button>
                  </div>
                  <div className="border-cyan-400/12 rounded-[24px] border bg-cyan-400/[0.06] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-2xl bg-surface-subtle text-text-primary dark:bg-white/[0.06] dark:text-white">
                        <span className="text-[10px] font-semibold">18</span>
                        <span className="text-[10px]">OCT</span>
                      </div>
                      <div>
                        <div className={pageCardTitleClass}>
                          {copy('考试策略直播课', 'Exam Prep Strategy')}
                        </div>
                        <div className={`mt-1 ${pageMetaTextClass}`}>
                          19:00 - 20:30 · Mr. Anderson
                        </div>
                      </div>
                    </div>
                    <Button className="mt-4 w-full rounded-2xl">
                      {copy('设置提醒', 'Set Reminder')}
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card
                  className={`${panelClassName} text-center ${pageCardPaddingClass}`}
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-text-tertiary dark:bg-white/[0.06] dark:text-slate-400">
                    <Coffee className="h-6 w-6" />
                  </div>
                  <div className={pageSectionTitleClass}>
                    {copy('本周没有直播课', 'No live class this week')}
                  </div>
                  <p className={pageSectionDescriptionClass}>
                    {copy(
                      '你可以先用课程学习或智能复习把节奏保持住。',
                      'Use curriculum or smart review to keep your momentum this week.'
                    )}
                  </p>
                  <Button
                    className="mt-5 rounded-2xl"
                    onClick={() => setHasLiveClass(true)}
                  >
                    {copy('重新显示直播卡片', 'Show Live Class Again')}
                  </Button>
                </Card>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
