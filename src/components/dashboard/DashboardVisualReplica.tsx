'use client'

import Image, { type StaticImageData } from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import studyTimeSectionIcon from '../../../.codex/artifacts/dashboard-icons/study-time-section-icon.png'
import subjectSectionIcon from '../../../.codex/artifacts/dashboard-icons/subject-section-icon.png'
import subjectMathIcon from '../../../.codex/artifacts/dashboard-icons/subject-math-icon.png'
import subjectScienceIcon from '../../../.codex/artifacts/dashboard-icons/subject-science-icon.png'
import subjectChineseIcon from '../../../.codex/artifacts/dashboard-icons/subject-chinese-icon.png'
import subjectGeographyIcon from '../../../.codex/artifacts/dashboard-icons/subject-geography-icon.png'
import profileAvatarGenerated from '../../../.codex/artifacts/profile-assets/profile-avatar-generated.png'
import profileBadgeGenerated from '../../../.codex/artifacts/profile-assets/profile-badge-generated.png'
import pathBackgroundMountain from '../../../.codex/artifacts/path-assets/path-background-mountain.png'
import pathStepActive from '../../../.codex/artifacts/path-assets/path-step-active.png'
import pathStepDone from '../../../.codex/artifacts/path-assets/path-step-done.png'
import pathStepLocked from '../../../.codex/artifacts/path-assets/path-step-locked.png'
import pathStepTreasure from '../../../.codex/artifacts/path-assets/path-step-treasure.png'
import pathTitleIcon from '../../../.codex/artifacts/path-assets/path-title-icon.png'
import streakCampfireImage from '../../../.codex/artifacts/streak-assets/streak-campfire.png'
import streakTitleIcon from '../../../.codex/artifacts/streak-assets/streak-title-icon.png'
import reviewEnglishIcon from '../../../.codex/artifacts/review-assets/review-english-icon.png'
import reviewMathIcon from '../../../.codex/artifacts/review-assets/review-math-icon.png'
import reviewScienceIcon from '../../../.codex/artifacts/review-assets/review-science-icon.png'
import reviewSocialIcon from '../../../.codex/artifacts/review-assets/review-social-icon.png'
import reviewTitleIcon from '../../../.codex/artifacts/review-assets/review-title-icon.png'
import { DashboardGoalLayoutInspector } from './DashboardGoalLayoutInspector'
import { DashboardHeroLayoutInspector } from './DashboardHeroLayoutInspector'
import { DashboardCalendarLayoutInspector } from './DashboardCalendarLayoutInspector'
import { DashboardPathLayoutInspector } from './DashboardPathLayoutInspector'
import { DashboardProfileLayoutInspector } from './DashboardProfileLayoutInspector'
import { DashboardReviewLayoutInspector } from './DashboardReviewLayoutInspector'
import { DashboardSubjectLayoutInspector } from './DashboardSubjectLayoutInspector'
import { DashboardStreakLayoutInspector } from './DashboardStreakLayoutInspector'
import { DashboardTaskLayoutInspector } from './DashboardTaskLayoutInspector'
import { DashboardTimeLayoutInspector } from './DashboardTimeLayoutInspector'
import {
  applyCalendarPresetToShellBoxes,
  normalizeDashboardCalendarLayoutPreset,
  type DashboardCalendarLayoutPreset,
} from './calendarLayoutPreset'
import {
  applyGoalPresetToShellBoxes,
  normalizeDashboardGoalLayoutPreset,
  type DashboardGoalLayoutPreset,
} from './goalLayoutPreset'
import {
  applyHeroPresetToShellBoxes,
  normalizeDashboardHeroLayoutPreset,
  type DashboardHeroLayoutPreset,
} from './heroLayoutPreset'
import {
  applyPathPresetToShellBoxes,
  normalizeDashboardPathLayoutPreset,
  type DashboardPathLayoutPreset,
} from './pathLayoutPreset'
import {
  applyProfilePresetToShellBoxes,
  normalizeDashboardProfileLayoutPreset,
  type DashboardProfileLayoutPreset,
} from './profileLayoutPreset'
import {
  applyReviewPresetToShellBoxes,
  normalizeDashboardReviewLayoutPreset,
  type DashboardReviewLayoutPreset,
} from './reviewLayoutPreset'
import {
  applyStreakPresetToShellBoxes,
  normalizeDashboardStreakLayoutPreset,
  type DashboardStreakLayoutPreset,
} from './streakLayoutPreset'
import {
  applySubjectPresetToShellBoxes,
  normalizeDashboardSubjectLayoutPreset,
  type DashboardSubjectLayoutPreset,
} from './subjectLayoutPreset'
import {
  normalizeDashboardTaskLayoutPreset,
  type DashboardTaskLayoutPreset,
} from './taskLayoutPreset'
import {
  applyTimePresetToShellBoxes,
  normalizeDashboardTimeLayoutPreset,
  type DashboardTimeLayoutPreset,
} from './timeLayoutPreset'
import {
  Bell,
  Beaker,
  BookOpen,
  BookText,
  ChevronDown,
  ChevronRight,
  Compass,
  Flame,
  Gift,
  Globe,
  Grid2x2,
  Medal,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserRound,
  Users,
} from 'lucide-react'

const primaryNav = [
  { icon: Grid2x2, label: '仪表盘', active: true },
  { icon: BookOpen, label: '课程学习' },
  { icon: Compass, label: '练习中心' },
  { icon: Users, label: '学员社区' },
]

const manageNav = [
  { icon: Grid2x2, label: '管理仪表盘' },
  { icon: UserRound, label: '用户管理', chevron: true },
  { icon: BookText, label: '内容管理', chevron: true },
  { icon: Sparkles, label: '奖励中心' },
]

const taskCards = [
  {
    icon: 'math',
    title: '数学：',
    subtitle: '代数基础',
    progress: '2/3',
    width: '54%',
  },
  {
    icon: 'science',
    title: '科学：',
    subtitle: '物质及其变化',
    progress: '1/2',
    width: '44%',
  },
  {
    icon: 'english',
    title: '英语：',
    subtitle: '比喻语言',
    progress: '0/2',
    width: '36%',
  },
  {
    icon: 'bonus',
    title: '加分任务：',
    subtitle: '每日挑战',
    progress: '',
    width: '0%',
  },
]

type TaskCardKey = 'math' | 'science' | 'english' | 'bonus'

type TaskCardBox = {
  x: number
  y: number
  width: number
  height: number
}

type TaskCardBoxes = Record<TaskCardKey, TaskCardBox>

type TaskCardInteractionMode = 'move' | 'resize'

type TaskCardInteraction = {
  key: TaskCardKey
  mode: TaskCardInteractionMode
  pointerId: number | null
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

const defaultTaskTitleTransform: EditableTitleTransform = {
  x: 0,
  y: 0,
  scale: 1,
}

const defaultTaskCardBoxes: TaskCardBoxes = {
  math: { x: 20, y: 50, width: 235.034, height: 128 },
  science: { x: 285.034, y: 50, width: 235.034, height: 128 },
  english: { x: 550.068, y: 50, width: 235.034, height: 128 },
  bonus: { x: 815.102, y: 50, width: 235.034, height: 128 },
}

const TASK_CARD_EDIT_HEADER_OFFSET = 56
const TASK_CARD_ROW_LEFT_PADDING = 20
const TASK_CARD_ROW_GAP = 30
const TASK_CARD_ROW_WIDTH = 235.034
const TASK_CARD_ROW_HEIGHT = 128

const calendarRows = [
  {
    label: '本周',
    cells: [2, 2, 2, 3, 2, 2, 2, 3, 5, 2, 1],
  },
  {
    label: '上周',
    cells: [2, 2, 3, 4, 2, 1, 2, 3, 2, 1, 1],
  },
  {
    label: '两周前',
    cells: [2, 4, 4, 2, 2, 4, 2, 1, 2, 1, 1],
  },
  {
    label: '三周前',
    cells: [5, 3, 3, 4, 1, 1, 2, 1, 1, 0, 0],
  },
]

const pathSteps = [
  { label: '起点', tone: 'done', icon: pathStepDone },
  { label: '基础完成', tone: 'done', icon: pathStepDone },
  { label: '第2级', sublabel: '进行中', tone: 'active', icon: pathStepActive },
  { label: '第3级', sublabel: '已锁定', tone: 'locked', icon: pathStepLocked },
  { label: '第4级', sublabel: '已锁定', tone: 'locked', icon: pathStepLocked },
  { label: '大师奖励', sublabel: '等待解锁', tone: 'treasure', icon: pathStepTreasure },
]

const subjectStats = [
  { label: '数学', value: '2小时15分', percent: '35%', color: '#2f8bff' },
  { label: '科学', value: '1小时45分', percent: '27%', color: '#24b892' },
  { label: '英语', value: '1小时30分', percent: '23%', color: '#ff6940' },
  { label: '社会', value: '45分', percent: '12%', color: '#ffb930' },
  { label: '其他', value: '15分', percent: '3%', color: '#b6b1aa' },
]

const subjectCards = [
  { icon: 'math', title: '数学', value: '72%', width: '72%' },
  { icon: 'science', title: '科学', value: '68%', width: '68%' },
  { icon: 'chinese', title: '中文', value: '76%', width: '76%' },
  { icon: 'geography', title: '地理', value: '58%', width: '58%' },
]

const streakDays = [
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
  '日',
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
  '日',
]

type ReviewCardKey = 'math' | 'science' | 'english' | 'social'

type ReviewCardBox = SubjectCardBox

type ReviewCardBoxes = Record<ReviewCardKey, ReviewCardBox>

type ReviewCardInteractionMode = 'move' | 'resize'

type ReviewCardInteraction = {
  key: ReviewCardKey
  mode: ReviewCardInteractionMode
  pointerId: number | null
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

const reviewCards: Array<{
  key: ReviewCardKey
  icon: StaticImageData
  title: string
  score: string
  note: string
  accent: string
}> = [
  {
    key: 'math',
    icon: reviewMathIcon,
    title: '代数基础',
    score: '8/10',
    note: '做得好！',
    accent: '#1f73eb',
  },
  {
    key: 'science',
    icon: reviewScienceIcon,
    title: '物质状态',
    score: '9/10',
    note: '太棒了！',
    accent: '#108f67',
  },
  {
    key: 'english',
    icon: reviewEnglishIcon,
    title: '比喻语言',
    score: '7/10',
    note: '继续加油！',
    accent: '#ff5f1f',
  },
  {
    key: 'social',
    icon: reviewSocialIcon,
    title: '古代文明',
    score: '8/10',
    note: '做得不错！',
    accent: '#f29b00',
  },
]

const calendarDays = ['一', '二', '三', '四', '五', '六', '日']

const HERO_ART_IMAGE = '/preview/crops/hero-art-generated-whitefade.png'
const AVATAR_IMAGE = '/preview/crops/avatar-alex.png'
const PROFILE_AVATAR_IMAGE = profileAvatarGenerated
const PROFILE_BADGE_IMAGE = profileBadgeGenerated
const GOAL_TITLE_TROPHY_ICON = '/preview/goal-assets/goal-title-trophy-imagegen.png'
const GOAL_RIGHT_TROPHY_ICON = '/preview/goal-assets/goal-right-trophy-imagegen.png'
const STREAK_CAMPFIRE_IMAGE = streakCampfireImage
const STREAK_TITLE_IMAGE = streakTitleIcon

function ShellCard({
  className = '',
  children,
  style,
  ...props
}: {
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`relative min-h-0 min-w-0 rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)] ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
}

const shellBoxKeys = [
  'hero',
  'profile',
  'calendar',
  'task',
  'path',
  'time',
  'subject',
  'streak',
  'goal',
  'review',
] as const

type ShellBoxKey = (typeof shellBoxKeys)[number]

interface ShellBox {
  key: ShellBoxKey
  x: number
  y: number
  width: number
  height: number
  className: string
}

const shellOnlyBoxes: ShellBox[] = [
  {
    key: 'hero',
    x: 62.027,
    y: 7.79,
    width: 1070.137,
    height: 402.74,
    className: 'overflow-hidden p-0',
  },
  {
    key: 'profile',
    x: 1143.671,
    y: 7.79,
    width: 793.973,
    height: 166.21,
    className: 'p-0',
  },
  {
    key: 'calendar',
    x: 1143.671,
    y: 186.507,
    width: 793.973,
    height: 234,
    className: 'overflow-hidden p-0',
  },
  {
    key: 'task',
    x: 62.027,
    y: 423.358,
    width: 1070.137,
    height: 186.667,
    className: 'p-0',
  },
  {
    key: 'path',
    x: 62.027,
    y: 622.81,
    width: 1070.137,
    height: 143.196,
    className: 'overflow-hidden p-0',
  },
  {
    key: 'time',
    x: 1143.671,
    y: 423.358,
    width: 390.986,
    height: 342.648,
    className: 'p-0',
  },
  {
    key: 'subject',
    x: 1546.657,
    y: 423.358,
    width: 390.986,
    height: 342.648,
    className: 'p-0',
  },
  {
    key: 'streak',
    x: 62.027,
    y: 778.792,
    width: 529.07,
    height: 217.5,
    className: 'overflow-hidden p-0',
  },
  {
    key: 'goal',
    x: 613.097,
    y: 778.792,
    width: 529.07,
    height: 217.5,
    className: 'p-0',
  },
  {
    key: 'review',
    x: 1143.671,
    y: 778.792,
    width: 793.973,
    height: 217.5,
    className: 'p-0',
  },
]

const SHELL_LAYOUT_STORAGE_KEY = 'learnbank-shell-layout-v3'
const HERO_ART_FRAME_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:hero-art-frame`
const HERO_CTA_OFFSET_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:hero-cta-offset`
const PROFILE_AVATAR_TRANSFORM_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:profile-avatar`
const PROFILE_LAYOUT_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:profile-layout-v5`
const REVIEW_CARD_LAYOUT_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:review-card-layout-v1`
const PATH_BACKGROUND_OFFSET_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:path-background-v1`
const STREAK_TITLE_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:streak-title-v1`
const STREAK_CAMPFIRE_FRAME_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:streak-campfire-frame-v1`
const SHELL_MIN_WIDTH = 220
const SHELL_MIN_HEIGHT = 120
const HERO_ART_MIN_WIDTH = 320
const HERO_ART_MIN_HEIGHT = 180
const PROFILE_AVATAR_SCALE_MIN = 0.7
const PROFILE_AVATAR_SCALE_MAX = 2
const PATH_BACKGROUND_OFFSET_MIN_Y = -180
const PATH_BACKGROUND_OFFSET_MAX_Y = 180

type HeroArtFrame = {
  x: number
  y: number
  width: number
  height: number
}

type HeroCtaOffset = {
  x: number
  y: number
}

type ProfileAvatarTransform = {
  x: number
  y: number
  scale: number
}

type PathBackgroundOffset = {
  y: number
}

type ProfileSectionKey = 'avatar' | 'greeting' | 'stats' | 'badge'

type ProfileSectionBox = {
  x: number
  y: number
  width: number
  height: number
}

type ProfileSectionBoxes = Record<ProfileSectionKey, ProfileSectionBox>

type ProfileSectionInteractionMode = 'move' | 'resize'

type ProfileSectionInteraction = {
  key: ProfileSectionKey
  mode: ProfileSectionInteractionMode
  pointerId: number | null
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

type EditableTitleKey =
  | 'streak-title'
  | 'time-title'
  | 'task-title'
  | 'subject-title'
  | 'review-title'
  | 'path-title'
  | 'goal-title'

type EditableTitleTransform = {
  x: number
  y: number
  scale: number
}

type EditableTitleInteractionMode = 'move' | 'scale'

type EditableTitleInteraction = {
  key: EditableTitleKey
  mode: EditableTitleInteractionMode
  pointerId: number | null
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  startScale: number
}

type StreakCampfireInteraction = {
  key: 'streak-campfire'
  mode: HeroArtInteractionMode
  pointerId: number | null
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

type PathBackgroundInteraction = {
  pointerId: number | null
  startClientX: number
  startClientY: number
  startY: number
}

type TimeStudyPanelKey = 'pie' | 'stats'

type TimeStudyPanelBox = {
  x: number
  y: number
  width: number
  height: number
}

type TimeStudyPanelBoxes = Record<TimeStudyPanelKey, TimeStudyPanelBox>

type TimeStudyPanelInteractionMode = 'move' | 'resize'

type TimeStudyPanelInteraction = {
  key: TimeStudyPanelKey
  mode: TimeStudyPanelInteractionMode
  pointerId: number | null
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

type SubjectCardKey = 'math' | 'science' | 'chinese' | 'geography'

type SubjectCardBox = {
  x: number
  y: number
  width: number
  height: number
}

type SubjectCardBoxes = Record<SubjectCardKey, SubjectCardBox>

type SubjectCardInteractionMode = 'move' | 'resize' | 'resize-height'

type SubjectCardInteraction = {
  key: SubjectCardKey
  mode: SubjectCardInteractionMode
  pointerId: number | null
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
}

const defaultHeroArtFrame: HeroArtFrame = {
  x: -2.653,
  y: -9.222,
  width: 1071.821,
  height: 512.992,
}

const defaultHeroCtaOffset: HeroCtaOffset = {
  x: 0.098,
  y: -73.641,
}

const defaultProfileAvatarTransform: ProfileAvatarTransform = {
  x: 0,
  y: 0,
  scale: 1,
}

const defaultPathBackgroundOffset: PathBackgroundOffset = {
  y: 0,
}

const defaultProfileSectionBoxes: ProfileSectionBoxes = {
  avatar: { x: 30.247, y: 16.418, width: 178.871, height: 136.902 },
  greeting: { x: 243.204, y: 37.742, width: 374.192, height: 114.625 },
  stats: { x: 425.566, y: 39.468, width: 261.93, height: 101.035 },
  badge: { x: 570.351, y: 8.824, width: 156.184, height: 171.793 },
}

const defaultEditableTitleTransform: EditableTitleTransform = {
  x: 0,
  y: 0,
  scale: 1,
}

const defaultStreakTitleTransform: EditableTitleTransform = {
  x: 15.113,
  y: 20.973,
  scale: 1,
}

const defaultStreakCampfireFrame: HeroArtFrame = {
  x: 249.21,
  y: -77.79,
  width: 148.672,
  height: 18.672,
}

const defaultTimeStudyPanelBoxes: TimeStudyPanelBoxes = {
  pie: { x: 0, y: 0, width: 138, height: 138 },
  stats: { x: 148, y: 0, width: 224, height: 138 },
}

const defaultSubjectCardBoxes: SubjectCardBoxes = {
  math: { x: 20, y: 0, width: 168, height: 84 },
  science: { x: 208, y: 0, width: 168, height: 84 },
  chinese: { x: 20, y: 104, width: 168, height: 84 },
  geography: { x: 208, y: 104, width: 168, height: 84 },
}

const defaultReviewCardBoxes: ReviewCardBoxes = {
  math: { x: 0, y: 0, width: 185, height: 154 },
  science: { x: 195, y: 0, width: 185, height: 154 },
  english: { x: 390, y: 0, width: 185, height: 154 },
  social: { x: 585, y: 0, width: 185, height: 154 },
}

function normalizeHeroArtFrame(input: unknown): HeroArtFrame | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<HeroArtFrame>

  return {
    x: typeof candidate.x === 'number' ? candidate.x : defaultHeroArtFrame.x,
    y: typeof candidate.y === 'number' ? candidate.y : defaultHeroArtFrame.y,
    width:
      typeof candidate.width === 'number'
        ? Math.max(HERO_ART_MIN_WIDTH, candidate.width)
        : defaultHeroArtFrame.width,
    height:
      typeof candidate.height === 'number'
        ? Math.max(HERO_ART_MIN_HEIGHT, candidate.height)
        : defaultHeroArtFrame.height,
  }
}

function normalizeHeroCtaOffset(input: unknown): HeroCtaOffset | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<HeroCtaOffset>

  return {
    x: typeof candidate.x === 'number' ? candidate.x : defaultHeroCtaOffset.x,
    y: typeof candidate.y === 'number' ? candidate.y : defaultHeroCtaOffset.y,
  }
}

function normalizeProfileAvatarTransform(input: unknown): ProfileAvatarTransform | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<ProfileAvatarTransform>

  return {
    x: typeof candidate.x === 'number' ? candidate.x : defaultProfileAvatarTransform.x,
    y: typeof candidate.y === 'number' ? candidate.y : defaultProfileAvatarTransform.y,
    scale:
      typeof candidate.scale === 'number'
        ? clamp(candidate.scale, PROFILE_AVATAR_SCALE_MIN, PROFILE_AVATAR_SCALE_MAX)
        : defaultProfileAvatarTransform.scale,
  }
}

function normalizePathBackgroundOffset(input: unknown): PathBackgroundOffset | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<PathBackgroundOffset>

  return {
    y: typeof candidate.y === 'number' ? Number(candidate.y.toFixed(3)) : defaultPathBackgroundOffset.y,
  }
}

function normalizeProfileSectionBoxes(input: unknown): ProfileSectionBoxes | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<Record<ProfileSectionKey, Partial<ProfileSectionBox>>>

  const normalizeSection = (key: ProfileSectionKey) => {
    const section = candidate[key]
    const base = defaultProfileSectionBoxes[key]
    return {
      x: typeof section?.x === 'number' ? Number(section.x.toFixed(3)) : base.x,
      y: typeof section?.y === 'number' ? Number(section.y.toFixed(3)) : base.y,
      width:
        typeof section?.width === 'number'
          ? Number(Math.max(44, section.width).toFixed(3))
          : base.width,
      height:
        typeof section?.height === 'number'
          ? Number(Math.max(44, section.height).toFixed(3))
          : base.height,
    }
  }

  return {
    avatar: normalizeSection('avatar'),
    greeting: normalizeSection('greeting'),
    stats: normalizeSection('stats'),
    badge: normalizeSection('badge'),
  }
}

function normalizeEditableTitleTransform(input: unknown): EditableTitleTransform | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<EditableTitleTransform>

  return {
    x: typeof candidate.x === 'number' ? Number(candidate.x.toFixed(3)) : defaultEditableTitleTransform.x,
    y: typeof candidate.y === 'number' ? Number(candidate.y.toFixed(3)) : defaultEditableTitleTransform.y,
    scale:
      typeof candidate.scale === 'number'
        ? Number(clamp(candidate.scale, 0.7, 1.45).toFixed(3))
        : defaultEditableTitleTransform.scale,
  }
}

function normalizeTimeStudyPanelBoxes(input: unknown): TimeStudyPanelBoxes | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<Record<TimeStudyPanelKey, Partial<TimeStudyPanelBox>>>
  const result = {} as TimeStudyPanelBoxes

  ;(['pie', 'stats'] as const).forEach((key) => {
    const base = defaultTimeStudyPanelBoxes[key]
    const section = candidate[key]
    result[key] = {
      x: typeof section?.x === 'number' ? Number(section.x.toFixed(3)) : base.x,
      y: typeof section?.y === 'number' ? Number(section.y.toFixed(3)) : base.y,
      width:
        typeof section?.width === 'number'
          ? Number(Math.max(112, section.width).toFixed(3))
          : base.width,
      height:
        typeof section?.height === 'number'
          ? Number(Math.max(112, section.height).toFixed(3))
          : base.height,
    }
  })

  return result
}

function normalizeSubjectCardBoxes(input: unknown): SubjectCardBoxes | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<Record<SubjectCardKey, Partial<SubjectCardBox>>>
  const keys: SubjectCardKey[] = ['math', 'science', 'chinese', 'geography']

  const result = {} as SubjectCardBoxes

  for (const key of keys) {
    const base = defaultSubjectCardBoxes[key]
    const section = candidate[key]
    result[key] = {
      x: typeof section?.x === 'number' ? Number(section.x.toFixed(3)) : base.x,
      y: typeof section?.y === 'number' ? Number(section.y.toFixed(3)) : base.y,
      width:
        typeof section?.width === 'number'
          ? Number(Math.max(110, section.width).toFixed(3))
          : base.width,
      height:
        typeof section?.height === 'number'
          ? Number(Math.max(70, section.height).toFixed(3))
          : base.height,
    }
  }

  return result
}

function snapSubjectCardBoxesToGrid(boxes: SubjectCardBoxes): SubjectCardBoxes {
  const math = boxes.math
  const science = boxes.science
  const chinese = boxes.chinese
  const geography = boxes.geography

  const gapXCandidates = [
    science.x - (math.x + math.width),
    geography.x - (chinese.x + chinese.width),
  ].filter((value) => Number.isFinite(value))
  const gapYCandidates = [
    chinese.y - (math.y + math.height),
    geography.y - (science.y + science.height),
  ].filter((value) => Number.isFinite(value))

  const gapX = Math.max(
    12,
    Number(
      (
        gapXCandidates.reduce((sum, value) => sum + value, 0) /
          Math.max(1, gapXCandidates.length)
      ).toFixed(3)
    )
  )
  const gapY = Math.max(
    12,
    Number(
      (
        gapYCandidates.reduce((sum, value) => sum + value, 0) /
          Math.max(1, gapYCandidates.length)
      ).toFixed(3)
    )
  )

  const width = math.width
  const height = math.height

  return {
    math: {
      ...math,
      width,
      height,
    },
    science: {
      ...science,
      x: Number((math.x + width + gapX).toFixed(3)),
      y: math.y,
      width,
      height,
    },
    chinese: {
      ...chinese,
      x: math.x,
      y: Number((math.y + height + gapY).toFixed(3)),
      width,
      height,
    },
    geography: {
      ...geography,
      x: Number((math.x + width + gapX).toFixed(3)),
      y: Number((math.y + height + gapY).toFixed(3)),
      width,
      height,
    },
  }
}

function normalizeReviewCardBoxes(input: unknown): ReviewCardBoxes | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<Record<ReviewCardKey, Partial<ReviewCardBox>>>
  const result = {} as ReviewCardBoxes

  for (const key of ['math', 'science', 'english', 'social'] as const) {
    const base = defaultReviewCardBoxes[key]
    const section = candidate[key]
    result[key] = {
      x: typeof section?.x === 'number' ? Number(section.x.toFixed(3)) : base.x,
      y: typeof section?.y === 'number' ? Number(section.y.toFixed(3)) : base.y,
      width:
        typeof section?.width === 'number'
          ? Number(Math.max(110, section.width).toFixed(3))
          : base.width,
      height:
        typeof section?.height === 'number'
          ? Number(Math.max(90, section.height).toFixed(3))
          : base.height,
    }
  }

  return result
}

function normalizeTaskCardBoxes(input: unknown): TaskCardBoxes | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Partial<Record<TaskCardKey, Partial<TaskCardBox>>>
  const result = {} as TaskCardBoxes

  ;(['math', 'science', 'english', 'bonus'] as const).forEach((key, index) => {
    const card = candidate[key]
    const x =
      typeof card?.x === 'number'
        ? Number(card.x.toFixed(3))
        : Number(
            (
              TASK_CARD_ROW_LEFT_PADDING +
              index * (TASK_CARD_ROW_WIDTH + TASK_CARD_ROW_GAP)
            ).toFixed(3)
          )

    result[key] = {
      x,
      y:
        typeof card?.y === 'number'
          ? Number(card.y.toFixed(3))
          : 50,
      width:
        typeof card?.width === 'number'
          ? Number(Math.max(160, card.width).toFixed(3))
          : Number(TASK_CARD_ROW_WIDTH.toFixed(3)),
      height:
        typeof card?.height === 'number'
          ? Number(Math.max(96, card.height).toFixed(3))
          : TASK_CARD_ROW_HEIGHT,
    }
  })

  return result
}

const TIME_TITLE_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:time-title-v1`
const TIME_STUDY_PANEL_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:time-study-panels-v1`
const TASK_TITLE_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:task-title-v1`
const TASK_CARD_LAYOUT_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:task-card-layout-v1`
const SUBJECT_TITLE_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:subject-title-v1`
const REVIEW_TITLE_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:review-title-v1`
const PATH_TITLE_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:path-title-v1`
const SUBJECT_CARD_LAYOUT_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:subject-card-layout-v1`
const SUBJECT_CARD_GRID_SNAP_STORAGE_KEY = `${SHELL_LAYOUT_STORAGE_KEY}:subject-card-grid-snap-v1`

function cloneShellBoxes(boxes: readonly ShellBox[] = shellOnlyBoxes): ShellBox[] {
  return boxes.map((box) => ({ ...box }))
}

function applyContentPresetsToShellBoxes(
  boxes: readonly ShellBox[],
  presets: {
    hero: DashboardHeroLayoutPreset
    profile: DashboardProfileLayoutPreset
    calendar: DashboardCalendarLayoutPreset
    path: DashboardPathLayoutPreset
    time: DashboardTimeLayoutPreset
    subject: DashboardSubjectLayoutPreset
    streak: DashboardStreakLayoutPreset
    goal: DashboardGoalLayoutPreset
    review: DashboardReviewLayoutPreset
  }
) {
  return applyReviewPresetToShellBoxes(
    applyGoalPresetToShellBoxes(
      applyStreakPresetToShellBoxes(
        applySubjectPresetToShellBoxes(
          applyTimePresetToShellBoxes(
            applyPathPresetToShellBoxes(
              applyCalendarPresetToShellBoxes(
                applyProfilePresetToShellBoxes(
                  applyHeroPresetToShellBoxes(boxes, presets.hero),
                  presets.profile
                ),
                presets.calendar
              ),
              presets.path
            ),
            presets.time
          ),
          presets.subject
        ),
        presets.streak
      ),
      presets.goal
    ),
    presets.review
  )
}

function normalizeShellBoxes(input: unknown): ShellBox[] | null {
  if (!Array.isArray(input)) {
    return null
  }

  const byKey = new Map<string, Partial<ShellBox>>()

  for (const item of input) {
    if (!item || typeof item !== 'object') {
      continue
    }

    const candidate = item as Partial<ShellBox> & { key?: unknown }
    if (typeof candidate.key !== 'string') {
      continue
    }

    byKey.set(candidate.key, candidate)
  }

  const normalized = shellOnlyBoxes.map((base) => {
    const candidate = byKey.get(base.key)
    if (!candidate) {
      return { ...base }
    }

    const next = {
      ...base,
      x: typeof candidate.x === 'number' ? candidate.x : base.x,
      y: typeof candidate.y === 'number' ? candidate.y : base.y,
      width: typeof candidate.width === 'number' ? candidate.width : base.width,
      height: typeof candidate.height === 'number' ? candidate.height : base.height,
      className: typeof candidate.className === 'string' ? candidate.className : base.className,
    }

    return next
  })

  return normalized
}

type ShellInteractionMode = 'move' | 'resize'

type ShellInteraction = {
  key: ShellBoxKey
  mode: ShellInteractionMode
  pointerId: number | null
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  canvasWidth: number
  canvasHeight: number
}

type ShellInteractionSource = {
  pointerId: number | null
  currentTarget?: HTMLElement | null
}

type HeroArtInteractionMode = 'move' | 'resize'

type HeroArtInteraction = {
  mode: HeroArtInteractionMode
  pointerId: number | null
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  frameWidth: number
  frameHeight: number
}

type HeroCtaInteraction = {
  pointerId: number | null
  startClientX: number
  startClientY: number
  startX: number
  startY: number
}

type ProfileAvatarInteractionMode = 'move' | 'scale'

type ProfileAvatarInteraction = {
  mode: ProfileAvatarInteractionMode
  pointerId: number | null
  startClientX: number
  startClientY: number
  startX: number
  startY: number
  startScale: number
}

const shellMinSizes: Record<ShellBoxKey, { width: number; height: number }> = {
  hero: { width: 680, height: 280 },
  profile: { width: 300, height: 130 },
  calendar: { width: 300, height: 160 },
  task: { width: 700, height: 140 },
  path: { width: 700, height: 120 },
  time: { width: 260, height: 220 },
  subject: { width: 260, height: 220 },
  streak: { width: 300, height: 170 },
  goal: { width: 300, height: 170 },
  review: { width: 520, height: 170 },
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getShellBoxMinSize(key: ShellBoxKey) {
  const size = shellMinSizes[key]

  return {
    width: Math.max(SHELL_MIN_WIDTH, size.width),
    height: Math.max(SHELL_MIN_HEIGHT, size.height),
  }
}

type ShellGapGuide = {
  key: string
  orientation: 'horizontal' | 'vertical'
  x: number
  y: number
  length: number
  label: string
}

function getHorizontalOverlap(a: ShellBox, b: ShellBox) {
  return Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)
}

function getVerticalOverlap(a: ShellBox, b: ShellBox) {
  return Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
}

function buildShellGapGuides(boxes: ShellBox[]): ShellGapGuide[] {
  const guides: ShellGapGuide[] = []
  const leftmost = boxes.reduce((min, box) => Math.min(min, box.x), Number.POSITIVE_INFINITY)
  const topmost = boxes.reduce((min, box) => Math.min(min, box.y), Number.POSITIVE_INFINITY)

  if (Number.isFinite(leftmost) && leftmost > 0) {
    guides.push({
      key: 'sidebar-gap',
      orientation: 'horizontal',
      x: 0,
      y: Math.max(0, topmost - 24),
      length: leftmost,
      label: `sidebar ${Math.round(leftmost)}px`,
    })
  }

  if (Number.isFinite(topmost) && topmost > 0) {
    guides.push({
      key: 'topbar-gap',
      orientation: 'vertical',
      x: Math.max(0, leftmost - 24),
      y: 0,
      length: topmost,
      label: `topbar ${Math.round(topmost)}px`,
    })
  }

  for (const box of boxes) {
    const rightCandidates = boxes
      .filter((candidate) => candidate.key !== box.key)
      .map((candidate) => ({
        candidate,
        gap: candidate.x - (box.x + box.width),
        overlap: getHorizontalOverlap(box, candidate),
      }))
      .filter(({ gap, overlap }) => gap > 0 && overlap > 24)
      .sort((a, b) => a.gap - b.gap)

    const rightNeighbor = rightCandidates[0]
    if (rightNeighbor) {
      const midY = Math.max(box.y, rightNeighbor.candidate.y) + rightNeighbor.overlap / 2
      guides.push({
        key: `h-${box.key}-${rightNeighbor.candidate.key}`,
        orientation: 'horizontal',
        x: box.x + box.width,
        y: Math.max(0, Math.round(midY)),
        length: Math.round(rightNeighbor.gap),
        label: `${Math.round(rightNeighbor.gap)}px`,
      })
    }

    const belowCandidates = boxes
      .filter((candidate) => candidate.key !== box.key)
      .map((candidate) => ({
        candidate,
        gap: candidate.y - (box.y + box.height),
        overlap: getVerticalOverlap(box, candidate),
      }))
      .filter(({ gap, overlap }) => gap > 0 && overlap > 24)
      .sort((a, b) => a.gap - b.gap)

    const belowNeighbor = belowCandidates[0]
    if (belowNeighbor) {
      const midX = Math.max(box.x, belowNeighbor.candidate.x) + belowNeighbor.overlap / 2
      guides.push({
        key: `v-${box.key}-${belowNeighbor.candidate.key}`,
        orientation: 'vertical',
        x: Math.max(0, Math.round(midX)),
        y: box.y + box.height,
        length: Math.round(belowNeighbor.gap),
        label: `${Math.round(belowNeighbor.gap)}px`,
      })
    }
  }

  const unique = new Map<string, ShellGapGuide>()
  for (const guide of guides) {
    const dedupeKey = `${guide.orientation}:${guide.x}:${guide.y}:${guide.length}:${guide.label}`
    if (!unique.has(dedupeKey)) {
      unique.set(dedupeKey, guide)
    }
  }

  return Array.from(unique.values())
}

function updateShellBox(
  box: ShellBox,
  patch: Partial<Pick<ShellBox, 'x' | 'y' | 'width' | 'height'>>
) {
  return {
    ...box,
    ...patch,
  }
}

function SidebarItem({
  icon: Icon,
  label,
  active = false,
  chevron = false,
}: {
  icon: React.ElementType
  label: string
  active?: boolean
  chevron?: boolean
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-center rounded-[18px] border px-3 py-3 text-left text-[15px] font-medium transition-colors min-[1280px]:justify-start min-[1280px]:px-4 ${
        active
          ? 'border-[#f0cda8] bg-[linear-gradient(180deg,#fff7ec_0%,#fff2e2_100%)] text-[#ef7d35]'
          : 'border-transparent text-[#27303d] hover:border-[#ecd9c4] hover:bg-white/70'
      }`}
    >
      <Icon
        className={`h-[18px] w-[18px] min-[1280px]:mr-3 ${
          active ? 'text-[#ef7d35]' : 'text-[#405163]'
        }`}
      />
      <span className="hidden flex-1 min-[1280px]:block">{label}</span>
      {chevron ? (
        <ChevronDown className="hidden h-4 w-4 text-[#7f8b98] min-[1280px]:block" />
      ) : null}
    </button>
  )
}

function HeaderCircleButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-[50px] w-[50px] items-center justify-center rounded-full border border-[#ebd7c1] bg-white text-[#3b4553] shadow-[0_16px_28px_-22px_rgba(120,72,32,0.32)]"
    >
      {children}
    </button>
  )
}

function SectionTitle({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="text-[#f07d2c]">{icon}</div>
        <h2 className="text-[17px] font-semibold tracking-tight text-[#242c38] sm:text-[18px]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}

function GeneratedSectionIcon({
  src,
  alt,
}: {
  src: string | StaticImageData
  alt: string
}) {
  return <Image src={src} alt={alt} width={20} height={20} className="h-5 w-5" />
}

function EditableTitleFrame({
  editMode = false,
  showEditControls = true,
  titleTransform = defaultEditableTitleTransform,
  selected = false,
  ariaLabel,
  onMoveStart,
  onScaleStart,
  controlSide = 'right',
  children,
}: {
  editMode?: boolean
  showEditControls?: boolean
  titleTransform?: EditableTitleTransform
  selected?: boolean
  ariaLabel: string
  onMoveStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onScaleStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  controlSide?: 'left' | 'right'
  children: React.ReactNode
}) {
  return (
    <div
      className={`relative z-[90] inline-flex w-fit origin-top-left flex-col ${
        controlSide === 'left' ? 'items-start' : 'items-end'
      }`}
      style={{
        transform: `translate(${titleTransform.x}px, ${titleTransform.y}px) scale(${titleTransform.scale})`,
      }}
      >
      {children}
      {editMode ? (
        <div
          className={`mt-1 flex h-7 items-center gap-1 ${
            showEditControls ? 'visible' : 'invisible pointer-events-none'
          }`}
          aria-hidden={!showEditControls}
        >
          <div className="pointer-events-none rounded-full bg-[#ff8a20] px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_22px_-14px_rgba(255,102,25,0.82)]">
            标题
          </div>
          <button
            type="button"
            aria-label={ariaLabel}
            className={`rounded-full border border-[#ffd0a4] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#f06c10] shadow-[0_10px_22px_-16px_rgba(255,102,25,0.55)] outline-none ${
              selected ? 'ring-2 ring-[#ff7d19]/45 ring-offset-2 ring-offset-transparent' : ''
            }`}
            onPointerDown={onMoveStart}
          >
            拖动
          </button>
          <button
            type="button"
            aria-label={`${ariaLabel} 缩放`}
            className="rounded-full border border-[#ffd0a4] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#f06c10] shadow-[0_10px_22px_-16px_rgba(255,102,25,0.55)] outline-none"
            onPointerDown={onScaleStart}
          >
            缩放
          </button>
        </div>
      ) : null}
    </div>
  )
}

function EditableMiniToolbar({
  label,
  selected = false,
  ariaLabel,
  onMoveStart,
  onScaleStart,
}: {
  label: string
  selected?: boolean
  ariaLabel: string
  onMoveStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onScaleStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <div className="flex h-7 items-center gap-1">
      <div className="pointer-events-none rounded-full bg-[#ff8a20] px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_22px_-14px_rgba(255,102,25,0.82)]">
        {label}
      </div>
      <button
        type="button"
        aria-label={ariaLabel}
        className={`rounded-full border border-[#ffd0a4] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#f06c10] shadow-[0_10px_22px_-16px_rgba(255,102,25,0.55)] outline-none ${
          selected ? 'ring-2 ring-[#ff7d19]/45 ring-offset-2 ring-offset-transparent' : ''
        }`}
        onPointerDown={onMoveStart}
      >
        拖动
      </button>
      <button
        type="button"
        aria-label={`${ariaLabel} 缩放`}
        className="rounded-full border border-[#ffd0a4] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#f06c10] shadow-[0_10px_22px_-16px_rgba(255,102,25,0.55)] outline-none"
        onPointerDown={onScaleStart}
      >
        缩放
      </button>
    </div>
  )
}

function EditableSubjectCardFrame({
  editMode = false,
  showEditControls = true,
  box,
  selected = false,
  ariaLabel,
  onMoveStart,
  onResizeStart,
  onResizeHeightStart,
  badgeText = '拖动',
  showHeightResizeHandle = false,
  children,
}: {
  editMode?: boolean
  showEditControls?: boolean
  box: SubjectCardBox
  selected?: boolean
  ariaLabel: string
  onMoveStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onResizeStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onResizeHeightStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  badgeText?: string
  showHeightResizeHandle?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${box.x}px`,
        top: `${box.y}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
      }}
    >
      <div className="relative h-full w-full">
        {children}
        {editMode && showEditControls ? (
          <div className="pointer-events-none absolute left-2 top-2 z-[75] rounded-full bg-[#ff8a20] px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_22px_-14px_rgba(255,102,25,0.82)]">
            {badgeText}
          </div>
        ) : null}
        {editMode && showEditControls ? (
          <button
            type="button"
            aria-label={ariaLabel}
            className={`absolute inset-0 z-[76] cursor-move rounded-[20px] outline-none ${
              selected ? 'ring-2 ring-[#ff7d19]/45 ring-offset-2 ring-offset-transparent' : ''
            }`}
            onPointerDown={onMoveStart}
          >
            <span className="sr-only">移动卡片</span>
          </button>
        ) : null}
        {editMode && showEditControls ? (
          <button
            type="button"
            aria-label={`${ariaLabel} 调整大小`}
            className="absolute bottom-[-2px] right-[-2px] z-[77] h-5 w-5 cursor-nwse-resize rounded-[5px] border border-white/80 bg-[#ff7d19] shadow-[0_12px_24px_-14px_rgba(255,102,25,0.9)]"
            onPointerDown={onResizeStart}
          />
        ) : null}
        {editMode && showEditControls && showHeightResizeHandle ? (
          <button
            type="button"
            aria-label={`${ariaLabel} 调整高度`}
            className="absolute bottom-[-2px] left-1/2 z-[77] h-4 w-10 -translate-x-1/2 cursor-ns-resize rounded-full border border-white/80 bg-[#ff8a20] px-2 text-[9px] font-semibold text-white shadow-[0_12px_24px_-14px_rgba(255,102,25,0.9)]"
            onPointerDown={onResizeHeightStart}
          >
            高度
          </button>
        ) : null}
      </div>
    </div>
  )
}

function SubjectProgressIcon({ kind, size = 48 }: { kind: string; size?: number }) {
  const className = 'rounded-[14px]'

  if (kind === 'math') {
    return (
      <Image src={subjectMathIcon} alt="数学图标" width={size} height={size} className={className} />
    )
  }

  if (kind === 'science') {
    return (
      <Image
        src={subjectScienceIcon}
        alt="科学图标"
        width={size}
        height={size}
        className={className}
      />
    )
  }

  if (kind === 'chinese') {
    return (
      <Image
        src={subjectChineseIcon}
        alt="中文图标"
        width={size}
        height={size}
        className={className}
      />
    )
  }

  if (kind === 'geography') {
    return (
      <Image
        src={subjectGeographyIcon}
        alt="地理图标"
        width={size}
        height={size}
        className={className}
      />
    )
  }

  return <SubjectIcon kind={kind} />
}

function getTaskSubjectIconKind(kind: string) {
  if (kind === 'math') {
    return 'math'
  }

  if (kind === 'science') {
    return 'science'
  }

  if (kind === 'english') {
    return 'chinese'
  }

  return 'geography'
}

function TaskCardContent({ task }: { task: (typeof taskCards)[number] }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start gap-3">
        <div className="shrink-0 pt-0.5">
          <SubjectProgressIcon kind={getTaskSubjectIconKind(task.icon)} size={54} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[14px] font-semibold leading-[1.1] text-[#25303c]">
                {task.title}
              </div>
              <div className="mt-1 text-[12px] leading-tight text-[#455160]">
                {task.subtitle}
              </div>
            </div>
            {task.progress ? (
              <div className="pt-[1px] text-[13px] font-medium text-[#374250]">
                {task.progress}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <ProgressTrack
          value={task.width}
          color={
            task.icon === 'science'
              ? '#23b48a'
              : task.icon === 'english'
                ? '#efdccc'
                : '#1e73e9'
          }
        />
      </div>
    </div>
  )
}

function TaskCardBody({
  editMode = false,
  showEditControls = true,
  titleTransform = defaultEditableTitleTransform,
  taskCardBoxes = defaultTaskCardBoxes,
  onStartTitleMove,
  onStartTitleScale,
  onStartCardMove,
  onStartCardResize,
}: {
  editMode?: boolean
  showEditControls?: boolean
  titleTransform?: EditableTitleTransform
  taskCardBoxes?: TaskCardBoxes
  onStartTitleMove?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartTitleScale?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartCardMove?: (key: TaskCardKey, event: React.PointerEvent<HTMLButtonElement>) => void
  onStartCardResize?: (key: TaskCardKey, event: React.PointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <CardViewport>
      <div className="relative z-[120] h-full min-h-0">
        <div className={`${editMode ? 'absolute left-0 top-0 z-[130]' : 'relative'}`}>
          <EditableTitleFrame
            editMode={editMode}
            showEditControls={showEditControls}
            titleTransform={titleTransform}
            ariaLabel="移动今日任务标题"
            onMoveStart={onStartTitleMove}
            onScaleStart={onStartTitleScale}
          >
            <SectionTitle icon={<Target className="h-5 w-5" />} title="今日任务" />
          </EditableTitleFrame>
        </div>

        {editMode ? (
          <div
            className="absolute inset-0 min-h-0"
            style={{ paddingTop: `${TASK_CARD_EDIT_HEADER_OFFSET}px` }}
          >
            {taskCards.map((task) => {
              const key = task.icon as TaskCardKey
              const box = taskCardBoxes[key]
              const taskScale = getAverageScale(box, defaultTaskCardBoxes[key])

              return (
                <EditableSubjectCardFrame
                  key={task.title}
                  editMode={editMode}
                  showEditControls={showEditControls}
                  box={box}
                  ariaLabel={`移动 ${task.title} 卡片`}
                  badgeText={`拖动 ${task.title.replace('：', '')}`}
                  onMoveStart={(event) => onStartCardMove?.(key, event)}
                  onResizeStart={(event) => onStartCardResize?.(key, event)}
                >
                  <div
                    className="rounded-[16px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ef_100%)] p-3"
                    style={{
                      transform: `scale(${taskScale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <TaskCardContent task={task} />
                  </div>
                </EditableSubjectCardFrame>
              )
            })}
          </div>
        ) : (
          <div className="mt-[62px] grid grid-cols-4 gap-[30px] px-[20px]">
            {taskCards.map((task) => (
              <div
                key={task.title}
                className="rounded-[16px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ef_100%)] p-3"
              >
                <TaskCardContent task={task} />
              </div>
            ))}
          </div>
        )}
      </div>
    </CardViewport>
  )
}

function GoalCardBody({
  editMode = false,
  showEditControls = true,
  titleTransform = defaultEditableTitleTransform,
  summaryOffset = { x: 20, y: -30 },
  trophyFrame = { x: 0, y: 0, width: 126, height: 116 },
  onStartTitleMove,
  onStartTitleScale,
}: {
  editMode?: boolean
  showEditControls?: boolean
  titleTransform?: EditableTitleTransform
  summaryOffset?: { x: number; y: number }
  trophyFrame?: { x: number; y: number; width: number; height: number }
  onStartTitleMove?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartTitleScale?: (event: React.PointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <CardViewport>
      <div className="flex h-full min-h-0 flex-col">
        <div className="pl-[30px] pt-[20px]">
          <EditableTitleFrame
            editMode={editMode}
            showEditControls={showEditControls}
            titleTransform={titleTransform}
            ariaLabel="移动本周目标进度标题"
            onMoveStart={onStartTitleMove}
            onScaleStart={onStartTitleScale}
            controlSide="left"
          >
            <SectionTitle
              icon={
                <GeneratedSectionIcon
                  src={GOAL_TITLE_TROPHY_ICON}
                  alt="本周目标进度图标"
                />
              }
              title="本周目标进度"
            />
          </EditableTitleFrame>
        </div>

        <div className="mt-[30px] flex flex-col gap-2.5 pl-[30px] sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div
              style={{
                transform: `translate(${summaryOffset.x}px, ${summaryOffset.y}px)`,
              }}
            >
              <div className="text-[14px] font-medium leading-none text-[#414b57]">
                进展不错！
              </div>
              <div className="mt-2 text-[14px] font-semibold leading-none text-[#ff6d1b]">
                72%
              </div>
              <div className="mt-2 text-[14px] leading-none text-[#4b5663]">
                已完成 5 / 7 个任务
              </div>
            </div>
            <div className="mt-[30px] h-[10px] overflow-hidden rounded-full bg-[#f2e5d8]">
              <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,#ff8b1e_0%,#ff5f18_100%)]" />
            </div>
          </div>

          <div
            className="relative shrink-0 self-center sm:self-auto"
            style={{
              width: `${trophyFrame.width}px`,
              height: `${trophyFrame.height}px`,
              transform: `translate(${trophyFrame.x}px, ${trophyFrame.y}px)`,
            }}
          >
            <Image
              src={GOAL_RIGHT_TROPHY_ICON}
              alt="本周目标奖杯插画"
              fill
              sizes={`${Math.round(trophyFrame.width)}px`}
              className="object-contain object-center"
            />
          </div>
        </div>
      </div>
    </CardViewport>
  )
}

function SubjectIcon({ kind }: { kind: string }) {
  const base =
    'flex h-12 w-12 items-center justify-center rounded-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]'

  if (kind === 'math') {
    return (
      <div
        className={`${base} bg-[linear-gradient(180deg,#3da1ff_0%,#1c73e8_100%)] text-white`}
      >
        <div className="grid grid-cols-2 gap-1 text-[10px] font-semibold">
          <span>÷</span>
          <span>+</span>
          <span>x</span>
          <span>=</span>
        </div>
      </div>
    )
  }

  if (kind === 'science') {
    return (
      <div
        className={`${base} bg-[linear-gradient(180deg,#38d2a2_0%,#1ca979_100%)] text-white`}
      >
        <Beaker className="h-6 w-6" />
      </div>
    )
  }

  if (kind === 'english') {
    return (
      <div
        className={`${base} bg-[linear-gradient(180deg,#ff7a61_0%,#ff4a27_100%)] text-white`}
      >
        <span className="text-[18px] font-semibold">Aa</span>
      </div>
    )
  }

  if (kind === 'social') {
    return (
      <div
        className={`${base} bg-[linear-gradient(180deg,#43b1ff_0%,#1f7dea_100%)] text-white`}
      >
        <Globe className="h-6 w-6" />
      </div>
    )
  }

  return (
    <div
      className={`${base} bg-[linear-gradient(180deg,#ffd457_0%,#ffb41e_100%)] text-white`}
    >
      <Gift className="h-6 w-6" />
    </div>
  )
}

function AvatarIllustration({
  variant = 'profile',
  transform = defaultProfileAvatarTransform,
  editMode = false,
  selected = false,
  onMoveStart,
  onScaleStart,
}: {
  variant?: 'profile' | 'sidebar' | 'topbar'
  transform?: ProfileAvatarTransform
  editMode?: boolean
  selected?: boolean
  onMoveStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onScaleStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
}) {
  const imageSrc = variant === 'profile' ? PROFILE_AVATAR_IMAGE : AVATAR_IMAGE
  const sizeClass =
    variant === 'profile'
      ? 'h-[112px] w-[112px] border-[4px]'
      : variant === 'sidebar'
        ? 'h-[64px] w-[64px] border-[3px]'
        : 'h-10 w-10 border-[2px]'

  return (
    <div
      className={`relative overflow-hidden rounded-full border-[#f2a462] bg-[#ffe6b8] shadow-[0_16px_30px_-24px_rgba(120,72,32,0.45)] ${sizeClass}`}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: 'center center',
        }}
      >
        <Image
          src={imageSrc}
          alt="Alex 头像"
          fill
          sizes={
            variant === 'profile'
              ? '112px'
              : variant === 'sidebar'
                ? '64px'
                : '40px'
          }
          className="object-cover"
        />
      </div>
      {variant === 'profile' && editMode ? (
        <>
          <button
            type="button"
            aria-label="移动 profile 头像"
            className={`absolute inset-0 z-[60] cursor-grab rounded-full border border-dashed ${
              selected
                ? 'border-[#ff7d19]/85 bg-[#ff7d19]/[0.04]'
                : 'border-white/55 bg-transparent'
            } outline-none active:cursor-grabbing`}
            onPointerDown={onMoveStart}
          />
          <button
            type="button"
            aria-label="缩放 profile 头像"
            className="absolute bottom-0 right-0 z-[61] h-4 w-4 cursor-nwse-resize rounded-[4px] border border-white/80 bg-[#ff7d19] shadow-[0_10px_20px_-14px_rgba(255,102,25,0.9)]"
            onPointerDown={onScaleStart}
          />
        </>
      ) : null}
    </div>
  )
}

function HeroArtwork({
  editMode = false,
  artEditMode = false,
  selected = false,
  frame = defaultHeroArtFrame,
  onSelect,
  onMoveStart,
  onResizeStart,
}: {
  editMode?: boolean
  artEditMode?: boolean
  selected?: boolean
  frame?: HeroArtFrame
  onSelect?: () => void
  onMoveStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onResizeStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <>
      <div
        className="absolute"
        style={{
          left: `${frame.x}px`,
          top: `${frame.y}px`,
          width: `${frame.width}px`,
          height: `${frame.height}px`,
        }}
      >
        <Image
          src={HERO_ART_IMAGE}
          alt="学习主视觉插画"
          fill
          sizes="(min-width: 1024px) 920px, 100vw"
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0)_26%),linear-gradient(90deg,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0.36)_20%,rgba(255,255,255,0.12)_34%,rgba(255,255,255,0)_52%)]" />
      {editMode && artEditMode ? (
        <>
          <button
            type="button"
            aria-label="移动 hero 插画"
            className={`absolute z-[60] cursor-grab border border-dashed ${
              selected
                ? 'border-[#ff7d19]/85 bg-[#ff7d19]/[0.04]'
                : 'border-white/55 bg-transparent'
            } outline-none active:cursor-grabbing`}
            style={{
              left: `${frame.x}px`,
              top: `${frame.y}px`,
              width: `${frame.width}px`,
              height: `${frame.height}px`,
            }}
            onPointerDown={onMoveStart}
            onClick={onSelect}
          />
          <div className="pointer-events-none absolute left-4 top-4 z-[61] rounded-full bg-[#ff8a20] px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_10px_22px_-14px_rgba(255,102,25,0.85)]">
            插画资产编辑
          </div>
          <button
            type="button"
            aria-label="调整 hero 插画大小"
            className="absolute z-[62] h-5 w-5 cursor-nwse-resize rounded-[6px] border border-white/80 bg-[#ff7d19] shadow-[0_12px_24px_-14px_rgba(255,102,25,0.9)]"
            style={{
              left: `${frame.x + frame.width - 10}px`,
              top: `${frame.y + frame.height - 10}px`,
            }}
            onPointerDown={onResizeStart}
            onClick={onSelect}
          />
        </>
      ) : null}
    </>
  )
}

function EditableArtFrame({
  editMode = false,
  artEditMode = false,
  selected = false,
  frame,
  src,
  alt,
  onSelect,
  onMoveStart,
  onResizeStart,
  assetLabel = '插画资产编辑',
  moveAriaLabel = '移动插画',
  resizeAriaLabel = '调整插画大小',
  className = '',
  imageClassName = 'object-contain object-center',
}: {
  editMode?: boolean
  artEditMode?: boolean
  selected?: boolean
  frame: HeroArtFrame
  src: string | StaticImageData
  alt: string
  onSelect?: () => void
  onMoveStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onResizeStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  assetLabel?: string
  moveAriaLabel?: string
  resizeAriaLabel?: string
  className?: string
  imageClassName?: string
}) {
  return (
    <>
      <div
        className={`absolute ${className}`}
        style={{
          left: `${frame.x}px`,
          top: `${frame.y}px`,
          width: `${frame.width}px`,
          height: `${frame.height}px`,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 240px, 180px"
          className={imageClassName}
        />
      </div>
      {editMode && artEditMode ? (
        <>
          <button
            type="button"
            aria-label={moveAriaLabel}
            className={`absolute z-[60] cursor-grab border border-dashed ${
              selected
                ? 'border-[#ff7d19]/85 bg-[#ff7d19]/[0.04]'
                : 'border-white/55 bg-transparent'
            } outline-none active:cursor-grabbing`}
            style={{
              left: `${frame.x}px`,
              top: `${frame.y}px`,
              width: `${frame.width}px`,
              height: `${frame.height}px`,
            }}
            onPointerDown={onMoveStart}
            onClick={onSelect}
          />
          <div className="pointer-events-none absolute left-4 top-4 z-[61] rounded-full bg-[#ff8a20] px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_10px_22px_-14px_rgba(255,102,25,0.85)]">
            {assetLabel}
          </div>
          <button
            type="button"
            aria-label={resizeAriaLabel}
            className="absolute z-[62] h-5 w-5 cursor-nwse-resize rounded-[6px] border border-white/80 bg-[#ff7d19] shadow-[0_12px_24px_-14px_rgba(255,102,25,0.9)]"
            style={{
              left: `${frame.x + frame.width - 10}px`,
              top: `${frame.y + frame.height - 10}px`,
            }}
            onPointerDown={onResizeStart}
            onClick={onSelect}
          />
        </>
      ) : null}
    </>
  )
}

function HeroCardBody({
  editMode = false,
  artEditMode = false,
  heroCtaEditMode = false,
  artSelected = false,
  heroArtFrame = defaultHeroArtFrame,
  heroCtaOffset = defaultHeroCtaOffset,
  contentMaxWidth = 432,
  heroArtworkFrameRef,
  showEditControls = true,
  onToggleHeroArtEdit,
  onToggleHeroCtaEdit,
  onSavePageSnapshot,
  onSelectHeroArt,
  onStartHeroArtMove,
  onStartHeroArtResize,
  onStartHeroCtaMove,
  onResetHeroArt,
  onResetHeroCta,
  savingPageSnapshot = false,
}: {
  editMode?: boolean
  artEditMode?: boolean
  heroCtaEditMode?: boolean
  artSelected?: boolean
  heroArtFrame?: HeroArtFrame
  heroCtaOffset?: HeroCtaOffset
  contentMaxWidth?: number
  heroArtworkFrameRef?: React.Ref<HTMLDivElement>
  showEditControls?: boolean
  onToggleHeroArtEdit?: () => void
  onToggleHeroCtaEdit?: () => void
  onSavePageSnapshot?: () => void
  onSelectHeroArt?: () => void
  onStartHeroArtMove?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartHeroArtResize?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartHeroCtaMove?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onResetHeroArt?: () => void
  onResetHeroCta?: () => void
  savingPageSnapshot?: boolean
}) {
  return (
    <CardViewport>
      <div
        ref={heroArtworkFrameRef}
        className="relative h-full min-h-0 overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#ffd56c_0%,#ffb942_18%,#ff9a25_58%,#ff7b18_100%)]"
      >
        <div className="absolute inset-0">
          <HeroArtwork
            editMode={editMode}
            artEditMode={artEditMode}
            selected={artSelected}
            frame={heroArtFrame}
            onSelect={onSelectHeroArt}
            onMoveStart={onStartHeroArtMove}
            onResizeStart={onStartHeroArtResize}
          />
        </div>
        {editMode && showEditControls ? (
          <div className="absolute right-4 top-4 z-[72] flex items-center gap-2">
            <button
              type="button"
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-[0_14px_24px_-18px_rgba(120,72,32,0.45)] ${
                artEditMode
                  ? 'bg-[#ff8a20] text-white'
                  : 'border border-[#ebd7c1] bg-white/92 text-[#34404d] backdrop-blur'
              }`}
              onClick={onToggleHeroArtEdit}
            >
              {artEditMode ? '结束插画编辑' : '编辑插画'}
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-[0_14px_24px_-18px_rgba(120,72,32,0.45)] ${
                heroCtaEditMode
                  ? 'bg-[#ff8a20] text-white'
                  : 'border border-[#ebd7c1] bg-white/92 text-[#34404d] backdrop-blur'
              }`}
              onClick={onToggleHeroCtaEdit}
            >
              {heroCtaEditMode ? '结束按钮编辑' : '编辑按钮'}
            </button>
            <button
              type="button"
              className="rounded-full border border-[#ebd7c1] bg-white/92 px-3 py-1.5 text-[11px] font-semibold text-[#34404d] shadow-[0_14px_24px_-18px_rgba(120,72,32,0.45)] backdrop-blur disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onSavePageSnapshot}
              disabled={savingPageSnapshot}
            >
              {savingPageSnapshot ? '保存中...' : '保存页面快照'}
            </button>
            {heroCtaEditMode ? (
              <button
                type="button"
                className="rounded-full border border-[#ebd7c1] bg-white/92 px-3 py-1.5 text-[11px] font-semibold text-[#34404d] shadow-[0_14px_24px_-18px_rgba(120,72,32,0.45)] backdrop-blur"
                onClick={onResetHeroCta}
              >
                重置按钮
              </button>
            ) : null}
            {artEditMode ? (
              <div className="flex items-center gap-2 rounded-full border border-[#ebd7c1] bg-white/92 px-3 py-2 text-[11px] text-[#36414d] shadow-[0_14px_24px_-18px_rgba(120,72,32,0.45)] backdrop-blur">
                <span>
                  {Math.round(heroArtFrame.width)} × {Math.round(heroArtFrame.height)}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-[#ebd7c1] bg-white px-2 py-1 text-[10px] font-medium text-[#2e3742]"
                  onClick={onResetHeroArt}
                >
                  重置
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          className="relative z-10 h-full max-w-[432px] p-4 sm:p-5"
          style={{ maxWidth: `${contentMaxWidth}px` }}
        >
          <div>
            <div className="flex items-center gap-3 text-[#242c38]">
              <Star className="h-5 w-5 fill-[#ffbe2b] text-[#ef8622]" />
              <span className="text-[17px] font-semibold tracking-tight">
                学习总览
              </span>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <h2 className="max-w-[320px] text-[35px] font-semibold leading-[1.04] tracking-tight text-[#252d39] sm:text-[41px]">
                保持你的
                <br />
                连胜势头！
              </h2>
              <span className="mt-1 text-[30px] leading-none">🔥</span>
            </div>
            <p className="mt-3.5 text-[13px] text-[#596371]">你今天状态很好。</p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <div className="flex items-center gap-3 rounded-[16px] border border-[#efd9bf] bg-white/85 px-4 py-2.5 shadow-[0_16px_28px_-24px_rgba(120,72,32,0.25)] backdrop-blur-[1px]">
                <Star className="h-6 w-6 fill-[#ffcb29] text-[#f08b1f]" />
                <div className="text-[14px] font-semibold text-[#222b36]">
                  1240{' '}
                  <span className="ml-1 text-[13px] font-medium text-[#69727f]">
                    XP
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[16px] border border-[#efd9bf] bg-white/85 px-4 py-2.5 shadow-[0_16px_28px_-24px_rgba(120,72,32,0.25)] backdrop-blur-[1px]">
                <Medal className="h-6 w-6 text-[#3ea653]" />
                <div className="text-[14px] font-semibold text-[#222b36]">
                  7级 探索者
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute left-5 z-[74] sm:left-5"
            style={{
              bottom: '20px',
              transform: `translate(${heroCtaOffset.x}px, ${heroCtaOffset.y}px)`,
            }}
          >
            <button
              type="button"
              className={`inline-flex h-11 w-[206px] items-center justify-between rounded-[16px] bg-[linear-gradient(90deg,#ff8a1f_0%,#ff5e18_100%)] px-6 text-[14px] font-semibold text-white shadow-[0_22px_32px_-26px_rgba(255,102,25,0.9)] ${
                heroCtaEditMode ? 'relative ring-2 ring-[#ff7d19]/55 ring-offset-2 ring-offset-transparent' : ''
              }`}
            >
              <span>继续学习</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#ff7d19]">
                <ChevronRight className="h-5 w-5" />
              </span>
            </button>
            {heroCtaEditMode ? (
              <button
                type="button"
                aria-label="移动 hero 按钮"
                className="absolute inset-0 cursor-grab rounded-[16px] border border-dashed border-[#ff7d19]/85 bg-[#ff7d19]/[0.04] active:cursor-grabbing"
                onPointerDown={onStartHeroCtaMove}
              />
            ) : null}
          </div>
        </div>
      </div>
    </CardViewport>
  )
}

function ProfileCardBody({
  editMode = false,
  sectionBoxes = defaultProfileSectionBoxes,
  onStartSectionInteraction,
  showEditControls = true,
}: {
  editMode?: boolean
  sectionBoxes?: ProfileSectionBoxes
  onStartSectionInteraction?: (
    key: ProfileSectionKey,
    mode: ProfileSectionInteractionMode,
    event: React.PointerEvent<HTMLButtonElement>
  ) => void
  showEditControls?: boolean
}) {
  return (
    <CardViewport>
      <div className="relative h-full w-full">
        <ProfileEditSection
          editMode={editMode}
          showEditControls={showEditControls}
          selected={editMode}
          box={sectionBoxes.avatar}
          baseBox={defaultProfileSectionBoxes.avatar}
          ariaLabel="移动 profile 头像区"
          onMoveStart={(event) => onStartSectionInteraction?.('avatar', 'move', event)}
          onResizeStart={(event) => onStartSectionInteraction?.('avatar', 'resize', event)}
        >
          <div className="relative h-full w-full min-w-0 min-h-0 overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-px bg-[#ecd9c4]" />
            <div className="absolute left-0 top-0 h-[112px] w-[112px]">
              <AvatarIllustration variant="profile" />
            </div>
          </div>
        </ProfileEditSection>

        <ProfileEditSection
          editMode={editMode}
          showEditControls={showEditControls}
          selected={editMode}
          box={sectionBoxes.greeting}
          baseBox={defaultProfileSectionBoxes.greeting}
          ariaLabel="移动 profile 问候区"
          onMoveStart={(event) => onStartSectionInteraction?.('greeting', 'move', event)}
          onResizeStart={(event) => onStartSectionInteraction?.('greeting', 'resize', event)}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[16px] font-semibold tracking-tight text-[#252d38]">
              <span>嗨，Alex!</span>
              <span className="text-[16px]">👋</span>
            </div>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#d7ebd8] bg-[#f5fff6] px-2.5 py-1 text-[12px] font-medium text-[#3e5d45]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff7dc] text-[#2ebf69] shadow-[0_8px_18px_-14px_rgba(53,160,84,0.45)]">
                <Medal className="h-3.5 w-3.5" />
              </span>
              好奇探索者
            </div>
          </div>
        </ProfileEditSection>

        <ProfileEditSection
          editMode={editMode}
          showEditControls={showEditControls}
          selected={editMode}
          box={sectionBoxes.stats}
          baseBox={defaultProfileSectionBoxes.stats}
          ariaLabel="移动 profile 数据区"
          onMoveStart={(event) => onStartSectionInteraction?.('stats', 'move', event)}
          onResizeStart={(event) => onStartSectionInteraction?.('stats', 'resize', event)}
        >
          <div className="flex min-w-0 flex-col justify-center gap-2 text-[15px] text-[#2d3641]">
            <div className="flex items-center gap-2 font-semibold">
              <Star className="h-5 w-5 fill-[#ffbf2f] text-[#ef8a1f]" />
              <span>
                1240 <span className="text-[13px] font-medium text-[#68727e]">XP</span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 font-semibold whitespace-nowrap">
                <Flame className="h-5 w-5 text-[#ff6d1b]" />
                <span>12天</span>
              </div>
              <div className="mt-1 pl-7 text-[13px] text-[#69727f] whitespace-nowrap">
                连续学习
              </div>
            </div>
          </div>
        </ProfileEditSection>

        <ProfileEditSection
          editMode={editMode}
          showEditControls={showEditControls}
          selected={editMode}
          box={sectionBoxes.badge}
          baseBox={defaultProfileSectionBoxes.badge}
          ariaLabel="移动 profile 徽章区"
          onMoveStart={(event) => onStartSectionInteraction?.('badge', 'move', event)}
          onResizeStart={(event) => onStartSectionInteraction?.('badge', 'resize', event)}
        >
          <div className="relative h-full w-full">
            <Image
              src={PROFILE_BADGE_IMAGE}
              alt="成就徽章"
              fill
              sizes="78px"
              className="object-contain"
            />
          </div>
        </ProfileEditSection>
      </div>
    </CardViewport>
  )
}

function ProfileEditSection({
  editMode = false,
  showEditControls = true,
  selected = false,
  box,
  baseBox,
  onMoveStart,
  onResizeStart,
  ariaLabel,
  className = '',
  children,
}: {
  editMode?: boolean
  showEditControls?: boolean
  selected?: boolean
  box: ProfileSectionBox
  baseBox: ProfileSectionBox
  onMoveStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onResizeStart?: (event: React.PointerEvent<HTMLButtonElement>) => void
  ariaLabel?: string
  className?: string
  children?: React.ReactNode
}) {
  const resolvedBaseBox = baseBox ?? box ?? defaultProfileSectionBoxes.avatar
  const resolvedBox = box ?? resolvedBaseBox
  const scaleX = resolvedBox.width / resolvedBaseBox.width
  const scaleY = resolvedBox.height / resolvedBaseBox.height

  return (
    <div
      className={`absolute min-w-0 ${className}`}
      style={{
        left: `${resolvedBox.x}px`,
        top: `${resolvedBox.y}px`,
        width: `${resolvedBox.width}px`,
        height: `${resolvedBox.height}px`,
      }}
    >
      <div className="relative h-full w-full overflow-hidden">
        <div
          className="origin-top-left"
          style={{
            width: `${resolvedBaseBox.width}px`,
            height: `${resolvedBaseBox.height}px`,
            transform: `scale(${scaleX}, ${scaleY})`,
          }}
        >
          {children}
        </div>
      </div>
      {editMode && showEditControls ? (
        <>
          <div className="pointer-events-none absolute right-2 top-2 z-[69] rounded-full bg-[#ff8a20] px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_22px_-14px_rgba(255,102,25,0.82)]">
            拖动 / 缩放
          </div>
          <button
            type="button"
            aria-label={ariaLabel ?? '移动 profile 内容块'}
            className={`absolute inset-0 z-[70] cursor-move rounded-[16px] outline-none ${
              selected ? 'ring-2 ring-[#ff7d19]/45 ring-offset-2 ring-offset-transparent' : ''
            }`}
            onPointerDown={onMoveStart}
          >
            <span className="sr-only">移动内容块</span>
          </button>
          <button
            type="button"
            aria-label="缩放 profile 内容块"
            className="absolute bottom-0 right-0 z-[71] h-4 w-4 cursor-nwse-resize rounded-[4px] border border-white/80 bg-[#ff7d19] shadow-[0_10px_20px_-14px_rgba(255,102,25,0.9)]"
            onPointerDown={onResizeStart}
          />
        </>
      ) : null}
    </div>
  )
}

function CalendarCardBody({
  titleTransform = defaultEditableTitleTransform,
  contentTransform = defaultEditableTitleTransform,
}: {
  titleTransform?: EditableTitleTransform
  contentTransform?: EditableTitleTransform
}) {
  const visibleCalendarRows = calendarRows.map((row) => ({
    ...row,
    cells: row.cells.slice(0, 7),
  }))

  return (
    <CardViewport>
      <div className="pl-5 sm:pl-5">
        <div
          className="origin-top-left translate-y-2"
          style={{
            transform: `translate(${titleTransform.x}px, ${titleTransform.y}px) scale(${titleTransform.scale})`,
          }}
        >
          <SectionTitle icon={<BookText className="h-5 w-5" />} title="活动日历" />
        </div>

        <div
          className="mt-2 origin-top-left"
          style={{
            transform: `translate(${contentTransform.x}px, ${contentTransform.y}px) scale(${contentTransform.scale})`,
          }}
        >
          <div className="grid grid-cols-[46px_repeat(7,minmax(0,1fr))] gap-x-1.5 gap-y-1.5 text-center text-[12px] text-[#59636f] sm:grid-cols-[52px_repeat(7,minmax(0,1fr))] sm:gap-x-2 sm:text-[13px]">
            <div />
            {calendarDays.map((day, index) => (
              <div key={`${day}-${index}`}>{day}</div>
            ))}

            {visibleCalendarRows.map((row) => (
              <React.Fragment key={row.label}>
                <div className="flex items-center text-left text-[12px] text-[#4d5662] sm:text-[13px]">
                  {row.label}
                </div>
                {row.cells.map((cell, index) => (
                  <div key={`${row.label}-${index}`} className="flex justify-center">
                    <HeatCell level={cell} />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5 text-[12px] text-[#5f6975]">
              <span>较少</span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <HeatCell key={level} level={level} />
                ))}
              </div>
              <span>较多</span>
            </div>
            <div className="flex -translate-x-[15px] items-center gap-2 rounded-full border border-[#f2d7bc] bg-[#fff6eb] px-3.5 py-1.5 text-[13px] font-medium text-[#ff6a1a]">
              <Flame className="h-5 w-5" />
              连续表现很棒！
            </div>
          </div>
        </div>
      </div>
    </CardViewport>
  )
}

function StreakCardBody({
  editMode = false,
  showEditControls = true,
  titleTransform = defaultStreakTitleTransform,
  campfireFrame = defaultStreakCampfireFrame,
  onStartTitleMove,
  onStartTitleScale,
  onSelectCampfire,
  onStartCampfireMove,
  onStartCampfireResize,
}: {
  editMode?: boolean
  showEditControls?: boolean
  titleTransform?: EditableTitleTransform
  campfireFrame?: HeroArtFrame
  onStartTitleMove?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartTitleScale?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onSelectCampfire?: () => void
  onStartCampfireMove?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartCampfireResize?: (event: React.PointerEvent<HTMLButtonElement>) => void
}) {
  const campfireEditMode = editMode && showEditControls

  return (
    <CardViewport>
      <div className="relative h-full min-h-0">
        <div className="absolute left-0 top-0 z-30">
          <EditableTitleFrame
            editMode={editMode}
            showEditControls={showEditControls}
            titleTransform={titleTransform}
            ariaLabel="移动连续性标题"
            onMoveStart={onStartTitleMove}
            onScaleStart={onStartTitleScale}
            controlSide="left"
          >
            <SectionTitle
              icon={
                <GeneratedSectionIcon src={STREAK_TITLE_IMAGE} alt="连续性图标" />
              }
              title="连续性"
            />
          </EditableTitleFrame>
        </div>

        {editMode && showEditControls ? (
          <div className="absolute right-4 top-4 z-[72]">
            <EditableMiniToolbar
              label="火堆"
              selected={editMode}
              ariaLabel="移动连续性火堆"
              onMoveStart={onStartCampfireMove}
              onScaleStart={onStartCampfireResize}
            />
          </div>
        ) : null}

        <div className="absolute inset-x-0 top-0 z-0 rounded-[20px] bg-[linear-gradient(180deg,#fff9f0_0%,#fffdf7_100%)] px-4 pb-4 pt-11">
          <div className="relative min-h-[122px]">
            <div className="flex items-start gap-3 translate-x-[30px] pr-[176px]">
              <div className="min-w-0 flex-1">
                <div className="text-[40px] font-semibold leading-none tracking-tight text-[#ff6b1c]">
                  <span className="inline-flex items-end gap-1 whitespace-nowrap">
                    <span>14</span>
                    <span className="pb-1 text-[18px]">天</span>
                  </span>
                </div>
                <div className="mt-2 text-[13px] font-semibold leading-none text-[#24303b]">
                  连续学习
                </div>
                <div className="mt-1.5 text-[13px] font-semibold leading-none text-[#24303b]">
                  表现很棒！
                </div>
              </div>
            </div>

            <EditableArtFrame
              editMode={editMode}
              artEditMode={campfireEditMode}
              selected={editMode}
              frame={campfireFrame}
              src={STREAK_CAMPFIRE_IMAGE}
              alt="连续学习火堆插画"
              onSelect={onSelectCampfire}
              onMoveStart={onStartCampfireMove}
              onResizeStart={onStartCampfireResize}
              assetLabel="火堆编辑"
              moveAriaLabel="移动连续性火堆"
              resizeAriaLabel="调整连续性火堆大小"
              imageClassName="object-contain object-center"
            />

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
                      index < 11
                        ? 'bg-[#ff8b1f] text-white'
                        : 'bg-[#e7e1d9] text-[#999490]'
                    }`}
                  >
                    ✓
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardViewport>
  )
}

function ReviewCardBody({
  editMode = false,
  showEditControls = true,
  titleTransform = defaultEditableTitleTransform,
  reviewBoxes = defaultReviewCardBoxes,
  onStartTitleMove,
  onStartTitleScale,
  onStartCardMove,
  onStartCardResize,
}: {
  editMode?: boolean
  showEditControls?: boolean
  titleTransform?: EditableTitleTransform
  reviewBoxes?: ReviewCardBoxes
  onStartTitleMove?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartTitleScale?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartCardMove?: (key: ReviewCardKey, event: React.PointerEvent<HTMLButtonElement>) => void
  onStartCardResize?: (key: ReviewCardKey, event: React.PointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <CardViewport>
      <div className="relative z-[120] flex h-full min-h-0 flex-col">
        <EditableTitleFrame
          editMode={editMode && showEditControls}
          titleTransform={titleTransform}
          ariaLabel="移动最近练习回顾标题"
          onMoveStart={onStartTitleMove}
          onScaleStart={onStartTitleScale}
          controlSide="left"
        >
          <SectionTitle
            icon={<GeneratedSectionIcon src={reviewTitleIcon} alt="最近练习回顾图标" />}
            title="最近练习回顾"
          />
        </EditableTitleFrame>

        {editMode ? (
          <div className="relative mt-[20px] h-[160px] min-h-0">
            {reviewCards.map((item) => (
              <EditableSubjectCardFrame
                key={item.key}
                editMode={editMode}
                showEditControls={showEditControls}
                box={reviewBoxes[item.key]}
                selected={editMode}
                ariaLabel={`移动 ${item.title}`}
                onMoveStart={(event) => onStartCardMove?.(item.key, event)}
                onResizeStart={(event) => onStartCardResize?.(item.key, event)}
              >
                <div className="flex h-full flex-col rounded-[16px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fbfdff_0%,#fff9f1_100%)] p-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px]">
                      <Image
                        src={item.icon}
                        alt={item.title}
                        fill
                        sizes="48px"
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0 text-right text-[10px] font-medium text-[#41505c]">
                      {item.title}
                    </div>
                  </div>
                  <div
                    className="mt-2.5 text-[20px] font-semibold leading-none tracking-tight"
                    style={{ color: item.accent }}
                  >
                    {item.score}
                  </div>
                  <div
                    className="mt-1 text-[9px] font-medium"
                    style={{ color: item.accent }}
                  >
                    {item.note}
                  </div>
                  <div className="mt-auto flex justify-end">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff2cf] text-[13px]">
                      {item.key === 'english' ? '🙂' : item.key === 'social' ? '🏛️' : '⭐'}
                    </div>
                  </div>
                </div>
              </EditableSubjectCardFrame>
            ))}
          </div>
        ) : (
          <div className="mt-2.5 grid gap-1.5 sm:grid-cols-2 min-[1500px]:grid-cols-4">
            {reviewCards.map((item) => (
              <div
                key={item.key}
                className="rounded-[16px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fbfdff_0%,#fff9f1_100%)] p-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px]">
                    <Image src={item.icon} alt={item.title} fill sizes="48px" className="object-contain" />
                  </div>
                  <div className="text-right text-[10px] font-medium text-[#41505c]">{item.title}</div>
                </div>
                <div
                  className="mt-2.5 text-[20px] font-semibold leading-none tracking-tight"
                  style={{ color: item.accent }}
                >
                  {item.score}
                </div>
                <div className="mt-1 text-[9px] font-medium" style={{ color: item.accent }}>
                  {item.note}
                </div>
                <div className="mt-2 flex justify-end">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff2cf] text-[13px]">
                    {item.key === 'english' ? '🙂' : item.key === 'social' ? '🏛️' : '⭐'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardViewport>
  )
}

function PathCardBody({
  editMode = false,
  showEditControls = true,
  titleTransform = defaultEditableTitleTransform,
  backgroundOffset = defaultPathBackgroundOffset,
  onStartTitleMove,
  onStartTitleScale,
  onStartBackgroundMove,
}: {
  editMode?: boolean
  showEditControls?: boolean
  titleTransform?: EditableTitleTransform
  backgroundOffset?: PathBackgroundOffset
  onStartTitleMove?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartTitleScale?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartBackgroundMove?: (event: React.PointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <CardViewport>
      <div className="relative h-full min-h-[214px]">
        <div className="absolute left-0 top-0 z-30">
          <EditableTitleFrame
            editMode={editMode}
            showEditControls={showEditControls}
            titleTransform={titleTransform}
            ariaLabel="移动学习路径标题"
            onMoveStart={onStartTitleMove}
            onScaleStart={onStartTitleScale}
            controlSide="left"
          >
            <SectionTitle
              icon={<GeneratedSectionIcon src={pathTitleIcon} alt="学习路径图标" />}
              title="学习路径"
            />
          </EditableTitleFrame>
        </div>

        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                transform: `translate3d(0, ${backgroundOffset.y}px, 0)`,
              }}
            >
              <Image
                src={pathBackgroundMountain}
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-bottom opacity-[0.72]"
              />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(249,253,251,0.44)_0%,rgba(255,250,242,0.16)_100%)]" />
        </div>
        {editMode && showEditControls ? (
          <div className="absolute right-3 top-3 z-30 flex items-center gap-1.5">
            <div className="pointer-events-none rounded-full bg-[#ff8a20] px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_22px_-14px_rgba(255,102,25,0.82)]">
              背景
            </div>
            <button
              type="button"
              aria-label="移动学习路径背景"
              className="rounded-full border border-[#ffd0a4] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#f06c10] shadow-[0_10px_22px_-16px_rgba(255,102,25,0.55)] outline-none"
              onPointerDown={onStartBackgroundMove}
            >
              拖动
            </button>
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-x-8 top-[30%]">
          <svg
            viewBox="0 0 1000 120"
            preserveAspectRatio="none"
            className="h-[42px] w-full"
          >
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
          {pathSteps.map((step, index) => (
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
                  sizes={step.tone === 'active' || step.tone === 'treasure' ? '68px' : '40px'}
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
    </CardViewport>
  )
}

function TimeStudyCardBody({
  editMode = false,
  showEditControls = true,
  titleTransform = defaultEditableTitleTransform,
  timeStudyPanelBoxes = defaultTimeStudyPanelBoxes,
  onStartTitleMove,
  onStartTitleScale,
  onStartPanelMove,
  onStartPanelResize,
  onStartPanelHeightResize,
}: {
  editMode?: boolean
  showEditControls?: boolean
  titleTransform?: EditableTitleTransform
  timeStudyPanelBoxes?: TimeStudyPanelBoxes
  onStartTitleMove?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartTitleScale?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartPanelMove?: (key: TimeStudyPanelKey, event: React.PointerEvent<HTMLButtonElement>) => void
  onStartPanelResize?: (
    key: TimeStudyPanelKey,
    event: React.PointerEvent<HTMLButtonElement>
  ) => void
  onStartPanelHeightResize?: (
    key: TimeStudyPanelKey,
    event: React.PointerEvent<HTMLButtonElement>
  ) => void
}) {
  return (
    <CardViewport>
      <div className="relative z-[120] flex h-full min-h-0 flex-col">
        <EditableTitleFrame
          editMode={editMode}
          showEditControls={showEditControls}
          titleTransform={titleTransform}
          ariaLabel="移动学习时长分布标题"
          onMoveStart={onStartTitleMove}
          onScaleStart={onStartTitleScale}
        >
          <SectionTitle
            icon={
              <GeneratedSectionIcon
                src={studyTimeSectionIcon}
                alt="学习时长分布图标"
              />
            }
            title="学习时长分布"
          />
        </EditableTitleFrame>

        <div className="mt-3 min-h-0 flex-1">
          {editMode ? (
            <div className="relative h-[150px] min-h-0">
              <EditableSubjectCardFrame
                editMode={editMode}
                showEditControls={showEditControls}
                box={timeStudyPanelBoxes.pie}
                ariaLabel="移动学习时长饼图区域"
                badgeText="拖动饼图"
                onMoveStart={(event) => onStartPanelMove?.('pie', event)}
                onResizeStart={(event) => onStartPanelResize?.('pie', event)}
                onResizeHeightStart={(event) => onStartPanelHeightResize?.('pie', event)}
                showHeightResizeHandle
              >
                <div className="flex h-full w-full items-center justify-center">
                  <div
                    className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[conic-gradient(#2f8bff_0deg_126deg,#24b892_126deg_223deg,#ff6940_223deg_306deg,#ffb930_306deg_349deg,#b6b1aa_349deg_360deg)]"
                    style={{
                      transform: `scale(${getAverageScale(
                        timeStudyPanelBoxes.pie,
                        defaultTimeStudyPanelBoxes.pie
                      )})`,
                      transformOrigin: 'center center',
                    }}
                  >
                    <div className="flex h-[68px] w-[68px] flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(236,217,196,0.7)]">
                      <div className="text-[11px] font-semibold text-[#2a3340]">本周</div>
                      <div className="mt-0.5 text-[9px] text-[#4f5966]">6小时30分</div>
                    </div>
                  </div>
                </div>
              </EditableSubjectCardFrame>

              <EditableSubjectCardFrame
                editMode={editMode}
                showEditControls={showEditControls}
                box={timeStudyPanelBoxes.stats}
                ariaLabel="移动学习时长明细区域"
                badgeText="拖动明细"
                onMoveStart={(event) => onStartPanelMove?.('stats', event)}
                onResizeStart={(event) => onStartPanelResize?.('stats', event)}
                onResizeHeightStart={(event) => onStartPanelHeightResize?.('stats', event)}
                showHeightResizeHandle
              >
                <div className="flex h-full w-full flex-col justify-center gap-1.5 px-2 py-1.5">
                  <div
                    className="flex h-full w-full flex-col justify-center gap-1.5"
                    style={{
                      transform: `scale(${getAverageScale(
                        timeStudyPanelBoxes.stats,
                        defaultTimeStudyPanelBoxes.stats
                      )})`,
                      transformOrigin: 'center center',
                    }}
                  >
                    {subjectStats.map((item) => (
                      <div
                        key={item.label}
                        className="grid grid-cols-[10px_minmax(0,1fr)_68px_auto] items-center gap-[5px] text-[9px]"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[#35404d]">{item.label}</span>
                        <span className="text-[#6a7480]">{item.value}</span>
                        <span className="font-medium text-[#4e5865]">{item.percent}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </EditableSubjectCardFrame>
            </div>
          ) : (
            <div className="flex flex-row items-start gap-4">
              <div className="relative mt-0.5 flex h-[124px] w-[124px] shrink-0 items-center justify-center">
                <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[conic-gradient(#2f8bff_0deg_126deg,#24b892_126deg_223deg,#ff6940_223deg_306deg,#ffb930_306deg_349deg,#b6b1aa_349deg_360deg)]">
                  <div className="flex h-[68px] w-[68px] flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(236,217,196,0.7)]">
                    <div className="text-[11px] font-semibold text-[#2a3340]">本周</div>
                    <div className="mt-0.5 text-[9px] text-[#4f5966]">6小时30分</div>
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5 pt-1">
                {subjectStats.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[10px_minmax(0,1fr)_68px_auto] items-center gap-[5px] text-[9px]"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[#35404d]">{item.label}</span>
                    <span className="text-[#6a7480]">{item.value}</span>
                    <span className="font-medium text-[#4e5865]">{item.percent}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </CardViewport>
  )
}

function SubjectProgressCardBody({
  editMode = false,
  showEditControls = true,
  titleTransform = defaultEditableTitleTransform,
  subjectBoxes = defaultSubjectCardBoxes,
  onStartTitleMove,
  onStartTitleScale,
  onStartCardMove,
  onStartCardResize,
  onStartCardHeightResize,
}: {
  editMode?: boolean
  showEditControls?: boolean
  titleTransform?: EditableTitleTransform
  subjectBoxes?: SubjectCardBoxes
  onStartTitleMove?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartTitleScale?: (event: React.PointerEvent<HTMLButtonElement>) => void
  onStartCardMove?: (
    key: SubjectCardKey,
    event: React.PointerEvent<HTMLButtonElement>
  ) => void
  onStartCardResize?: (
    key: SubjectCardKey,
    event: React.PointerEvent<HTMLButtonElement>
  ) => void
  onStartCardHeightResize?: (
    key: SubjectCardKey,
    event: React.PointerEvent<HTMLButtonElement>
  ) => void
}) {
  return (
    <CardViewport>
      <div className="flex h-full min-h-0 flex-col">
        <EditableTitleFrame
          editMode={editMode}
          showEditControls={showEditControls}
          titleTransform={titleTransform}
          ariaLabel="移动科目进度标题"
          onMoveStart={onStartTitleMove}
          onScaleStart={onStartTitleScale}
          controlSide="left"
        >
          <SectionTitle
            icon={
              <GeneratedSectionIcon
                src={subjectSectionIcon}
                alt="科目进度图标"
              />
            }
            title="科目进度"
          />
        </EditableTitleFrame>

        {editMode ? (
          <div className="relative mt-2 h-[188px] min-h-0">
            {subjectCards.map((item) => (
              <EditableSubjectCardFrame
                key={item.icon}
                editMode={editMode}
                showEditControls={showEditControls}
                box={subjectBoxes[item.icon as SubjectCardKey]}
                ariaLabel={`移动 ${item.title} 卡片`}
                badgeText={`拖动 ${item.title}`}
                showHeightResizeHandle
                onMoveStart={(event) =>
                  onStartCardMove?.(item.icon as SubjectCardKey, event)
                }
                onResizeStart={(event) =>
                  onStartCardResize?.(item.icon as SubjectCardKey, event)
                }
                onResizeHeightStart={(event) =>
                  onStartCardHeightResize?.(item.icon as SubjectCardKey, event)
                }
              >
                <div
                  className="rounded-[16px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ef_100%)] p-1.5"
                  style={{
                    transform: `scale(${getAverageScale(
                      subjectBoxes[item.icon as SubjectCardKey],
                      defaultSubjectCardBoxes[item.icon as SubjectCardKey]
                    )})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="origin-left scale-[0.65]">
                      <SubjectProgressIcon kind={item.icon} />
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-semibold text-[#24303b]">
                        {item.title}
                      </div>
                      <div className="mt-0.5 text-[12px] font-semibold leading-none tracking-tight text-[#1f2935]">
                        {item.value}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <ProgressTrack
                      value={item.width}
                      color={
                        item.icon === 'math'
                          ? '#1f73eb'
                          : item.icon === 'science'
                            ? '#21b287'
                            : item.icon === 'chinese'
                              ? '#ff5a2b'
                              : '#ffb300'
                      }
                    />
                  </div>
                </div>
              </EditableSubjectCardFrame>
            ))}
          </div>
        ) : (
          <div className="mt-2 grid gap-1 sm:grid-cols-2 min-[1280px]:grid-cols-1 2xl:grid-cols-2">
            {subjectCards.map((item) => (
              <div
                key={item.title}
                className="rounded-[16px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ef_100%)] p-1.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="origin-left scale-[0.65]">
                    <SubjectProgressIcon kind={item.icon} />
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-semibold text-[#24303b]">
                      {item.title}
                    </div>
                    <div className="mt-0.5 text-[12px] font-semibold leading-none tracking-tight text-[#1f2935]">
                      {item.value}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <ProgressTrack
                    value={item.width}
                    color={
                      item.icon === 'math'
                        ? '#1f73eb'
                        : item.icon === 'science'
                          ? '#21b287'
                          : item.icon === 'chinese'
                            ? '#ff5a2b'
                            : '#ffb300'
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardViewport>
  )
}

function IllustrationCrop({
  src,
  alt,
  className,
  sizes,
  imageClassName,
}: {
  src: string | StaticImageData
  alt: string
  className?: string
  sizes: string
  imageClassName?: string
}) {
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={imageClassName ?? 'object-contain'}
      />
    </div>
  )
}

function HeatCell({ level }: { level: number }) {
  const colors = [
    '#fff5e6',
    '#ffe8c4',
    '#ffd190',
    '#ffaf57',
    '#ff8c27',
    '#ff6017',
  ]

  return (
    <div
      className="h-[18px] w-[18px] rounded-[5px]"
      style={{
        backgroundColor:
          colors[Math.max(0, Math.min(level, colors.length - 1))],
      }}
    />
  )
}

function ProgressTrack({ value, color }: { value: string; color: string }) {
  return (
    <div className="h-[7px] overflow-hidden rounded-full bg-[#efdfcf]">
      <div
        className="h-full rounded-full"
        style={{ width: value, backgroundColor: color }}
      />
    </div>
  )
}

function MaskedContent({
  shellOnly,
  forceVisible = false,
  children,
}: {
  shellOnly: boolean
  forceVisible?: boolean
  children: React.ReactNode
}) {
  const hidden = shellOnly && !forceVisible

  return (
    <div
      aria-hidden={hidden}
      className={hidden ? 'invisible pointer-events-none select-none' : ''}
    >
      {children}
    </div>
  )
}

function CardViewport({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative h-full w-full min-h-0 min-w-0 overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

function getAverageScale(
  box: { width: number; height: number },
  base: { width: number; height: number }
) {
  const scaleX = box.width / base.width
  const scaleY = box.height / base.height

  return clamp((scaleX + scaleY) / 2, 0.72, 1.75)
}

type FrozenLayoutSnapshot = {
  shellCornerRadius?: number
  shellBoxes?: unknown
  heroArtFrame?: unknown
  heroCtaOffset?: unknown
  calendarTitleTransform?: unknown
  calendarContentTransform?: unknown
  profileAvatarTransform?: unknown
  profileSectionBoxes?: unknown
  reviewCardBoxes?: unknown
  streakTitleTransform?: unknown
  streakCampfireFrame?: unknown
  timeTitleTransform?: unknown
  timeStudyPanelBoxes?: unknown
  taskTitleTransform?: unknown
  taskCardBoxes?: unknown
  subjectTitleTransform?: unknown
  reviewTitleTransform?: unknown
  pathTitleTransform?: unknown
  pathBackgroundOffset?: unknown
  goalTitleTransform?: unknown
  goalSummaryOffset?: unknown
  goalTrophyFrame?: unknown
  subjectCardBoxes?: unknown
}

export function DashboardVisualReplica({
  shellOnly = false,
  layoutEditMode = false,
  initialFrozenLayout = null,
  heroLayoutPreset = normalizeDashboardHeroLayoutPreset(null),
  taskLayoutPreset = normalizeDashboardTaskLayoutPreset(null),
  pathLayoutPreset = normalizeDashboardPathLayoutPreset(null),
  streakLayoutPreset = normalizeDashboardStreakLayoutPreset(null),
  goalLayoutPreset = normalizeDashboardGoalLayoutPreset(null),
  profileLayoutPreset = normalizeDashboardProfileLayoutPreset(null),
  calendarLayoutPreset = normalizeDashboardCalendarLayoutPreset(null),
  timeLayoutPreset = normalizeDashboardTimeLayoutPreset(null),
  subjectLayoutPreset = normalizeDashboardSubjectLayoutPreset(null),
  reviewLayoutPreset = normalizeDashboardReviewLayoutPreset(null),
}: {
  shellOnly?: boolean
  layoutEditMode?: boolean
  initialFrozenLayout?: FrozenLayoutSnapshot | null
  heroLayoutPreset?: DashboardHeroLayoutPreset
  taskLayoutPreset?: DashboardTaskLayoutPreset
  pathLayoutPreset?: DashboardPathLayoutPreset
  streakLayoutPreset?: DashboardStreakLayoutPreset
  goalLayoutPreset?: DashboardGoalLayoutPreset
  profileLayoutPreset?: DashboardProfileLayoutPreset
  calendarLayoutPreset?: DashboardCalendarLayoutPreset
  timeLayoutPreset?: DashboardTimeLayoutPreset
  subjectLayoutPreset?: DashboardSubjectLayoutPreset
  reviewLayoutPreset?: DashboardReviewLayoutPreset
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const heroArtworkFrameRef = useRef<HTMLDivElement | null>(null)
  const useFrozenLayoutSnapshot = initialFrozenLayout !== null
  const resolvedDefaultHeroArtFrame = heroLayoutPreset.artFrame
  const resolvedDefaultHeroCtaOffset = heroLayoutPreset.ctaOffset
  const [editableShellBoxes, setEditableShellBoxes] = useState<ShellBox[]>(() =>
    applyContentPresetsToShellBoxes(
      normalizeShellBoxes(initialFrozenLayout?.shellBoxes) ?? cloneShellBoxes(),
      {
        hero: heroLayoutPreset,
        profile: profileLayoutPreset,
        calendar: calendarLayoutPreset,
        path: pathLayoutPreset,
        time: timeLayoutPreset,
        subject: subjectLayoutPreset,
        streak: streakLayoutPreset,
        goal: goalLayoutPreset,
        review: reviewLayoutPreset,
      }
    )
  )
  const [selectedShellKey, setSelectedShellKey] = useState<ShellBoxKey | null>(
    null
  )
  const [shellCornerRadius, setShellCornerRadius] = useState(() => {
    if (typeof initialFrozenLayout?.shellCornerRadius === 'number') {
      return clamp(Math.round(initialFrozenLayout.shellCornerRadius), 16, 40)
    }

    return 28
  })
  const [interaction, setInteraction] = useState<ShellInteraction | null>(null)
  const [heroArtFrame, setHeroArtFrame] = useState<HeroArtFrame>(
    () => resolvedDefaultHeroArtFrame
  )
  const [heroArtInteraction, setHeroArtInteraction] =
    useState<HeroArtInteraction | null>(null)
  const [heroArtEditMode, setHeroArtEditMode] = useState(false)
  const [heroCtaOffset, setHeroCtaOffset] = useState<HeroCtaOffset>(
    () => resolvedDefaultHeroCtaOffset
  )
  const [heroCtaInteraction, setHeroCtaInteraction] =
    useState<HeroCtaInteraction | null>(null)
  const [heroCtaEditMode, setHeroCtaEditMode] = useState(false)
  const [heroContentMaxWidth, setHeroContentMaxWidth] = useState(
    heroLayoutPreset.contentMaxWidth
  )
  const useSharedTaskPreset = shellOnly
  const useSharedPathPreset = shellOnly
  const useSharedStreakPreset = shellOnly
  const useSharedGoalPreset = shellOnly
  const useSharedProfilePreset = shellOnly
  const useSharedCalendarPreset = shellOnly
  const useSharedTimePreset = shellOnly
  const useSharedSubjectPreset = shellOnly
  const useSharedReviewPreset = shellOnly
  const [savingHeroPreset, setSavingHeroPreset] = useState(false)
  const [savingTaskPreset, setSavingTaskPreset] = useState(false)
  const [savingPathPreset, setSavingPathPreset] = useState(false)
  const [savingStreakPreset, setSavingStreakPreset] = useState(false)
  const [savingGoalPreset, setSavingGoalPreset] = useState(false)
  const [savingProfilePreset, setSavingProfilePreset] = useState(false)
  const [savingCalendarPreset, setSavingCalendarPreset] = useState(false)
  const [savingTimePreset, setSavingTimePreset] = useState(false)
  const [savingSubjectPreset, setSavingSubjectPreset] = useState(false)
  const [savingReviewPreset, setSavingReviewPreset] = useState(false)
  const [profileAvatarTransform, setProfileAvatarTransform] =
    useState<ProfileAvatarTransform>(() =>
      normalizeProfileAvatarTransform(initialFrozenLayout?.profileAvatarTransform) ??
      defaultProfileAvatarTransform
    )
  const [profileAvatarInteraction, setProfileAvatarInteraction] =
    useState<ProfileAvatarInteraction | null>(null)
  const [profileAvatarEditMode, setProfileAvatarEditMode] = useState(false)
  const [profileSectionBoxes, setProfileSectionBoxes] =
    useState<ProfileSectionBoxes>(() =>
      useSharedProfilePreset
        ? profileLayoutPreset.sectionBoxes
        : normalizeProfileSectionBoxes(initialFrozenLayout?.profileSectionBoxes) ??
          defaultProfileSectionBoxes
    )
  const [profileSectionInteraction, setProfileSectionInteraction] =
    useState<ProfileSectionInteraction | null>(null)
  const [reviewCardBoxes, setReviewCardBoxes] =
    useState<ReviewCardBoxes>(() =>
      useSharedReviewPreset
        ? reviewLayoutPreset.cardBoxes
        : normalizeReviewCardBoxes(initialFrozenLayout?.reviewCardBoxes) ??
          defaultReviewCardBoxes
    )
  const [reviewCardInteraction, setReviewCardInteraction] =
    useState<ReviewCardInteraction | null>(null)
  const [streakTitleTransform, setStreakTitleTransform] =
    useState<EditableTitleTransform>(() =>
      useSharedStreakPreset
        ? streakLayoutPreset.titleTransform
        : normalizeEditableTitleTransform(initialFrozenLayout?.streakTitleTransform) ??
          defaultStreakTitleTransform
    )
  const [streakCampfireFrame, setStreakCampfireFrame] = useState<HeroArtFrame>(() =>
    useSharedStreakPreset
      ? streakLayoutPreset.campfireFrame
      : normalizeHeroArtFrame(initialFrozenLayout?.streakCampfireFrame) ??
        defaultStreakCampfireFrame
  )
  const streakCampfireEditMode = layoutEditMode
  const [timeTitleTransform, setTimeTitleTransform] = useState<EditableTitleTransform>(
    () =>
      useSharedTimePreset
        ? timeLayoutPreset.titleTransform
        : normalizeEditableTitleTransform(initialFrozenLayout?.timeTitleTransform) ??
          defaultEditableTitleTransform
  )
  const [calendarTitleTransform, setCalendarTitleTransform] =
    useState<EditableTitleTransform>(() =>
      useSharedCalendarPreset
        ? calendarLayoutPreset.titleTransform
        : normalizeEditableTitleTransform(initialFrozenLayout?.calendarTitleTransform) ??
          defaultEditableTitleTransform
    )
  const [calendarContentTransform, setCalendarContentTransform] =
    useState<EditableTitleTransform>(() =>
      useSharedCalendarPreset
        ? calendarLayoutPreset.contentTransform
        : normalizeEditableTitleTransform(initialFrozenLayout?.calendarContentTransform) ??
          defaultEditableTitleTransform
    )
  const [timeStudyPanelBoxes, setTimeStudyPanelBoxes] =
    useState<TimeStudyPanelBoxes>(() =>
      useSharedTimePreset
        ? timeLayoutPreset.panelBoxes
        : normalizeTimeStudyPanelBoxes(initialFrozenLayout?.timeStudyPanelBoxes) ??
          defaultTimeStudyPanelBoxes
    )
  const [taskTitleTransform, setTaskTitleTransform] =
    useState<EditableTitleTransform>(() =>
      taskLayoutPreset.titleTransform
    )
  const [taskCardBoxes, setTaskCardBoxes] =
    useState<TaskCardBoxes>(() => taskLayoutPreset.taskCardBoxes)
  const [subjectTitleTransform, setSubjectTitleTransform] =
    useState<EditableTitleTransform>(() =>
      useSharedSubjectPreset
        ? subjectLayoutPreset.titleTransform
        : normalizeEditableTitleTransform(initialFrozenLayout?.subjectTitleTransform) ??
          defaultEditableTitleTransform
    )
  const [reviewTitleTransform, setReviewTitleTransform] =
    useState<EditableTitleTransform>(() =>
      useSharedReviewPreset
        ? reviewLayoutPreset.titleTransform
        : normalizeEditableTitleTransform(initialFrozenLayout?.reviewTitleTransform) ??
          defaultEditableTitleTransform
    )
  const [pathTitleTransform, setPathTitleTransform] =
    useState<EditableTitleTransform>(() =>
      useSharedPathPreset
        ? pathLayoutPreset.titleTransform
        : normalizeEditableTitleTransform(initialFrozenLayout?.pathTitleTransform) ??
          defaultEditableTitleTransform
    )
  const [pathBackgroundOffset, setPathBackgroundOffset] =
    useState<PathBackgroundOffset>(() =>
      useSharedPathPreset
        ? pathLayoutPreset.backgroundOffset
        : normalizePathBackgroundOffset(initialFrozenLayout?.pathBackgroundOffset) ??
          defaultPathBackgroundOffset
    )
  const [pathBackgroundInteraction, setPathBackgroundInteraction] =
    useState<PathBackgroundInteraction | null>(null)
  const [goalTitleTransform, setGoalTitleTransform] =
    useState<EditableTitleTransform>(() =>
      useSharedGoalPreset
        ? goalLayoutPreset.titleTransform
        : normalizeEditableTitleTransform(initialFrozenLayout?.goalTitleTransform) ??
          defaultEditableTitleTransform
    )
  const [goalSummaryOffset, setGoalSummaryOffset] = useState(() =>
    useSharedGoalPreset
      ? goalLayoutPreset.summaryOffset
      : {
          x:
            typeof initialFrozenLayout?.goalSummaryOffset === 'object' &&
            initialFrozenLayout.goalSummaryOffset &&
            typeof (initialFrozenLayout.goalSummaryOffset as { x?: unknown }).x === 'number'
              ? Number(
                  ((initialFrozenLayout.goalSummaryOffset as { x: number }).x).toFixed(3)
                )
              : 20,
          y:
            typeof initialFrozenLayout?.goalSummaryOffset === 'object' &&
            initialFrozenLayout.goalSummaryOffset &&
            typeof (initialFrozenLayout.goalSummaryOffset as { y?: unknown }).y === 'number'
              ? Number(
                  ((initialFrozenLayout.goalSummaryOffset as { y: number }).y).toFixed(3)
                )
              : -30,
        }
  )
  const [goalTrophyFrame, setGoalTrophyFrame] = useState(() =>
    useSharedGoalPreset
      ? goalLayoutPreset.trophyFrame
      : {
          x:
            typeof initialFrozenLayout?.goalTrophyFrame === 'object' &&
            initialFrozenLayout.goalTrophyFrame &&
            typeof (initialFrozenLayout.goalTrophyFrame as { x?: unknown }).x === 'number'
              ? Number(
                  ((initialFrozenLayout.goalTrophyFrame as { x: number }).x).toFixed(3)
                )
              : 0,
          y:
            typeof initialFrozenLayout?.goalTrophyFrame === 'object' &&
            initialFrozenLayout.goalTrophyFrame &&
            typeof (initialFrozenLayout.goalTrophyFrame as { y?: unknown }).y === 'number'
              ? Number(
                  ((initialFrozenLayout.goalTrophyFrame as { y: number }).y).toFixed(3)
                )
              : 0,
          width:
            typeof initialFrozenLayout?.goalTrophyFrame === 'object' &&
            initialFrozenLayout.goalTrophyFrame &&
            typeof (initialFrozenLayout.goalTrophyFrame as { width?: unknown }).width ===
              'number'
              ? Number(
                  ((initialFrozenLayout.goalTrophyFrame as { width: number }).width).toFixed(3)
                )
              : 126,
          height:
            typeof initialFrozenLayout?.goalTrophyFrame === 'object' &&
            initialFrozenLayout.goalTrophyFrame &&
            typeof (initialFrozenLayout.goalTrophyFrame as { height?: unknown }).height ===
              'number'
              ? Number(
                  ((initialFrozenLayout.goalTrophyFrame as { height: number }).height).toFixed(3)
                )
              : 116,
        }
  )
  const [subjectCardBoxes, setSubjectCardBoxes] =
    useState<SubjectCardBoxes>(() =>
      useSharedSubjectPreset
        ? subjectLayoutPreset.cardBoxes
        : normalizeSubjectCardBoxes(initialFrozenLayout?.subjectCardBoxes) ??
          defaultSubjectCardBoxes
    )
  const [subjectCardGridSnapApplied, setSubjectCardGridSnapApplied] = useState(() => {
    if (useFrozenLayoutSnapshot) {
      return true
    }

    if (typeof window === 'undefined') {
      return false
    }

    try {
      return window.localStorage.getItem(SUBJECT_CARD_GRID_SNAP_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [editableInnerInteraction, setEditableInnerInteraction] =
    useState<
      EditableTitleInteraction |
        StreakCampfireInteraction |
        TimeStudyPanelInteraction |
        SubjectCardInteraction |
        TaskCardInteraction |
        null
    >(null)
  const [savingPageSnapshot, setSavingPageSnapshot] = useState(false)
  const [saveToast, setSaveToast] = useState<string | null>(null)

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot || useSharedTaskPreset) {
      return
    }

    try {
      const raw = window.localStorage.getItem(SHELL_LAYOUT_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeShellBoxes(parsed)
      if (normalized) {
        setEditableShellBoxes(normalized)
      }
    } catch {
      // Ignore malformed local state and fall back to the baseline layout.
    }
  }, [layoutEditMode, shellOnly, useFrozenLayoutSnapshot, useSharedTaskPreset])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot || useSharedTaskPreset) {
      return
    }

    try {
      const raw = window.localStorage.getItem(PROFILE_LAYOUT_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeProfileSectionBoxes(parsed)
      if (normalized) {
        setProfileSectionBoxes(normalized)
      }
    } catch {
      // Ignore malformed profile content state.
    }
  }, [layoutEditMode, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      window.localStorage.setItem(
        PROFILE_LAYOUT_STORAGE_KEY,
        JSON.stringify(profileSectionBoxes)
      )
    } catch {
      // Persisting the temporary profile content state is best-effort only.
    }
  }, [layoutEditMode, profileSectionBoxes, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      const raw = window.localStorage.getItem(REVIEW_CARD_LAYOUT_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeReviewCardBoxes(parsed)
      if (normalized) {
        setReviewCardBoxes(normalized)
      }
    } catch {
      // Ignore malformed review content state.
    }
  }, [layoutEditMode, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      window.localStorage.setItem(
        REVIEW_CARD_LAYOUT_STORAGE_KEY,
        JSON.stringify(reviewCardBoxes)
      )
    } catch {
      // Persisting review card layout state is best-effort only.
    }
  }, [layoutEditMode, reviewCardBoxes, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      const raw = window.localStorage.getItem(TIME_TITLE_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeEditableTitleTransform(parsed)
      if (normalized) {
        setTimeTitleTransform(normalized)
      }
    } catch {
      // Ignore malformed title state.
    }
  }, [layoutEditMode, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      window.localStorage.setItem(
        TIME_TITLE_STORAGE_KEY,
        JSON.stringify(timeTitleTransform)
      )
    } catch {
      // Persisting title state is best-effort only.
    }
  }, [layoutEditMode, shellOnly, timeTitleTransform])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      const raw = window.localStorage.getItem(TIME_STUDY_PANEL_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeTimeStudyPanelBoxes(parsed)
      if (normalized) {
        setTimeStudyPanelBoxes(normalized)
      }
    } catch {
      // Ignore malformed panel state.
    }
  }, [layoutEditMode, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      window.localStorage.setItem(
        TIME_STUDY_PANEL_STORAGE_KEY,
        JSON.stringify(timeStudyPanelBoxes)
      )
    } catch {
      // Persisting panel state is best-effort only.
    }
  }, [layoutEditMode, shellOnly, timeStudyPanelBoxes])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      const raw = window.localStorage.getItem(TASK_TITLE_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeEditableTitleTransform(parsed)
      if (normalized) {
        setTaskTitleTransform(normalized)
      }
    } catch {
      // Ignore malformed task title state.
    }
  }, [layoutEditMode, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      window.localStorage.setItem(TASK_TITLE_STORAGE_KEY, JSON.stringify(taskTitleTransform))
    } catch {
      // Persisting task title state is best-effort only.
    }
  }, [layoutEditMode, shellOnly, taskTitleTransform, useFrozenLayoutSnapshot, useSharedTaskPreset])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot || useSharedTaskPreset) {
      return
    }

    try {
      const raw = window.localStorage.getItem(TASK_CARD_LAYOUT_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeTaskCardBoxes(parsed)
      if (normalized) {
        setTaskCardBoxes(normalized)
      }
    } catch {
      // Ignore malformed task card layout state.
    }
  }, [layoutEditMode, shellOnly, useFrozenLayoutSnapshot, useSharedTaskPreset])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot || useSharedTaskPreset) {
      return
    }

    try {
      window.localStorage.setItem(
        TASK_CARD_LAYOUT_STORAGE_KEY,
        JSON.stringify(taskCardBoxes)
      )
    } catch {
      // Persisting task card layout state is best-effort only.
    }
  }, [layoutEditMode, shellOnly, taskCardBoxes, useFrozenLayoutSnapshot, useSharedTaskPreset])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot || useSharedStreakPreset) {
      return
    }

    try {
      const raw = window.localStorage.getItem(SUBJECT_TITLE_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeEditableTitleTransform(parsed)
      if (normalized) {
        setSubjectTitleTransform(normalized)
      }
    } catch {
      // Ignore malformed title state.
    }
  }, [layoutEditMode, shellOnly, useFrozenLayoutSnapshot, useSharedStreakPreset])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot || useSharedStreakPreset) {
      return
    }

    try {
      window.localStorage.setItem(
        SUBJECT_TITLE_STORAGE_KEY,
        JSON.stringify(subjectTitleTransform)
      )
    } catch {
      // Persisting title state is best-effort only.
    }
  }, [layoutEditMode, shellOnly, subjectTitleTransform])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      const raw = window.localStorage.getItem(STREAK_TITLE_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeEditableTitleTransform(parsed)
      if (normalized) {
        setStreakTitleTransform(normalized)
      }
    } catch {
      // Ignore malformed streak title state.
    }
  }, [layoutEditMode, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      window.localStorage.setItem(
        STREAK_TITLE_STORAGE_KEY,
        JSON.stringify(streakTitleTransform)
      )
    } catch {
      // Persisting streak title state is best-effort only.
    }
  }, [layoutEditMode, shellOnly, streakTitleTransform, useFrozenLayoutSnapshot, useSharedStreakPreset])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot || useSharedStreakPreset) {
      return
    }

    try {
      const raw = window.localStorage.getItem(STREAK_CAMPFIRE_FRAME_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeHeroArtFrame(parsed)
      if (normalized) {
        setStreakCampfireFrame(normalized)
      }
    } catch {
      // Ignore malformed streak campfire state.
    }
  }, [layoutEditMode, shellOnly, useFrozenLayoutSnapshot, useSharedStreakPreset])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot || useSharedStreakPreset) {
      return
    }

    try {
      window.localStorage.setItem(
        STREAK_CAMPFIRE_FRAME_STORAGE_KEY,
        JSON.stringify(streakCampfireFrame)
      )
    } catch {
      // Persisting streak campfire state is best-effort only.
    }
  }, [layoutEditMode, shellOnly, streakCampfireFrame, useFrozenLayoutSnapshot, useSharedStreakPreset])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot || useSharedPathPreset) {
      return
    }

    try {
      const raw = window.localStorage.getItem(REVIEW_TITLE_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeEditableTitleTransform(parsed)
      if (normalized) {
        setReviewTitleTransform(normalized)
      }
    } catch {
      // Ignore malformed title state.
    }
  }, [layoutEditMode, shellOnly, useFrozenLayoutSnapshot, useSharedPathPreset])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot || useSharedPathPreset) {
      return
    }

    try {
      window.localStorage.setItem(
        REVIEW_TITLE_STORAGE_KEY,
        JSON.stringify(reviewTitleTransform)
      )
    } catch {
      // Persisting title state is best-effort only.
    }
  }, [layoutEditMode, reviewTitleTransform, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      const raw = window.localStorage.getItem(PATH_TITLE_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeEditableTitleTransform(parsed)
      if (normalized) {
        setPathTitleTransform(normalized)
      }
    } catch {
      // Ignore malformed path title state.
    }
  }, [layoutEditMode, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      window.localStorage.setItem(PATH_TITLE_STORAGE_KEY, JSON.stringify(pathTitleTransform))
    } catch {
      // Persisting the temporary path title state is best-effort only.
    }
  }, [layoutEditMode, pathTitleTransform, shellOnly, useFrozenLayoutSnapshot, useSharedPathPreset])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot || useSharedPathPreset) {
      return
    }

    try {
      const raw = window.localStorage.getItem(PATH_BACKGROUND_OFFSET_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizePathBackgroundOffset(parsed)
      if (normalized) {
        setPathBackgroundOffset(normalized)
      }
    } catch {
      // Ignore malformed path background state.
    }
  }, [layoutEditMode, shellOnly, useFrozenLayoutSnapshot, useSharedPathPreset])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot || useSharedPathPreset) {
      return
    }

    try {
      window.localStorage.setItem(
        PATH_BACKGROUND_OFFSET_STORAGE_KEY,
        JSON.stringify(pathBackgroundOffset)
      )
    } catch {
      // Persisting the temporary path background state is best-effort only.
    }
  }, [layoutEditMode, pathBackgroundOffset, shellOnly, useFrozenLayoutSnapshot, useSharedPathPreset])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot || subjectCardGridSnapApplied) {
      return
    }

    try {
      const snapped = snapSubjectCardBoxesToGrid(subjectCardBoxes)
      const hasDifference = (Object.keys(snapped) as SubjectCardKey[]).some((key) => {
        const current = subjectCardBoxes[key]
        const next = snapped[key]
        return (
          Math.abs(current.x - next.x) > 0.01 ||
          Math.abs(current.y - next.y) > 0.01 ||
          Math.abs(current.width - next.width) > 0.01 ||
          Math.abs(current.height - next.height) > 0.01
        )
      })

      if (hasDifference) {
        setSubjectCardBoxes(snapped)
      }

      window.localStorage.setItem(SUBJECT_CARD_GRID_SNAP_STORAGE_KEY, '1')
      setSubjectCardGridSnapApplied(true)
    } catch {
      // Ignore snap failures.
    }
  }, [layoutEditMode, shellOnly, subjectCardBoxes, subjectCardGridSnapApplied])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      const raw = window.localStorage.getItem(SUBJECT_CARD_LAYOUT_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeSubjectCardBoxes(parsed)
      if (normalized) {
        setSubjectCardBoxes(normalized)
      }
    } catch {
      // Ignore malformed subject card layout state.
    }
  }, [layoutEditMode, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      window.localStorage.setItem(
        SUBJECT_CARD_LAYOUT_STORAGE_KEY,
        JSON.stringify(subjectCardBoxes)
      )
    } catch {
      // Persisting subject card layout state is best-effort only.
    }
  }, [layoutEditMode, shellOnly, subjectCardBoxes])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      window.localStorage.setItem(
        SHELL_LAYOUT_STORAGE_KEY,
        JSON.stringify(editableShellBoxes)
      )
    } catch {
      // Persisting the temporary editor state is best-effort only.
    }
  }, [editableShellBoxes, layoutEditMode, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode || useFrozenLayoutSnapshot) {
      return
    }

    try {
      const rawRadius = window.localStorage.getItem(`${SHELL_LAYOUT_STORAGE_KEY}:radius`)
      if (!rawRadius) {
        return
      }

      const parsedRadius = Number(rawRadius)
      if (Number.isFinite(parsedRadius)) {
        setShellCornerRadius(clamp(Math.round(parsedRadius), 16, 40))
      }
    } catch {
      // Ignore malformed radius state.
    }
  }, [layoutEditMode, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode) {
      return
    }

    try {
      window.localStorage.setItem(
        `${SHELL_LAYOUT_STORAGE_KEY}:radius`,
        String(shellCornerRadius)
      )
    } catch {
      // Ignore storage failures.
    }
  }, [layoutEditMode, shellCornerRadius, shellOnly])

  // Hero layout now uses the shared preset file instead of localStorage.

  useEffect(() => {
    if (!shellOnly || !layoutEditMode) {
      return
    }

    try {
      const raw = window.localStorage.getItem(PROFILE_AVATAR_TRANSFORM_STORAGE_KEY)
      if (!raw) {
        return
      }

      const parsed = JSON.parse(raw) as unknown
      const normalized = normalizeProfileAvatarTransform(parsed)
      if (normalized) {
        setProfileAvatarTransform(normalized)
      }
    } catch {
      // Ignore malformed profile avatar state.
    }
  }, [layoutEditMode, shellOnly])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode) {
      return
    }

    try {
      window.localStorage.setItem(
        PROFILE_AVATAR_TRANSFORM_STORAGE_KEY,
        JSON.stringify(profileAvatarTransform)
      )
    } catch {
      // Persisting the temporary profile avatar state is best-effort only.
    }
  }, [layoutEditMode, profileAvatarTransform, shellOnly])

  useEffect(() => {
    if (!editableInnerInteraction) {
      return
    }

    const handleMove = (event: PointerEvent) => {
      if (
        editableInnerInteraction.pointerId !== null &&
        event.pointerId !== editableInnerInteraction.pointerId
      ) {
        return
      }

      const deltaX = event.clientX - editableInnerInteraction.startClientX
      const deltaY = event.clientY - editableInnerInteraction.startClientY

      if (editableInnerInteraction.key === 'time-title') {
        setTimeTitleTransform((current) => {
          if (editableInnerInteraction.mode === 'move') {
            return {
              ...current,
              x: Number((editableInnerInteraction.startX + deltaX).toFixed(3)),
              y: Number((editableInnerInteraction.startY + deltaY).toFixed(3)),
            }
          }

          const deltaScale = (deltaX + deltaY) / 260
          return {
            ...current,
            scale: Number(
              clamp(
                editableInnerInteraction.startScale + deltaScale,
                0.7,
                1.45
              ).toFixed(3)
            ),
          }
        })
        return
      }

      if (editableInnerInteraction.key === 'streak-title') {
        setStreakTitleTransform((current) => {
          if (editableInnerInteraction.mode === 'move') {
            return {
              ...current,
              x: Number((editableInnerInteraction.startX + deltaX).toFixed(3)),
              y: Number((editableInnerInteraction.startY + deltaY).toFixed(3)),
            }
          }

          const deltaScale = (deltaX + deltaY) / 260
          return {
            ...current,
            scale: Number(
              clamp(
                editableInnerInteraction.startScale + deltaScale,
                0.7,
                1.45
              ).toFixed(3)
            ),
          }
        })
        return
      }

      if (editableInnerInteraction.key === 'streak-campfire') {
        setStreakCampfireFrame((current) => {
          if (editableInnerInteraction.mode === 'move') {
            return {
              ...current,
              x: Number((editableInnerInteraction.startX + deltaX).toFixed(3)),
              y: Number((editableInnerInteraction.startY + deltaY).toFixed(3)),
            }
          }

          return {
            ...current,
            width: Number(
              Math.max(
                80,
                editableInnerInteraction.startWidth + deltaX
              ).toFixed(3)
            ),
            height: Number(
              Math.max(
                72,
                editableInnerInteraction.startHeight + deltaY
              ).toFixed(3)
            ),
          }
        })
        return
      }

      if (editableInnerInteraction.key === 'subject-title') {
        setSubjectTitleTransform((current) => {
          if (editableInnerInteraction.mode === 'move') {
            return {
              ...current,
              x: Number((editableInnerInteraction.startX + deltaX).toFixed(3)),
              y: Number((editableInnerInteraction.startY + deltaY).toFixed(3)),
            }
          }

          const deltaScale = (deltaX + deltaY) / 260
          return {
            ...current,
            scale: Number(
              clamp(
                editableInnerInteraction.startScale + deltaScale,
                0.7,
                1.45
              ).toFixed(3)
            ),
          }
        })
        return
      }

      if (editableInnerInteraction.key === 'review-title') {
        setReviewTitleTransform((current) => {
          if (editableInnerInteraction.mode === 'move') {
            return {
              ...current,
              x: Number((editableInnerInteraction.startX + deltaX).toFixed(3)),
              y: Number((editableInnerInteraction.startY + deltaY).toFixed(3)),
            }
          }

          const deltaScale = (deltaX + deltaY) / 260
          return {
            ...current,
            scale: Number(
              clamp(
                editableInnerInteraction.startScale + deltaScale,
                0.7,
                1.45
              ).toFixed(3)
            ),
          }
        })
        return
      }

      if (editableInnerInteraction.key === 'path-title') {
        setPathTitleTransform((current) => {
          if (editableInnerInteraction.mode === 'move') {
            return {
              ...current,
              x: Number((editableInnerInteraction.startX + deltaX).toFixed(3)),
              y: Number((editableInnerInteraction.startY + deltaY).toFixed(3)),
            }
          }

          const deltaScale = (deltaX + deltaY) / 260
          return {
            ...current,
            scale: Number(
              clamp(
                editableInnerInteraction.startScale + deltaScale,
                0.7,
                1.45
              ).toFixed(3)
            ),
          }
        })
        return
      }

      if (editableInnerInteraction.key === 'goal-title') {
        setGoalTitleTransform((current) => {
          if (editableInnerInteraction.mode === 'move') {
            return {
              ...current,
              x: Number((editableInnerInteraction.startX + deltaX).toFixed(3)),
              y: Number((editableInnerInteraction.startY + deltaY).toFixed(3)),
            }
          }

          const deltaScale = (deltaX + deltaY) / 260
          return {
            ...current,
            scale: Number(
              clamp(
                editableInnerInteraction.startScale + deltaScale,
                0.7,
                1.45
              ).toFixed(3)
            ),
          }
        })
        return
      }

      if (editableInnerInteraction.key === 'task-title') {
        setTaskTitleTransform((current) => {
          if (editableInnerInteraction.mode === 'move') {
            return {
              ...current,
              x: Number((editableInnerInteraction.startX + deltaX).toFixed(3)),
              y: Number((editableInnerInteraction.startY + deltaY).toFixed(3)),
            }
          }

          const deltaScale = (deltaX + deltaY) / 260
          return {
            ...current,
            scale: Number(
              clamp(
                editableInnerInteraction.startScale + deltaScale,
                0.7,
                1.45
              ).toFixed(3)
            ),
          }
        })
        return
      }

      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      if (editableInnerInteraction.key === 'pie' || editableInnerInteraction.key === 'stats') {
        const panelInteraction = editableInnerInteraction
        const maxWidth = canvas.clientWidth
        const maxHeight = canvas.clientHeight

        setTimeStudyPanelBoxes((current) => {
          const panel = current[panelInteraction.key]
          const minWidth = 112
          const minHeight = 112

          if (panelInteraction.mode === 'move') {
            return {
              ...current,
              [panelInteraction.key]: {
                ...panel,
                x: Number((panelInteraction.startX + deltaX).toFixed(3)),
                y: Number((panelInteraction.startY + deltaY).toFixed(3)),
              },
            }
          }

          return {
            ...current,
            [panelInteraction.key]: {
              ...panel,
              width: Number(
                clamp(
                  panelInteraction.startWidth + deltaX,
                  minWidth,
                  Math.max(minWidth, maxWidth - panel.x)
                ).toFixed(3)
              ),
              height: Number(
                clamp(
                  panelInteraction.startHeight + deltaY,
                  minHeight,
                  Math.max(minHeight, maxHeight - panel.y)
                ).toFixed(3)
              ),
            },
          }
        })
        return
      }

      if (
        editableInnerInteraction.key === 'math' ||
        editableInnerInteraction.key === 'science' ||
        editableInnerInteraction.key === 'english' ||
        editableInnerInteraction.key === 'bonus'
      ) {
        const taskInteraction = editableInnerInteraction as TaskCardInteraction
        const maxWidth = canvas.clientWidth
        const maxHeight = canvas.clientHeight

        setTaskCardBoxes((current) => {
          const card = current[taskInteraction.key]
          const minWidth = 120
          const minHeight = 96

          if (taskInteraction.mode === 'move') {
            return {
              ...current,
              [taskInteraction.key]: {
                ...card,
                x: Number(
                  clamp(
                    taskInteraction.startX + deltaX,
                    0,
                    Math.max(0, maxWidth - card.width)
                  ).toFixed(3)
                ),
                y: Number(
                  clamp(
                    taskInteraction.startY + deltaY,
                    -TASK_CARD_EDIT_HEADER_OFFSET,
                    Math.max(0, maxHeight - card.height)
                  ).toFixed(3)
                ),
              },
            }
          }

          return {
            ...current,
            [taskInteraction.key]: {
              ...card,
              width: Number(
                clamp(
                  taskInteraction.startWidth + deltaX,
                  minWidth,
                  Math.max(minWidth, maxWidth - card.x)
                ).toFixed(3)
              ),
              height: Number(
                clamp(
                  taskInteraction.startHeight + deltaY,
                  minHeight,
                  Math.max(minHeight, maxHeight - card.y)
                ).toFixed(3)
              ),
            },
          }
        })
        return
      }

      const maxWidth = canvas.clientWidth
      const maxHeight = canvas.clientHeight
      const cardInteraction = editableInnerInteraction as SubjectCardInteraction

      setSubjectCardBoxes((current) => {
        const card = current[cardInteraction.key]
        const minWidth = 110
        const minHeight = 70

        if (cardInteraction.mode === 'move') {
          return {
            ...current,
            [cardInteraction.key]: {
              ...card,
              x: Number(
                clamp(
                  cardInteraction.startX + deltaX,
                  0,
                  Math.max(0, maxWidth - card.width)
                ).toFixed(3)
              ),
              y: Number(
                clamp(
                  cardInteraction.startY + deltaY,
                  0,
                  Math.max(0, maxHeight - card.height)
                ).toFixed(3)
              ),
            },
          }
        }

        if (cardInteraction.mode === 'resize-height') {
          return {
            ...current,
            [cardInteraction.key]: {
              ...card,
              height: Number(
                clamp(
                  cardInteraction.startHeight + deltaY,
                  minHeight,
                  Math.max(minHeight, maxHeight - card.y)
                ).toFixed(3)
              ),
            },
          }
        }

        return {
          ...current,
          [cardInteraction.key]: {
            ...card,
            width: Number(
              clamp(
                cardInteraction.startWidth + deltaX,
                minWidth,
                Math.max(minWidth, maxWidth - card.x)
              ).toFixed(3)
            ),
            height: Number(
              clamp(
                cardInteraction.startHeight + deltaY,
                minHeight,
                Math.max(minHeight, maxHeight - card.y)
              ).toFixed(3)
            ),
          },
        }
      })
    }

    const stopInteraction = () => {
      setEditableInnerInteraction(null)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', stopInteraction)
    window.addEventListener('pointercancel', stopInteraction)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', stopInteraction)
      window.removeEventListener('pointercancel', stopInteraction)
    }
  }, [editableInnerInteraction])

  useEffect(() => {
    if (!pathBackgroundInteraction) {
      return
    }

    const handleMove = (event: PointerEvent) => {
      if (
        pathBackgroundInteraction.pointerId !== null &&
        event.pointerId !== pathBackgroundInteraction.pointerId
      ) {
        return
      }

      const deltaY = event.clientY - pathBackgroundInteraction.startClientY

      setPathBackgroundOffset((current) => ({
        ...current,
        y: Number(
          clamp(
            pathBackgroundInteraction.startY + deltaY,
            PATH_BACKGROUND_OFFSET_MIN_Y,
            PATH_BACKGROUND_OFFSET_MAX_Y
          ).toFixed(3)
        ),
      }))
    }

    const stopInteraction = () => {
      setPathBackgroundInteraction(null)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', stopInteraction)
    window.addEventListener('pointercancel', stopInteraction)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', stopInteraction)
      window.removeEventListener('pointercancel', stopInteraction)
    }
  }, [pathBackgroundInteraction])

  useEffect(() => {
    if (!reviewCardInteraction) {
      return
    }

    const handleMove = (event: PointerEvent) => {
      if (
        reviewCardInteraction.pointerId !== null &&
        event.pointerId !== reviewCardInteraction.pointerId
      ) {
        return
      }

      const deltaX = event.clientX - reviewCardInteraction.startClientX
      const deltaY = event.clientY - reviewCardInteraction.startClientY

      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      const maxWidth = canvas.clientWidth
      const maxHeight = canvas.clientHeight

      setReviewCardBoxes((current) => {
        const card = current[reviewCardInteraction.key]
        const minWidth = 110
        const minHeight = 90

        if (reviewCardInteraction.mode === 'move') {
          return {
            ...current,
            [reviewCardInteraction.key]: {
              ...card,
              x: Number(
                clamp(
                  reviewCardInteraction.startX + deltaX,
                  0,
                  Math.max(0, maxWidth - card.width)
                ).toFixed(3)
              ),
              y: Number(
                clamp(
                  reviewCardInteraction.startY + deltaY,
                  0,
                  Math.max(0, maxHeight - card.height)
                ).toFixed(3)
              ),
            },
          }
        }

        return {
          ...current,
          [reviewCardInteraction.key]: {
            ...card,
            width: Number(
              clamp(
                reviewCardInteraction.startWidth + deltaX,
                minWidth,
                Math.max(minWidth, maxWidth - card.x)
              ).toFixed(3)
            ),
            height: Number(
              clamp(
                reviewCardInteraction.startHeight + deltaY,
                minHeight,
                Math.max(minHeight, maxHeight - card.y)
              ).toFixed(3)
            ),
          },
        }
      })
    }

    const stopInteraction = () => {
      setReviewCardInteraction(null)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', stopInteraction)
    window.addEventListener('pointercancel', stopInteraction)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', stopInteraction)
      window.removeEventListener('pointercancel', stopInteraction)
    }
  }, [reviewCardInteraction])

  useEffect(() => {
    if (!interaction) {
      return
    }

    const handleMove = (event: PointerEvent) => {
      if (interaction.pointerId !== null && event.pointerId !== interaction.pointerId) {
        return
      }

      const canvas = canvasRef.current
      if (!canvas) {
        return
      }

      const deltaX = event.clientX - interaction.startClientX
      const deltaY = event.clientY - interaction.startClientY
      const minSize = getShellBoxMinSize(interaction.key)

      setEditableShellBoxes((current) =>
        current.map((box) => {
          if (box.key !== interaction.key) {
            return box
          }

          if (interaction.mode === 'move') {
            const nextX = clamp(
              interaction.startX + deltaX,
              0,
              Math.max(0, interaction.canvasWidth - box.width)
            )
            const nextY = clamp(
              interaction.startY + deltaY,
              0,
              Math.max(0, interaction.canvasHeight - box.height)
            )

            return {
              ...box,
              x: Number(nextX.toFixed(3)),
              y: Number(nextY.toFixed(3)),
            }
          }

          const nextWidth = clamp(
            interaction.startWidth + deltaX,
            minSize.width,
            Math.max(minSize.width, interaction.canvasWidth - interaction.startX)
          )
          const nextHeight = clamp(
            interaction.startHeight + deltaY,
            minSize.height,
            Math.max(minSize.height, interaction.canvasHeight - interaction.startY)
          )

          return {
            ...box,
            width: Number(nextWidth.toFixed(3)),
            height: Number(nextHeight.toFixed(3)),
          }
        })
      )
    }

    const stopInteraction = () => {
      setInteraction(null)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', stopInteraction)
    window.addEventListener('pointercancel', stopInteraction)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', stopInteraction)
      window.removeEventListener('pointercancel', stopInteraction)
    }
  }, [interaction])

  useEffect(() => {
    if (!heroArtInteraction) {
      return
    }

    const handleMove = (event: PointerEvent) => {
      if (
        heroArtInteraction.pointerId !== null &&
        event.pointerId !== heroArtInteraction.pointerId
      ) {
        return
      }

      const deltaX = event.clientX - heroArtInteraction.startClientX
      const deltaY = event.clientY - heroArtInteraction.startClientY

      setHeroArtFrame((current) => {
        if (heroArtInteraction.mode === 'move') {
          return {
            ...current,
            x: Number((heroArtInteraction.startX + deltaX).toFixed(3)),
            y: Number((heroArtInteraction.startY + deltaY).toFixed(3)),
          }
        }

        const nextWidth = Math.max(
          HERO_ART_MIN_WIDTH,
          heroArtInteraction.startWidth + deltaX
        )
        const nextHeight = Math.max(
          HERO_ART_MIN_HEIGHT,
          heroArtInteraction.startHeight + deltaY
        )

        return {
          ...current,
          width: Number(nextWidth.toFixed(3)),
          height: Number(nextHeight.toFixed(3)),
        }
      })
    }

    const stopInteraction = () => {
      setHeroArtInteraction(null)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', stopInteraction)
    window.addEventListener('pointercancel', stopInteraction)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', stopInteraction)
      window.removeEventListener('pointercancel', stopInteraction)
    }
  }, [heroArtInteraction])

  useEffect(() => {
    if (!heroCtaInteraction) {
      return
    }

    const handleMove = (event: PointerEvent) => {
      if (
        heroCtaInteraction.pointerId !== null &&
        event.pointerId !== heroCtaInteraction.pointerId
      ) {
        return
      }

      const deltaX = event.clientX - heroCtaInteraction.startClientX
      const deltaY = event.clientY - heroCtaInteraction.startClientY

      setHeroCtaOffset({
        x: Number((heroCtaInteraction.startX + deltaX).toFixed(3)),
        y: Number((heroCtaInteraction.startY + deltaY).toFixed(3)),
      })
    }

    const stopInteraction = () => {
      setHeroCtaInteraction(null)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', stopInteraction)
    window.addEventListener('pointercancel', stopInteraction)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', stopInteraction)
      window.removeEventListener('pointercancel', stopInteraction)
    }
  }, [heroCtaInteraction])

  useEffect(() => {
    if (!profileAvatarInteraction) {
      return
    }

    const handleMove = (event: PointerEvent) => {
      if (
        profileAvatarInteraction.pointerId !== null &&
        event.pointerId !== profileAvatarInteraction.pointerId
      ) {
        return
      }

      const deltaX = event.clientX - profileAvatarInteraction.startClientX
      const deltaY = event.clientY - profileAvatarInteraction.startClientY

      setProfileAvatarTransform((current) => {
        if (profileAvatarInteraction.mode === 'move') {
          return {
            ...current,
            x: Number((profileAvatarInteraction.startX + deltaX).toFixed(3)),
            y: Number((profileAvatarInteraction.startY + deltaY).toFixed(3)),
          }
        }

        const dominantDelta = deltaX + deltaY
        const nextScale = clamp(
          profileAvatarInteraction.startScale + dominantDelta / 180,
          PROFILE_AVATAR_SCALE_MIN,
          PROFILE_AVATAR_SCALE_MAX
        )

        return {
          ...current,
          scale: Number(nextScale.toFixed(3)),
        }
      })
    }

    const stopInteraction = () => {
      setProfileAvatarInteraction(null)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', stopInteraction)
    window.addEventListener('pointercancel', stopInteraction)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', stopInteraction)
      window.removeEventListener('pointercancel', stopInteraction)
    }
  }, [profileAvatarInteraction])

  useEffect(() => {
    if (!profileSectionInteraction) {
      return
    }

    const handleMove = (event: PointerEvent) => {
      if (
        profileSectionInteraction.pointerId !== null &&
        event.pointerId !== profileSectionInteraction.pointerId
      ) {
        return
      }

      const deltaX = event.clientX - profileSectionInteraction.startClientX
      const deltaY = event.clientY - profileSectionInteraction.startClientY

      setProfileSectionBoxes((current) => ({
        ...current,
        [profileSectionInteraction.key]: {
          x:
            profileSectionInteraction.mode === 'move'
              ? Number((profileSectionInteraction.startX + deltaX).toFixed(3))
              : profileSectionInteraction.startX,
          y:
            profileSectionInteraction.mode === 'move'
              ? Number((profileSectionInteraction.startY + deltaY).toFixed(3))
              : profileSectionInteraction.startY,
          width:
            profileSectionInteraction.mode === 'resize'
              ? Number(Math.max(44, profileSectionInteraction.startWidth + deltaX).toFixed(3))
              : current[profileSectionInteraction.key].width,
          height:
            profileSectionInteraction.mode === 'resize'
              ? Number(Math.max(44, profileSectionInteraction.startHeight + deltaY).toFixed(3))
              : current[profileSectionInteraction.key].height,
        },
      }))
    }

    const stopInteraction = () => {
      setProfileSectionInteraction(null)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', stopInteraction)
    window.addEventListener('pointercancel', stopInteraction)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', stopInteraction)
      window.removeEventListener('pointercancel', stopInteraction)
    }
  }, [profileSectionInteraction])

  useEffect(() => {
    if (!shellOnly || !layoutEditMode) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (profileAvatarEditMode && selectedShellKey === 'profile') {
        const step = event.shiftKey ? 10 : 1
        const scaleStep = event.shiftKey ? 0.05 : 0.01
        let handledProfileAvatar = true

        switch (event.key) {
          case 'ArrowLeft':
            if (event.altKey || event.metaKey || event.ctrlKey) {
              setProfileAvatarTransform((current) => ({
                ...current,
                scale: Number(
                  clamp(
                    current.scale - scaleStep,
                    PROFILE_AVATAR_SCALE_MIN,
                    PROFILE_AVATAR_SCALE_MAX
                  ).toFixed(3)
                ),
              }))
            } else {
              setProfileAvatarTransform((current) => ({
                ...current,
                x: Number((current.x - step).toFixed(3)),
              }))
            }
            break
          case 'ArrowRight':
            if (event.altKey || event.metaKey || event.ctrlKey) {
              setProfileAvatarTransform((current) => ({
                ...current,
                scale: Number(
                  clamp(
                    current.scale + scaleStep,
                    PROFILE_AVATAR_SCALE_MIN,
                    PROFILE_AVATAR_SCALE_MAX
                  ).toFixed(3)
                ),
              }))
            } else {
              setProfileAvatarTransform((current) => ({
                ...current,
                x: Number((current.x + step).toFixed(3)),
              }))
            }
            break
          case 'ArrowUp':
            setProfileAvatarTransform((current) => ({
              ...current,
              y: Number((current.y - step).toFixed(3)),
            }))
            break
          case 'ArrowDown':
            setProfileAvatarTransform((current) => ({
              ...current,
              y: Number((current.y + step).toFixed(3)),
            }))
            break
          default:
            handledProfileAvatar = false
        }

        if (handledProfileAvatar) {
          event.preventDefault()
          return
        }
      }

      if (heroCtaEditMode && selectedShellKey === 'hero') {
        const step = event.shiftKey ? 10 : 1
        let handledHeroCta = true

        switch (event.key) {
          case 'ArrowLeft':
            setHeroCtaOffset((current) => ({
              ...current,
              x: Number((current.x - step).toFixed(3)),
            }))
            break
          case 'ArrowRight':
            setHeroCtaOffset((current) => ({
              ...current,
              x: Number((current.x + step).toFixed(3)),
            }))
            break
          case 'ArrowUp':
            setHeroCtaOffset((current) => ({
              ...current,
              y: Number((current.y - step).toFixed(3)),
            }))
            break
          case 'ArrowDown':
            setHeroCtaOffset((current) => ({
              ...current,
              y: Number((current.y + step).toFixed(3)),
            }))
            break
          default:
            handledHeroCta = false
        }

        if (handledHeroCta) {
          event.preventDefault()
          return
        }
      }

      if (heroArtEditMode && selectedShellKey === 'hero') {
        const step = event.shiftKey ? 10 : 1
        let handledHeroArt = true

        switch (event.key) {
          case 'ArrowLeft':
            if (event.altKey || event.metaKey || event.ctrlKey) {
              setHeroArtFrame((current) => ({
                ...current,
                width: Number(Math.max(HERO_ART_MIN_WIDTH, current.width - step).toFixed(3)),
              }))
            } else {
              setHeroArtFrame((current) => ({
                ...current,
                x: Number((current.x - step).toFixed(3)),
              }))
            }
            break
          case 'ArrowRight':
            if (event.altKey || event.metaKey || event.ctrlKey) {
              setHeroArtFrame((current) => ({
                ...current,
                width: Number((current.width + step).toFixed(3)),
              }))
            } else {
              setHeroArtFrame((current) => ({
                ...current,
                x: Number((current.x + step).toFixed(3)),
              }))
            }
            break
          case 'ArrowUp':
            if (event.altKey || event.metaKey || event.ctrlKey) {
              setHeroArtFrame((current) => ({
                ...current,
                height: Number(Math.max(HERO_ART_MIN_HEIGHT, current.height - step).toFixed(3)),
              }))
            } else {
              setHeroArtFrame((current) => ({
                ...current,
                y: Number((current.y - step).toFixed(3)),
              }))
            }
            break
          case 'ArrowDown':
            if (event.altKey || event.metaKey || event.ctrlKey) {
              setHeroArtFrame((current) => ({
                ...current,
                height: Number((current.height + step).toFixed(3)),
              }))
            } else {
              setHeroArtFrame((current) => ({
                ...current,
                y: Number((current.y + step).toFixed(3)),
              }))
            }
            break
          default:
            handledHeroArt = false
        }

        if (handledHeroArt) {
          event.preventDefault()
          return
        }
      }

      if (streakCampfireEditMode && selectedShellKey === 'streak') {
        const step = event.shiftKey ? 10 : 1
        let handledStreakCampfire = true

        switch (event.key) {
          case 'ArrowLeft':
            if (event.altKey || event.metaKey || event.ctrlKey) {
              setStreakCampfireFrame((current) => ({
                ...current,
                width: Number(Math.max(80, current.width - step).toFixed(3)),
              }))
            } else {
              setStreakCampfireFrame((current) => ({
                ...current,
                x: Number((current.x - step).toFixed(3)),
              }))
            }
            break
          case 'ArrowRight':
            if (event.altKey || event.metaKey || event.ctrlKey) {
              setStreakCampfireFrame((current) => ({
                ...current,
                width: Number((current.width + step).toFixed(3)),
              }))
            } else {
              setStreakCampfireFrame((current) => ({
                ...current,
                x: Number((current.x + step).toFixed(3)),
              }))
            }
            break
          case 'ArrowUp':
            if (event.altKey || event.metaKey || event.ctrlKey) {
              setStreakCampfireFrame((current) => ({
                ...current,
                height: Number(Math.max(72, current.height - step).toFixed(3)),
              }))
            } else {
              setStreakCampfireFrame((current) => ({
                ...current,
                y: Number((current.y - step).toFixed(3)),
              }))
            }
            break
          case 'ArrowDown':
            if (event.altKey || event.metaKey || event.ctrlKey) {
              setStreakCampfireFrame((current) => ({
                ...current,
                height: Number((current.height + step).toFixed(3)),
              }))
            } else {
              setStreakCampfireFrame((current) => ({
                ...current,
                y: Number((current.y + step).toFixed(3)),
              }))
            }
            break
          default:
            handledStreakCampfire = false
        }

        if (handledStreakCampfire) {
          event.preventDefault()
          return
        }
      }

      if (!selectedShellKey) {
        return
      }

      const step = event.shiftKey ? 10 : 1
      let dx = 0
      let dy = 0
      let dw = 0
      let dh = 0
      const resizeMode = event.altKey || event.metaKey || event.ctrlKey

      switch (event.key) {
        case 'ArrowLeft':
          if (resizeMode) {
            dw = -step
          } else {
            dx = -step
          }
          break
        case 'ArrowRight':
          if (resizeMode) {
            dw = step
          } else {
            dx = step
          }
          break
        case 'ArrowUp':
          if (resizeMode) {
            dh = -step
          } else {
            dy = -step
          }
          break
        case 'ArrowDown':
          if (resizeMode) {
            dh = step
          } else {
            dy = step
          }
          break
        case '[':
          setShellCornerRadius((current) => clamp(current - step, 16, 40))
          setSaveToast(`圆角 ${Math.max(16, shellCornerRadius - step)}px`)
          event.preventDefault()
          return
        case ']':
          setShellCornerRadius((current) => clamp(current + step, 16, 40))
          setSaveToast(`圆角 ${Math.min(40, shellCornerRadius + step)}px`)
          event.preventDefault()
          return
        default:
          return
      }

      event.preventDefault()
      const canvasWidth = canvasRef.current?.clientWidth ?? 0
      const canvasHeight = canvasRef.current?.clientHeight ?? 0

      setEditableShellBoxes((current) =>
        current.map((box) => {
          if (box.key !== selectedShellKey) {
            return box
          }

          const minSize = getShellBoxMinSize(box.key)
          if (resizeMode) {
            const nextWidth = clamp(
              box.width + dw,
              minSize.width,
              Math.max(minSize.width, canvasWidth - box.x)
            )
            const nextHeight = clamp(
              box.height + dh,
              minSize.height,
              Math.max(minSize.height, canvasHeight - box.y)
            )

            return updateShellBox(box, {
              width: Number(nextWidth.toFixed(3)),
              height: Number(nextHeight.toFixed(3)),
            })
          }

          const nextX = clamp(box.x + dx, 0, Math.max(0, canvasWidth - box.width))
          const nextY = clamp(box.y + dy, 0, Math.max(0, canvasHeight - box.height))

          return updateShellBox(box, {
            x: Number(nextX.toFixed(3)),
            y: Number(nextY.toFixed(3)),
          })
        })
      )
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    heroArtEditMode,
    heroCtaEditMode,
    layoutEditMode,
    profileAvatarEditMode,
    selectedShellKey,
    shellCornerRadius,
    shellOnly,
    streakCampfireEditMode,
  ])

  useEffect(() => {
    if (!saveToast) {
      return
    }

    const timer = window.setTimeout(() => {
      setSaveToast(null)
    }, 1800)

    return () => {
      window.clearTimeout(timer)
    }
  }, [saveToast])

  const renderedShellBoxes = layoutEditMode
    ? editableShellBoxes
    : applyContentPresetsToShellBoxes(shellOnlyBoxes, {
        hero: heroLayoutPreset,
        profile: profileLayoutPreset,
        calendar: calendarLayoutPreset,
        path: pathLayoutPreset,
        time: timeLayoutPreset,
        subject: subjectLayoutPreset,
        streak: streakLayoutPreset,
        goal: goalLayoutPreset,
        review: reviewLayoutPreset,
      })
  const currentHeroShellBox = editableShellBoxes.find((box) => box.key === 'hero')
  const currentHeroPreset = normalizeDashboardHeroLayoutPreset({
    shell: {
      width: currentHeroShellBox?.width ?? heroLayoutPreset.shell.width,
      height: currentHeroShellBox?.height ?? heroLayoutPreset.shell.height,
    },
    contentMaxWidth: heroContentMaxWidth,
    artFrame: heroArtFrame,
    ctaOffset: heroCtaOffset,
  })
  const currentTaskPreset = normalizeDashboardTaskLayoutPreset({
    titleTransform: taskTitleTransform,
    taskCardBoxes,
  })
  const currentProfileShellBox = editableShellBoxes.find((box) => box.key === 'profile')
  const currentProfilePreset = normalizeDashboardProfileLayoutPreset({
    shell: {
      width: currentProfileShellBox?.width ?? profileLayoutPreset.shell.width,
      height: currentProfileShellBox?.height ?? profileLayoutPreset.shell.height,
    },
    sectionBoxes: profileSectionBoxes,
  })
  const currentCalendarShellBox = editableShellBoxes.find((box) => box.key === 'calendar')
  const currentCalendarPreset = normalizeDashboardCalendarLayoutPreset({
    shell: {
      width: currentCalendarShellBox?.width ?? calendarLayoutPreset.shell.width,
      height: currentCalendarShellBox?.height ?? calendarLayoutPreset.shell.height,
    },
    titleTransform: calendarTitleTransform,
    contentTransform: calendarContentTransform,
  })
  const currentPathShellBox = editableShellBoxes.find((box) => box.key === 'path')
  const currentPathPreset = normalizeDashboardPathLayoutPreset({
    shell: {
      width: currentPathShellBox?.width ?? pathLayoutPreset.shell.width,
      height: currentPathShellBox?.height ?? pathLayoutPreset.shell.height,
    },
    titleTransform: pathTitleTransform,
    backgroundOffset: pathBackgroundOffset,
  })
  const currentStreakShellBox = editableShellBoxes.find((box) => box.key === 'streak')
  const currentStreakPreset = normalizeDashboardStreakLayoutPreset({
    shell: {
      width: currentStreakShellBox?.width ?? streakLayoutPreset.shell.width,
      height: currentStreakShellBox?.height ?? streakLayoutPreset.shell.height,
    },
    titleTransform: streakTitleTransform,
    campfireFrame: streakCampfireFrame,
  })
  const currentGoalShellBox = editableShellBoxes.find((box) => box.key === 'goal')
  const currentGoalPreset = normalizeDashboardGoalLayoutPreset({
    shell: {
      width: currentGoalShellBox?.width ?? goalLayoutPreset.shell.width,
      height: currentGoalShellBox?.height ?? goalLayoutPreset.shell.height,
    },
    titleTransform: goalTitleTransform,
    summaryOffset: goalSummaryOffset,
    trophyFrame: goalTrophyFrame,
  })
  const currentTimeShellBox = editableShellBoxes.find((box) => box.key === 'time')
  const currentTimePreset = normalizeDashboardTimeLayoutPreset({
    shell: {
      width: currentTimeShellBox?.width ?? timeLayoutPreset.shell.width,
      height: currentTimeShellBox?.height ?? timeLayoutPreset.shell.height,
    },
    titleTransform: timeTitleTransform,
    panelBoxes: timeStudyPanelBoxes,
  })
  const currentSubjectShellBox = editableShellBoxes.find((box) => box.key === 'subject')
  const currentSubjectPreset = normalizeDashboardSubjectLayoutPreset({
    shell: {
      width: currentSubjectShellBox?.width ?? subjectLayoutPreset.shell.width,
      height: currentSubjectShellBox?.height ?? subjectLayoutPreset.shell.height,
    },
    titleTransform: subjectTitleTransform,
    cardBoxes: subjectCardBoxes,
  })
  const currentReviewShellBox = editableShellBoxes.find((box) => box.key === 'review')
  const currentReviewPreset = normalizeDashboardReviewLayoutPreset({
    shell: {
      width: currentReviewShellBox?.width ?? reviewLayoutPreset.shell.width,
      height: currentReviewShellBox?.height ?? reviewLayoutPreset.shell.height,
    },
    titleTransform: reviewTitleTransform,
    cardBoxes: reviewCardBoxes,
  })
  const shellGapGuides = layoutEditMode ? buildShellGapGuides(renderedShellBoxes) : []
  const resolvedSubjectCardBoxes = layoutEditMode
    ? useFrozenLayoutSnapshot
      ? subjectCardBoxes
      : snapSubjectCardBoxesToGrid(subjectCardBoxes)
    : subjectCardBoxes

  function startShellInteractionAtPoint(
    box: ShellBox,
    mode: ShellInteractionMode,
    clientX: number,
    clientY: number,
    source: ShellInteractionSource = { pointerId: null }
  ) {
    if (!layoutEditMode) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    setSelectedShellKey(box.key)

    if (source.pointerId !== null && source.currentTarget) {
      try {
        source.currentTarget.setPointerCapture(source.pointerId)
      } catch {
        // Pointer capture is a best-effort enhancement.
      }
    }

    setInteraction({
      key: box.key,
      mode,
      pointerId: source.pointerId,
      startClientX: clientX,
      startClientY: clientY,
      startX: box.x,
      startY: box.y,
      startWidth: box.width,
      startHeight: box.height,
      canvasWidth: rect.width,
      canvasHeight: rect.height,
    })
  }

  function startShellInteraction(
    box: ShellBox,
    mode: ShellInteractionMode,
    event: React.PointerEvent<HTMLElement>
  ) {
    event.preventDefault()
    event.stopPropagation()
    startShellInteractionAtPoint(box, mode, event.clientX, event.clientY, {
      pointerId: event.pointerId,
      currentTarget: event.currentTarget,
    })
  }

  function startShellInteractionFromMouse(
    box: ShellBox,
    mode: ShellInteractionMode,
    event: React.MouseEvent<HTMLElement>
  ) {
    event.preventDefault()
    event.stopPropagation()
    startShellInteractionAtPoint(box, mode, event.clientX, event.clientY)
  }

  function startShellInteractionFromTouch(
    box: ShellBox,
    mode: ShellInteractionMode,
    event: React.TouchEvent<HTMLElement>
  ) {
    const touch = event.touches[0] ?? event.changedTouches[0]
    if (!touch) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    startShellInteractionAtPoint(box, mode, touch.clientX, touch.clientY)
  }

  async function copyShellLayout() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(renderedShellBoxes, null, 2)
      )
      setSaveToast('布局 JSON 已复制')
    } catch {
      setSaveToast('复制失败，请在控制台手动导出')
    }
  }

  function resetShellLayout() {
    setEditableShellBoxes(
      applyContentPresetsToShellBoxes(cloneShellBoxes(), {
        hero: heroLayoutPreset,
        profile: profileLayoutPreset,
        calendar: calendarLayoutPreset,
        path: pathLayoutPreset,
        time: timeLayoutPreset,
        subject: subjectLayoutPreset,
        streak: streakLayoutPreset,
        goal: goalLayoutPreset,
        review: reviewLayoutPreset,
      })
    )
    setShellCornerRadius(28)
    setHeroArtFrame(resolvedDefaultHeroArtFrame)
    setHeroCtaOffset(resolvedDefaultHeroCtaOffset)
    setHeroContentMaxWidth(heroLayoutPreset.contentMaxWidth)
    setProfileSectionBoxes(profileLayoutPreset.sectionBoxes)
    setCalendarTitleTransform(calendarLayoutPreset.titleTransform)
    setCalendarContentTransform(calendarLayoutPreset.contentTransform)
    setStreakTitleTransform(streakLayoutPreset.titleTransform)
    setStreakCampfireFrame(streakLayoutPreset.campfireFrame)
    setTimeTitleTransform(timeLayoutPreset.titleTransform)
    setTimeStudyPanelBoxes(timeLayoutPreset.panelBoxes)
    setTaskTitleTransform(taskLayoutPreset.titleTransform)
    setTaskCardBoxes(taskLayoutPreset.taskCardBoxes)
    setReviewTitleTransform(reviewLayoutPreset.titleTransform)
    setPathTitleTransform(pathLayoutPreset.titleTransform)
    setPathBackgroundOffset(pathLayoutPreset.backgroundOffset)
    setGoalTitleTransform(goalLayoutPreset.titleTransform)
    setGoalSummaryOffset(goalLayoutPreset.summaryOffset)
    setGoalTrophyFrame(goalLayoutPreset.trophyFrame)
    setSubjectTitleTransform(subjectLayoutPreset.titleTransform)
    setSubjectCardBoxes(subjectLayoutPreset.cardBoxes)
    setReviewCardBoxes(reviewLayoutPreset.cardBoxes)
    setSubjectCardGridSnapApplied(false)
    try {
      window.localStorage.removeItem(SHELL_LAYOUT_STORAGE_KEY)
      window.localStorage.removeItem(`${SHELL_LAYOUT_STORAGE_KEY}:radius`)
      window.localStorage.removeItem(STREAK_TITLE_STORAGE_KEY)
      window.localStorage.removeItem(STREAK_CAMPFIRE_FRAME_STORAGE_KEY)
      window.localStorage.removeItem(TASK_TITLE_STORAGE_KEY)
      window.localStorage.removeItem(TASK_CARD_LAYOUT_STORAGE_KEY)
      window.localStorage.removeItem(REVIEW_TITLE_STORAGE_KEY)
      window.localStorage.removeItem(PATH_TITLE_STORAGE_KEY)
      window.localStorage.removeItem(PATH_BACKGROUND_OFFSET_STORAGE_KEY)
      window.localStorage.removeItem(SUBJECT_CARD_LAYOUT_STORAGE_KEY)
      window.localStorage.removeItem(SUBJECT_CARD_GRID_SNAP_STORAGE_KEY)
    } catch {
      // Ignore storage failures.
    }
    setSaveToast('已恢复基线布局')
  }

  function resetHeroArtTransform() {
    setHeroArtFrame(resolvedDefaultHeroArtFrame)
    try {
      window.localStorage.removeItem(HERO_ART_FRAME_STORAGE_KEY)
    } catch {
      // Ignore storage failures.
    }
    setSaveToast('hero 插画已恢复默认参数')
  }

  function resetHeroCtaOffset() {
    setHeroCtaOffset(resolvedDefaultHeroCtaOffset)
    try {
      window.localStorage.removeItem(HERO_CTA_OFFSET_STORAGE_KEY)
    } catch {
      // Ignore storage failures.
    }
    setSaveToast('hero 按钮位置已恢复默认参数')
  }

  function resetProfileAvatarTransform() {
    setProfileAvatarTransform(defaultProfileAvatarTransform)
    try {
      window.localStorage.removeItem(PROFILE_AVATAR_TRANSFORM_STORAGE_KEY)
    } catch {
      // Ignore storage failures.
    }
    setSaveToast('profile 头像已恢复默认参数')
  }

  function resetProfileSectionOffsets() {
    setProfileSectionBoxes(defaultProfileSectionBoxes)
    try {
      window.localStorage.removeItem(PROFILE_LAYOUT_STORAGE_KEY)
    } catch {
      // Ignore storage failures.
    }
    setSaveToast('profile 内容块已恢复默认位置')
  }

  function resetReviewCardBoxes() {
    setReviewCardBoxes(defaultReviewCardBoxes)
    try {
      window.localStorage.removeItem(REVIEW_CARD_LAYOUT_STORAGE_KEY)
    } catch {
      // Ignore storage failures.
    }
    setSaveToast('最近练习回顾已恢复默认布局')
  }

  function startProfileAvatarInteraction(
    mode: ProfileAvatarInteractionMode,
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (!layoutEditMode || !profileAvatarEditMode) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedShellKey('profile')

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is a best-effort enhancement.
    }

    setProfileAvatarInteraction({
      mode,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: profileAvatarTransform.x,
      startY: profileAvatarTransform.y,
      startScale: profileAvatarTransform.scale,
    })
  }

  function startProfileSectionInteraction(
    key: ProfileSectionKey,
    mode: ProfileSectionInteractionMode,
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (!layoutEditMode) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedShellKey('profile')

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is a best-effort enhancement.
    }

    setProfileSectionInteraction({
      key,
      mode,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: profileSectionBoxes[key].x,
      startY: profileSectionBoxes[key].y,
      startWidth: profileSectionBoxes[key].width,
      startHeight: profileSectionBoxes[key].height,
    })
  }

  function resetStreakCampfireFrame() {
    setStreakCampfireFrame(defaultStreakCampfireFrame)
    try {
      window.localStorage.removeItem(STREAK_CAMPFIRE_FRAME_STORAGE_KEY)
    } catch {
      // Ignore storage failures.
    }
    setSaveToast('连续性火堆已恢复默认参数')
  }

  function startStreakCampfireInteraction(
    mode: HeroArtInteractionMode,
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (!layoutEditMode || !streakCampfireEditMode) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedShellKey('streak')

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is a best-effort enhancement.
    }

    setEditableInnerInteraction({
      key: 'streak-campfire',
      mode,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: streakCampfireFrame.x,
      startY: streakCampfireFrame.y,
      startWidth: streakCampfireFrame.width,
      startHeight: streakCampfireFrame.height,
    })
  }

  function startReviewCardInteraction(
    key: ReviewCardKey,
    mode: ReviewCardInteractionMode,
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (!layoutEditMode) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedShellKey('review')

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is a best-effort enhancement.
    }

    setReviewCardInteraction({
      key,
      mode,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: reviewCardBoxes[key].x,
      startY: reviewCardBoxes[key].y,
      startWidth: reviewCardBoxes[key].width,
      startHeight: reviewCardBoxes[key].height,
    })
  }

  function startEditableTitleInteraction(
    key: EditableTitleKey,
    mode: EditableTitleInteractionMode,
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (!layoutEditMode) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedShellKey(null)

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is a best-effort enhancement.
    }

    const current =
      key === 'streak-title'
        ? streakTitleTransform
        : key === 'time-title'
        ? timeTitleTransform
        : key === 'task-title'
        ? taskTitleTransform
        : key === 'subject-title'
          ? subjectTitleTransform
          : key === 'review-title'
            ? reviewTitleTransform
            : key === 'goal-title'
              ? goalTitleTransform
            : pathTitleTransform

    setEditableInnerInteraction({
      key,
      mode,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: current.x,
      startY: current.y,
      startScale: current.scale,
    })
  }

  function startPathBackgroundInteraction(event: React.PointerEvent<HTMLButtonElement>) {
    if (!layoutEditMode) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedShellKey('path')

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is a best-effort enhancement.
    }

    setPathBackgroundInteraction({
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startY: pathBackgroundOffset.y,
    })
  }

  function startTimeStudyPanelInteraction(
    key: TimeStudyPanelKey,
    mode: TimeStudyPanelInteractionMode,
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (!layoutEditMode) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedShellKey('time')

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is a best-effort enhancement.
    }

    const current = timeStudyPanelBoxes[key]

    setEditableInnerInteraction({
      key,
      mode,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: current.x,
      startY: current.y,
      startWidth: current.width,
      startHeight: current.height,
    })
  }

  function startSubjectCardInteraction(
    key: SubjectCardKey,
    mode: SubjectCardInteractionMode,
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (!layoutEditMode) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedShellKey(null)

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is a best-effort enhancement.
    }

    const current = subjectCardBoxes[key]

    setEditableInnerInteraction({
      key,
      mode,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: current.x,
      startY: current.y,
      startWidth: current.width,
      startHeight: current.height,
    })
  }

  function startTaskCardInteraction(
    key: TaskCardKey,
    mode: TaskCardInteractionMode,
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (!layoutEditMode) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedShellKey('task')

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is a best-effort enhancement.
    }

    const current = taskCardBoxes[key]

    setEditableInnerInteraction({
      key,
      mode,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: current.x,
      startY: current.y,
      startWidth: current.width,
      startHeight: current.height,
    })
  }

  async function savePageSnapshot() {
    try {
      setSavingPageSnapshot(true)

      const response = await fetch('/api/dashboard-preview/freeze-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shellBoxes: renderedShellBoxes,
          shellCornerRadius,
          heroArtFrame,
          heroCtaOffset,
          calendarTitleTransform,
          calendarContentTransform,
          profileAvatarTransform,
          profileSectionBoxes,
          streakTitleTransform,
          streakCampfireFrame,
          pathBackgroundOffset,
          goalTitleTransform,
          goalSummaryOffset,
          goalTrophyFrame,
          timeStudyPanelBoxes,
          taskTitleTransform,
          taskCardBoxes,
          reviewCardBoxes,
          timeTitleTransform,
          subjectTitleTransform,
          reviewTitleTransform,
          pathTitleTransform,
          subjectCardBoxes: resolvedSubjectCardBoxes,
          baseline: {
            shellBoxes: applyContentPresetsToShellBoxes(shellOnlyBoxes, {
              hero: heroLayoutPreset,
              profile: profileLayoutPreset,
              calendar: calendarLayoutPreset,
              path: pathLayoutPreset,
              time: timeLayoutPreset,
              subject: subjectLayoutPreset,
              streak: streakLayoutPreset,
              goal: goalLayoutPreset,
              review: reviewLayoutPreset,
            }),
            shellCornerRadius: 28,
            heroArtFrame: resolvedDefaultHeroArtFrame,
            heroCtaOffset: resolvedDefaultHeroCtaOffset,
            profileAvatarTransform: defaultProfileAvatarTransform,
            profileSectionBoxes: profileLayoutPreset.sectionBoxes,
            calendarTitleTransform: calendarLayoutPreset.titleTransform,
            calendarContentTransform: calendarLayoutPreset.contentTransform,
            streakTitleTransform: streakLayoutPreset.titleTransform,
            streakCampfireFrame: streakLayoutPreset.campfireFrame,
            pathBackgroundOffset: pathLayoutPreset.backgroundOffset,
            goalTitleTransform: goalLayoutPreset.titleTransform,
            goalSummaryOffset: goalLayoutPreset.summaryOffset,
            goalTrophyFrame: goalLayoutPreset.trophyFrame,
            timeStudyPanelBoxes: timeLayoutPreset.panelBoxes,
            taskTitleTransform: taskLayoutPreset.titleTransform,
            taskCardBoxes: taskLayoutPreset.taskCardBoxes,
            reviewCardBoxes: reviewLayoutPreset.cardBoxes,
            timeTitleTransform: timeLayoutPreset.titleTransform,
            subjectTitleTransform: subjectLayoutPreset.titleTransform,
            reviewTitleTransform: reviewLayoutPreset.titleTransform,
            pathTitleTransform: pathLayoutPreset.titleTransform,
            subjectCardBoxes: subjectLayoutPreset.cardBoxes,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('保存失败')
      }

      const result = (await response.json().catch(() => null)) as
        | { savedSections?: string[] }
        | null
      const savedSections = result?.savedSections ?? []
      const sectionLabels = new Map<string, string>([
        ['shell', '壳层'],
        ['hero', 'hero'],
        ['profile', 'profile'],
        ['streak', '连续性'],
        ['path', '学习路径'],
        ['review', '最近练习回顾'],
        ['time', '学习时长'],
        ['task', '今日任务'],
        ['subject', '科目进度'],
      ])
      const labelText = savedSections
        .map((key) => sectionLabels.get(key) ?? key)
        .join('、')
      setSaveToast(
        labelText
          ? `页面快照已保存：${labelText}`
          : '页面快照已保存到 artifacts'
      )
    } catch {
      setSaveToast('页面快照保存失败')
    } finally {
      setSavingPageSnapshot(false)
    }
  }

  async function saveHeroLayoutPreset() {
    const heroShellBox = editableShellBoxes.find((box) => box.key === 'hero')
    if (!heroShellBox) {
      return
    }

    try {
      setSavingHeroPreset(true)
      const nextPreset = normalizeDashboardHeroLayoutPreset({
        shell: {
          width: heroShellBox.width,
          height: heroShellBox.height,
        },
        contentMaxWidth: heroContentMaxWidth,
        artFrame: heroArtFrame,
        ctaOffset: heroCtaOffset,
      })

      const response = await fetch('/api/dashboard-preview/hero-layout-preset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextPreset),
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }

      setSaveToast('Hero preset 已保存，刷新 dashboard 即可看到同步结果')
    } catch (error) {
      setSaveToast(
        error instanceof Error ? error.message : 'Hero preset 保存失败'
      )
    } finally {
      setSavingHeroPreset(false)
    }
  }

  async function saveTaskLayoutPreset() {
    try {
      setSavingTaskPreset(true)
      const nextPreset = normalizeDashboardTaskLayoutPreset({
        titleTransform: taskTitleTransform,
        taskCardBoxes,
      })

      const response = await fetch('/api/dashboard-preview/task-layout-preset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextPreset),
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }

      setSaveToast('Task preset 已保存，刷新 dashboard 即可看到同步结果')
    } catch (error) {
      setSaveToast(
        error instanceof Error ? error.message : 'Task preset 保存失败'
      )
    } finally {
      setSavingTaskPreset(false)
    }
  }

  async function savePathLayoutPreset() {
    try {
      setSavingPathPreset(true)
      const nextPreset = normalizeDashboardPathLayoutPreset({
        shell: currentPathPreset.shell,
        titleTransform: pathTitleTransform,
        backgroundOffset: pathBackgroundOffset,
      })

      const response = await fetch('/api/dashboard-preview/path-layout-preset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextPreset),
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }

      setSaveToast('Path preset 已保存，刷新 dashboard 即可看到同步结果')
    } catch (error) {
      setSaveToast(
        error instanceof Error ? error.message : 'Path preset 保存失败'
      )
    } finally {
      setSavingPathPreset(false)
    }
  }

  async function saveStreakLayoutPreset() {
    try {
      setSavingStreakPreset(true)
      const nextPreset = normalizeDashboardStreakLayoutPreset({
        shell: currentStreakPreset.shell,
        titleTransform: streakTitleTransform,
        campfireFrame: streakCampfireFrame,
      })

      const response = await fetch('/api/dashboard-preview/streak-layout-preset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextPreset),
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }

      setSaveToast('Streak preset 已保存，刷新 dashboard 即可看到同步结果')
    } catch (error) {
      setSaveToast(
        error instanceof Error ? error.message : 'Streak preset 保存失败'
      )
    } finally {
      setSavingStreakPreset(false)
    }
  }

  async function saveGoalLayoutPreset() {
    try {
      setSavingGoalPreset(true)
      const nextPreset = normalizeDashboardGoalLayoutPreset({
        shell: currentGoalPreset.shell,
        titleTransform: goalTitleTransform,
        summaryOffset: goalSummaryOffset,
        trophyFrame: goalTrophyFrame,
      })

      const response = await fetch('/api/dashboard-preview/goal-layout-preset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextPreset),
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }

      setSaveToast('Goal preset 已保存，刷新 dashboard 即可看到同步结果')
    } catch (error) {
      setSaveToast(
        error instanceof Error ? error.message : 'Goal preset 保存失败'
      )
    } finally {
      setSavingGoalPreset(false)
    }
  }

  async function saveProfileLayoutPreset() {
    try {
      setSavingProfilePreset(true)
      const response = await fetch('/api/dashboard-preview/profile-layout-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProfilePreset),
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }

      setSaveToast('Profile preset 已保存，刷新 dashboard 即可看到同步结果')
    } catch (error) {
      setSaveToast(
        error instanceof Error ? error.message : 'Profile preset 保存失败'
      )
    } finally {
      setSavingProfilePreset(false)
    }
  }

  async function saveCalendarLayoutPreset() {
    try {
      setSavingCalendarPreset(true)
      const response = await fetch('/api/dashboard-preview/calendar-layout-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentCalendarPreset),
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }

      setSaveToast('Calendar preset 已保存，刷新 dashboard 即可看到同步结果')
    } catch (error) {
      setSaveToast(
        error instanceof Error ? error.message : 'Calendar preset 保存失败'
      )
    } finally {
      setSavingCalendarPreset(false)
    }
  }

  async function saveTimeLayoutPreset() {
    try {
      setSavingTimePreset(true)
      const response = await fetch('/api/dashboard-preview/time-layout-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentTimePreset),
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }

      setSaveToast('Time preset 已保存，刷新 dashboard 即可看到同步结果')
    } catch (error) {
      setSaveToast(
        error instanceof Error ? error.message : 'Time preset 保存失败'
      )
    } finally {
      setSavingTimePreset(false)
    }
  }

  async function saveSubjectLayoutPreset() {
    try {
      setSavingSubjectPreset(true)
      const response = await fetch('/api/dashboard-preview/subject-layout-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSubjectPreset),
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }

      setSaveToast('Subject preset 已保存，刷新 dashboard 即可看到同步结果')
    } catch (error) {
      setSaveToast(
        error instanceof Error ? error.message : 'Subject preset 保存失败'
      )
    } finally {
      setSavingSubjectPreset(false)
    }
  }

  async function saveReviewLayoutPreset() {
    try {
      setSavingReviewPreset(true)
      const response = await fetch('/api/dashboard-preview/review-layout-preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentReviewPreset),
      })

      if (!response.ok) {
        throw new Error(`保存失败: ${response.status}`)
      }

      setSaveToast('Review preset 已保存，刷新 dashboard 即可看到同步结果')
    } catch (error) {
      setSaveToast(
        error instanceof Error ? error.message : 'Review preset 保存失败'
      )
    } finally {
      setSavingReviewPreset(false)
    }
  }

  function startHeroArtInteraction(
    mode: HeroArtInteractionMode,
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (!layoutEditMode || !heroArtEditMode) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedShellKey('hero')

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is a best-effort enhancement.
    }

    const frameRect =
      heroArtworkFrameRef.current?.getBoundingClientRect() ?? {
        width: 520,
        height: 320,
      }

    setHeroArtInteraction({
      mode,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: heroArtFrame.x,
      startY: heroArtFrame.y,
      startWidth: heroArtFrame.width,
      startHeight: heroArtFrame.height,
      frameWidth: frameRect.width,
      frameHeight: frameRect.height,
    })
  }

  function startHeroCtaInteraction(event: React.PointerEvent<HTMLButtonElement>) {
    if (!layoutEditMode || !heroCtaEditMode) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedShellKey('hero')

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is a best-effort enhancement.
    }

    setHeroCtaInteraction({
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: heroCtaOffset.x,
      startY: heroCtaOffset.y,
    })
  }

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,197,101,0.18)_0%,transparent_18%),radial-gradient(circle_at_top_right,rgba(255,244,223,0.85)_0%,transparent_26%),linear-gradient(180deg,#fcf7f0_0%,#f7f0e8_100%)] text-[#242c38]">
      <div className="flex h-full w-full">
        <aside className="hidden shrink-0 border-r border-[#ecd8c1] bg-white/55 px-3 py-4 backdrop-blur desktop:flex desktop:w-[84px] desktop:flex-col min-[1280px]:w-[244px] min-[1280px]:px-4">
          <div className="flex items-center gap-3 px-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#ff9e2d_0%,#ff7f18_100%)] text-white shadow-[0_18px_36px_-22px_rgba(240,125,44,0.48)]">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="hidden min-w-0 min-[1280px]:block">
              <div className="text-[17px] font-semibold tracking-tight text-[#1f2835]">
                Learnbank.ai
              </div>
              <div className="mt-1 inline-flex rounded-full border border-[#efd9bf] bg-white px-2 py-0.5 text-[11px] text-[#ef7d35]">
                Starter
              </div>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {primaryNav.map((item) => (
              <SidebarItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                active={item.active}
              />
            ))}
          </nav>

          <div className="mt-9 border-t border-[#ecd8c1] pt-5">
            <div className="hidden px-3 pb-3 text-[11px] font-semibold tracking-[0.18em] text-[#818b96] min-[1280px]:block">
              管理
            </div>
            <div className="space-y-2">
              {manageNav.map((item) => (
                <SidebarItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  chevron={item.chevron}
                />
              ))}
            </div>
          </div>

          <div className="mt-8 hidden rounded-[22px] border border-[#efdbc3] bg-[linear-gradient(180deg,#fffdf8_0%,#fff6ea_100%)] p-4 shadow-[0_18px_32px_-28px_rgba(120,72,32,0.35)] min-[1280px]:block">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[linear-gradient(180deg,#ffe3b0_0%,#ffc666_100%)] text-[#f08a1f]">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold text-[#222b36]">
                  升级套餐
                </div>
                <div className="mt-1 text-[12px] text-[#6c7480]">
                  解锁更多训练与 AI 功能
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#8e97a2]" />
            </div>
          </div>

          <div className="mt-auto border-t border-[#ecd8c1] pt-5">
            <div className="hidden px-3 text-[11px] font-semibold tracking-[0.18em] text-[#818b96] min-[1280px]:block">
              账户
            </div>

            <div className="mt-3 hidden rounded-[22px] border border-[#efdbc3] bg-white p-4 shadow-[0_18px_30px_-28px_rgba(120,72,32,0.32)] min-[1280px]:block">
              <div className="flex items-center gap-3">
                <AvatarIllustration variant="sidebar" />
                <div className="min-w-0 flex-1">
                  <div className="text-[16px] font-semibold text-[#212a35]">
                    等级 2
                  </div>
                  <div className="mt-1 text-[13px] text-[#56606d]">1060 XP</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[12px] text-[#6a7480]">
                <span>1,060 XP</span>
                <span>2,000</span>
              </div>
              <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-[#ede1d4]">
                <div className="h-full w-[53%] rounded-full bg-[linear-gradient(90deg,#ff8b1e_0%,#ff6521_100%)]" />
              </div>
            </div>

            <div className="mt-4 hidden space-y-2 min-[1280px]:block">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-[15px] font-medium text-[#2d3641] hover:bg-white/70"
              >
                <Settings className="h-4 w-4 text-[#576170]" />
                设置
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left text-[15px] font-medium text-[#2d3641] hover:bg-white/70"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e2430] text-[12px] font-semibold text-white">
                  N
                </div>
                退出登录
              </button>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-20 border-b border-[#ecd8c1] bg-[#fcf7f0] px-5 py-3 -translate-x-[2px] -translate-y-[1px] sm:px-6 desktop:px-7">
            <div className="flex items-center justify-between gap-5">
              <div className="min-w-0">
                <h1 className="text-[22px] font-semibold tracking-tight text-[#222b36] sm:text-[26px]">
                  仪表盘
                </h1>
                <p className="mt-1 text-[11px] text-[#66707d] sm:text-[12px]">
                  欢迎回来，Alex
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden min-w-[224px] items-center gap-2 rounded-full border border-[#ebd7c1] bg-white px-4 py-3 shadow-[0_16px_28px_-24px_rgba(120,72,32,0.32)] tablet:flex min-[1280px]:min-w-[252px]">
                  <Search className="h-5 w-5 text-[#677280]" />
                  <span className="text-[15px] text-[#7b8490]">搜索</span>
                </div>
                <HeaderCircleButton>
                  <MessageSquare className="h-5 w-5" />
                </HeaderCircleButton>
                <div className="relative">
                  <HeaderCircleButton>
                    <Bell className="h-5 w-5" />
                  </HeaderCircleButton>
                  <div className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6621] text-[10px] font-semibold text-white">
                    3
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-full border border-[#ebd7c1] bg-white shadow-[0_16px_28px_-24px_rgba(120,72,32,0.32)]"
                >
                  <AvatarIllustration variant="topbar" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden px-3 py-3 sm:px-4 sm:py-4 desktop:px-5 desktop:py-5">
            {shellOnly ? (
              <>
                <div ref={canvasRef} className="relative h-full w-full">
                  {renderedShellBoxes.map((box) => {
                    const selected = layoutEditMode && selectedShellKey === box.key
                    const shellLayerZIndex =
                      box.key === 'profile'
                        ? 40
                        : box.key === 'subject'
                          ? 36
                          : box.key === 'time'
                            ? 35
                            : box.key === 'review'
                              ? 34
                              : box.key === 'goal'
                                ? 33
                                : box.key === 'streak'
                                  ? 32
                                  : box.key === 'hero'
                                    ? 30
                              : box.key === 'task'
                                ? 25
                                : box.key === 'path'
                                  ? 25
                                  : box.key === 'calendar'
                                          ? 20
                                          : 10

                    return (
                      <ShellCard
                        key={box.key}
                        data-shell-key={box.key}
                        role={layoutEditMode ? 'button' : undefined}
                        tabIndex={layoutEditMode ? 0 : undefined}
                        aria-label={layoutEditMode ? `卡片 ${box.key}` : undefined}
                        className={`${box.className} ${
                          layoutEditMode
                            ? 'cursor-grab touch-none select-none transition-[box-shadow,border-color,transform] duration-75 active:cursor-grabbing'
                            : ''
                        } ${
                          selected
                            ? 'ring-2 ring-[#ff7d19] ring-offset-2 ring-offset-[#fcf7f0]'
                            : ''
                        }`}
                        style={{
                          position: 'absolute',
                          left: `${box.x}px`,
                          top: `${box.y}px`,
                          width: `${box.width}px`,
                          height: `${box.height}px`,
                          borderRadius: `${shellCornerRadius}px`,
                          zIndex: selected ? shellLayerZIndex + 10 : shellLayerZIndex,
                        }}
                        onFocus={() => {
                          if (layoutEditMode) {
                            setSelectedShellKey(box.key)
                          }
                        }}
                      >
                        {box.key === 'hero' ? (
                          <HeroCardBody
                            editMode={layoutEditMode}
                            artEditMode={heroArtEditMode}
                            heroCtaEditMode={heroCtaEditMode}
                            artSelected={selectedShellKey === 'hero'}
                            heroArtFrame={heroArtFrame}
                            heroCtaOffset={heroCtaOffset}
                            contentMaxWidth={heroContentMaxWidth}
                            heroArtworkFrameRef={heroArtworkFrameRef}
                            showEditControls={false}
                            onToggleHeroArtEdit={() => {
                              setSelectedShellKey('hero')
                              setHeroArtEditMode((current) => !current)
                            }}
                            onToggleHeroCtaEdit={() => {
                              setSelectedShellKey('hero')
                              setHeroCtaEditMode((current) => !current)
                            }}
                            onSavePageSnapshot={savePageSnapshot}
                            onSelectHeroArt={() => setSelectedShellKey('hero')}
                            onStartHeroArtMove={(event) =>
                              startHeroArtInteraction('move', event)
                            }
                            onStartHeroArtResize={(event) =>
                              startHeroArtInteraction('resize', event)
                            }
                            onStartHeroCtaMove={startHeroCtaInteraction}
                            onResetHeroArt={resetHeroArtTransform}
                            onResetHeroCta={resetHeroCtaOffset}
                            savingPageSnapshot={savingPageSnapshot}
                          />
                        ) : box.key === 'profile' ? (
                          <ProfileCardBody
                            editMode={layoutEditMode}
                            showEditControls={selected}
                            sectionBoxes={profileSectionBoxes}
                            onStartSectionInteraction={startProfileSectionInteraction}
                          />
                        ) : box.key === 'review' ? (
                          <ReviewCardBody
                            editMode={layoutEditMode}
                            showEditControls={selected}
                            titleTransform={reviewTitleTransform}
                            reviewBoxes={reviewCardBoxes}
                            onStartTitleMove={(event) =>
                              startEditableTitleInteraction('review-title', 'move', event)
                            }
                            onStartTitleScale={(event) =>
                              startEditableTitleInteraction('review-title', 'scale', event)
                            }
                            onStartCardMove={(key, event) =>
                              startReviewCardInteraction(key, 'move', event)
                            }
                            onStartCardResize={(key, event) =>
                              startReviewCardInteraction(key, 'resize', event)
                            }
                          />
                        ) : box.key === 'path' ? (
                        <PathCardBody
                          editMode={layoutEditMode}
                          showEditControls={selected}
                          titleTransform={pathTitleTransform}
                          backgroundOffset={pathBackgroundOffset}
                          onStartTitleMove={(event) =>
                            startEditableTitleInteraction('path-title', 'move', event)
                          }
                          onStartTitleScale={(event) =>
                            startEditableTitleInteraction('path-title', 'scale', event)
                          }
                          onStartBackgroundMove={startPathBackgroundInteraction}
                        />
                        ) : box.key === 'calendar' ? (
                          <CalendarCardBody
                            titleTransform={calendarTitleTransform}
                            contentTransform={calendarContentTransform}
                          />
                        ) : box.key === 'task' ? (
                          <TaskCardBody
                            editMode={layoutEditMode}
                            showEditControls={selected}
                            titleTransform={taskTitleTransform}
                            taskCardBoxes={taskCardBoxes}
                            onStartTitleMove={(event) =>
                              startEditableTitleInteraction('task-title', 'move', event)
                            }
                            onStartTitleScale={(event) =>
                              startEditableTitleInteraction('task-title', 'scale', event)
                            }
                            onStartCardMove={(key, event) =>
                              startTaskCardInteraction(key, 'move', event)
                            }
                            onStartCardResize={(key, event) =>
                              startTaskCardInteraction(key, 'resize', event)
                            }
                          />
                        ) : box.key === 'time' ? (
                        <TimeStudyCardBody
                          editMode={layoutEditMode}
                          showEditControls={selected}
                          titleTransform={timeTitleTransform}
                          timeStudyPanelBoxes={timeStudyPanelBoxes}
                            onStartTitleMove={(event) =>
                              startEditableTitleInteraction('time-title', 'move', event)
                            }
                            onStartTitleScale={(event) =>
                              startEditableTitleInteraction('time-title', 'scale', event)
                            }
                            onStartPanelMove={(key, event) =>
                              startTimeStudyPanelInteraction(key, 'move', event)
                            }
                            onStartPanelResize={(key, event) =>
                              startTimeStudyPanelInteraction(key, 'resize', event)
                            }
                            onStartPanelHeightResize={(key, event) =>
                              startTimeStudyPanelInteraction(key, 'resize', event)
                            }
                          />
                        ) : box.key === 'streak' ? (
                          <StreakCardBody
                            editMode={layoutEditMode}
                            showEditControls={selected}
                            titleTransform={streakTitleTransform}
                            campfireFrame={streakCampfireFrame}
                            onStartTitleMove={(event) =>
                              startEditableTitleInteraction('streak-title', 'move', event)
                            }
                            onStartTitleScale={(event) =>
                              startEditableTitleInteraction('streak-title', 'scale', event)
                            }
                            onStartCampfireMove={(event) =>
                              startStreakCampfireInteraction('move', event)
                            }
                            onStartCampfireResize={(event) =>
                              startStreakCampfireInteraction('resize', event)
                            }
                          />
                        ) : box.key === 'goal' ? (
                          <GoalCardBody
                            editMode={layoutEditMode}
                            showEditControls={selected}
                            titleTransform={goalTitleTransform}
                            summaryOffset={goalSummaryOffset}
                            trophyFrame={goalTrophyFrame}
                            onStartTitleMove={(event) =>
                              startEditableTitleInteraction('goal-title', 'move', event)
                            }
                            onStartTitleScale={(event) =>
                              startEditableTitleInteraction('goal-title', 'scale', event)
                            }
                          />
                        ) : box.key === 'subject' ? (
                          <SubjectProgressCardBody
                            editMode={layoutEditMode}
                            showEditControls={selected}
                            titleTransform={subjectTitleTransform}
                            subjectBoxes={resolvedSubjectCardBoxes}
                            onStartTitleMove={(event) =>
                              startEditableTitleInteraction('subject-title', 'move', event)
                            }
                            onStartTitleScale={(event) =>
                              startEditableTitleInteraction('subject-title', 'scale', event)
                            }
                            onStartCardMove={(key, event) =>
                              startSubjectCardInteraction(key, 'move', event)
                            }
                            onStartCardResize={(key, event) =>
                              startSubjectCardInteraction(key, 'resize', event)
                            }
                            onStartCardHeightResize={(key, event) =>
                              startSubjectCardInteraction(key, 'resize-height', event)
                            }
                          />
                        ) : null}
                      </ShellCard>
                    )
                  })}
                  {layoutEditMode ? (
                    <div className="pointer-events-none absolute inset-0 z-[25]">
                      {renderedShellBoxes.map((box) => {
                        if (
                          box.key === 'hero' ||
                          box.key === 'profile' ||
                          box.key === 'time' ||
                          box.key === 'subject' ||
                          box.key === 'calendar' ||
                          box.key === 'path' ||
                          box.key === 'task' ||
                          box.key === 'streak'
                        ) {
                          return null
                        }

                        return (
                          <button
                            key={`${box.key}-move`}
                            type="button"
                            aria-label={`移动 ${box.key}`}
                            className="pointer-events-auto absolute cursor-grab rounded-[inherit] bg-transparent outline-none active:cursor-grabbing"
                            style={{
                              left: `${box.x}px`,
                              top: `${box.y}px`,
                              width: `${box.width}px`,
                              height: `${box.height}px`,
                              borderRadius: `${shellCornerRadius}px`,
                            }}
                            onPointerDown={(event) =>
                              startShellInteraction(box, 'move', event)
                            }
                            onFocus={() => setSelectedShellKey(box.key)}
                          />
                        )
                      })}
                    </div>
                  ) : null}
                  {layoutEditMode ? (
                    <div className="pointer-events-none absolute inset-0 z-20">
                      {renderedShellBoxes.map((box) => (
                        <React.Fragment key={`${box.key}-overlay`}>
                          <div
                            className="pointer-events-none absolute rounded-[28px] border border-dashed border-[#ff8a20]/55 bg-transparent"
                            style={{
                              left: `${box.x}px`,
                              top: `${box.y}px`,
                              width: `${box.width}px`,
                              height: `${box.height}px`,
                              borderRadius: `${shellCornerRadius}px`,
                              zIndex: 20,
                            }}
                          />
                          <div
                          className="pointer-events-none absolute rounded-full bg-[#ff8a20] px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_22px_-14px_rgba(255,102,25,0.85)]"
                          style={{
                            left: `${box.x + 12}px`,
                            top: `${box.y + 12}px`,
                            zIndex: 21,
                          }}
                        >
                            {box.key} · {Math.round(box.width)} × {Math.round(box.height)}
                          </div>
                        </React.Fragment>
                      ))}
                      {shellGapGuides.map((guide) => (
                        <React.Fragment key={guide.key}>
                          {guide.orientation === 'horizontal' ? (
                            <>
                              <div
                                className="pointer-events-none absolute border-t border-dashed border-[#ff8a20]/70"
                                style={{
                                  left: `${guide.x}px`,
                                  top: `${guide.y}px`,
                                  width: `${guide.length}px`,
                                  zIndex: 22,
                                }}
                              />
                              <div
                                className="pointer-events-none absolute rounded-full bg-[#ff8a20] px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_22px_-14px_rgba(255,102,25,0.85)]"
                                style={{
                                  left: `${guide.x + Math.max(0, guide.length / 2 - 24)}px`,
                                  top: `${guide.y - 12}px`,
                                  zIndex: 23,
                                }}
                              >
                                {guide.label}
                              </div>
                            </>
                          ) : (
                            <>
                              <div
                                className="pointer-events-none absolute border-l border-dashed border-[#ff8a20]/70"
                                style={{
                                  left: `${guide.x}px`,
                                  top: `${guide.y}px`,
                                  height: `${guide.length}px`,
                                  zIndex: 22,
                                }}
                              />
                              <div
                                className="pointer-events-none absolute rounded-full bg-[#ff8a20] px-2 py-0.5 text-[10px] font-semibold text-white shadow-[0_10px_22px_-14px_rgba(255,102,25,0.85)]"
                                style={{
                                  left: `${guide.x - 18}px`,
                                  top: `${guide.y + Math.max(0, guide.length / 2 - 10)}px`,
                                  zIndex: 23,
                                }}
                              >
                                {guide.label}
                              </div>
                            </>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : null}
                  {layoutEditMode ? (
                    <div className="pointer-events-none absolute inset-0 z-30">
                      {renderedShellBoxes.map((box) => {
                        if (box.key === 'streak') {
                          return null
                        }

                        return (
                          <button
                            key={`${box.key}-resize`}
                            type="button"
                            aria-label={`调整 ${box.key} 大小`}
                            className="pointer-events-auto absolute h-4 w-4 cursor-nwse-resize rounded-[4px] border border-white/80 bg-[#ff7d19] shadow-[0_12px_24px_-14px_rgba(255,102,25,0.9)]"
                            style={{
                              left: `${box.x + box.width - 10}px`,
                              top: `${box.y + box.height - 10}px`,
                              pointerEvents:
                                ((heroArtEditMode || heroCtaEditMode) && box.key === 'hero') ||
                                (profileAvatarEditMode && box.key === 'profile') ||
                                box.key === 'task'
                                  ? 'none'
                                  : 'auto',
                            }}
                            onPointerDown={(event) =>
                              startShellInteraction(box, 'resize', event)
                            }
                          />
                        )
                      })}
                    </div>
                  ) : null}
                </div>
                <DashboardHeroLayoutInspector
                  visible={layoutEditMode && shellOnly && selectedShellKey === 'hero'}
                  selected={selectedShellKey === 'hero'}
                  preset={currentHeroPreset}
                  saving={savingHeroPreset}
                  onPresetChange={(nextPreset) => {
                    setEditableShellBoxes((current) =>
                      current.map((box) =>
                        box.key === 'hero'
                          ? {
                              ...box,
                              width: nextPreset.shell.width,
                              height: nextPreset.shell.height,
                            }
                          : box
                      )
                    )
                    setHeroContentMaxWidth(nextPreset.contentMaxWidth)
                    setHeroArtFrame(nextPreset.artFrame)
                    setHeroCtaOffset(nextPreset.ctaOffset)
                  }}
                  onSave={saveHeroLayoutPreset}
                />
                <DashboardTaskLayoutInspector
                  visible={layoutEditMode && shellOnly && selectedShellKey === 'task'}
                  selected={selectedShellKey === 'task'}
                  preset={currentTaskPreset}
                  saving={savingTaskPreset}
                  onPresetChange={(nextPreset) => {
                    setTaskTitleTransform(nextPreset.titleTransform)
                    setTaskCardBoxes(nextPreset.taskCardBoxes)
                  }}
                  onSave={saveTaskLayoutPreset}
                />
                <DashboardProfileLayoutInspector
                  visible={layoutEditMode && shellOnly && selectedShellKey === 'profile'}
                  selected={selectedShellKey === 'profile'}
                  preset={currentProfilePreset}
                  saving={savingProfilePreset}
                  onPresetChange={(nextPreset) => {
                    setEditableShellBoxes((current) =>
                      current.map((box) =>
                        box.key === 'profile'
                          ? {
                              ...box,
                              width: nextPreset.shell.width,
                              height: nextPreset.shell.height,
                            }
                          : box
                      )
                    )
                    setProfileSectionBoxes(nextPreset.sectionBoxes)
                  }}
                  onSave={saveProfileLayoutPreset}
                />
                <DashboardCalendarLayoutInspector
                  visible={layoutEditMode && shellOnly && selectedShellKey === 'calendar'}
                  selected={selectedShellKey === 'calendar'}
                  preset={currentCalendarPreset}
                  saving={savingCalendarPreset}
                  onPresetChange={(nextPreset) => {
                    setEditableShellBoxes((current) =>
                      current.map((box) =>
                        box.key === 'calendar'
                          ? {
                              ...box,
                              width: nextPreset.shell.width,
                              height: nextPreset.shell.height,
                            }
                          : box
                      )
                    )
                    setCalendarTitleTransform(nextPreset.titleTransform)
                    setCalendarContentTransform(nextPreset.contentTransform)
                  }}
                  onSave={saveCalendarLayoutPreset}
                />
                <DashboardPathLayoutInspector
                  visible={layoutEditMode && shellOnly && selectedShellKey === 'path'}
                  selected={selectedShellKey === 'path'}
                  preset={currentPathPreset}
                  saving={savingPathPreset}
                  onPresetChange={(nextPreset) => {
                    setEditableShellBoxes((current) =>
                      current.map((box) =>
                        box.key === 'path'
                          ? {
                              ...box,
                              width: nextPreset.shell.width,
                              height: nextPreset.shell.height,
                            }
                          : box
                      )
                    )
                    setPathTitleTransform(nextPreset.titleTransform)
                    setPathBackgroundOffset(nextPreset.backgroundOffset)
                  }}
                  onSave={savePathLayoutPreset}
                />
                <DashboardStreakLayoutInspector
                  visible={layoutEditMode && shellOnly && selectedShellKey === 'streak'}
                  selected={selectedShellKey === 'streak'}
                  preset={currentStreakPreset}
                  saving={savingStreakPreset}
                  onPresetChange={(nextPreset) => {
                    setEditableShellBoxes((current) =>
                      current.map((box) =>
                        box.key === 'streak'
                          ? {
                              ...box,
                              width: nextPreset.shell.width,
                              height: nextPreset.shell.height,
                            }
                          : box
                      )
                    )
                    setStreakTitleTransform(nextPreset.titleTransform)
                    setStreakCampfireFrame(nextPreset.campfireFrame)
                  }}
                  onSave={saveStreakLayoutPreset}
                />
                <DashboardGoalLayoutInspector
                  visible={layoutEditMode && shellOnly && selectedShellKey === 'goal'}
                  selected={selectedShellKey === 'goal'}
                  preset={currentGoalPreset}
                  saving={savingGoalPreset}
                  onPresetChange={(nextPreset) => {
                    setEditableShellBoxes((current) =>
                      current.map((box) =>
                        box.key === 'goal'
                          ? {
                              ...box,
                              width: nextPreset.shell.width,
                              height: nextPreset.shell.height,
                            }
                          : box
                      )
                    )
                    setGoalTitleTransform(nextPreset.titleTransform)
                    setGoalSummaryOffset(nextPreset.summaryOffset)
                    setGoalTrophyFrame(nextPreset.trophyFrame)
                  }}
                  onSave={saveGoalLayoutPreset}
                />
                <DashboardTimeLayoutInspector
                  visible={layoutEditMode && shellOnly && selectedShellKey === 'time'}
                  selected={selectedShellKey === 'time'}
                  preset={currentTimePreset}
                  saving={savingTimePreset}
                  onPresetChange={(nextPreset) => {
                    setEditableShellBoxes((current) =>
                      current.map((box) =>
                        box.key === 'time'
                          ? {
                              ...box,
                              width: nextPreset.shell.width,
                              height: nextPreset.shell.height,
                            }
                          : box
                      )
                    )
                    setTimeTitleTransform(nextPreset.titleTransform)
                    setTimeStudyPanelBoxes(nextPreset.panelBoxes)
                  }}
                  onSave={saveTimeLayoutPreset}
                />
                <DashboardSubjectLayoutInspector
                  visible={layoutEditMode && shellOnly && selectedShellKey === 'subject'}
                  selected={selectedShellKey === 'subject'}
                  preset={currentSubjectPreset}
                  saving={savingSubjectPreset}
                  onPresetChange={(nextPreset) => {
                    setEditableShellBoxes((current) =>
                      current.map((box) =>
                        box.key === 'subject'
                          ? {
                              ...box,
                              width: nextPreset.shell.width,
                              height: nextPreset.shell.height,
                            }
                          : box
                      )
                    )
                    setSubjectTitleTransform(nextPreset.titleTransform)
                    setSubjectCardBoxes(nextPreset.cardBoxes)
                  }}
                  onSave={saveSubjectLayoutPreset}
                />
                <DashboardReviewLayoutInspector
                  visible={layoutEditMode && shellOnly && selectedShellKey === 'review'}
                  selected={selectedShellKey === 'review'}
                  preset={currentReviewPreset}
                  saving={savingReviewPreset}
                  onPresetChange={(nextPreset) => {
                    setEditableShellBoxes((current) =>
                      current.map((box) =>
                        box.key === 'review'
                          ? {
                              ...box,
                              width: nextPreset.shell.width,
                              height: nextPreset.shell.height,
                            }
                          : box
                      )
                    )
                    setReviewTitleTransform(nextPreset.titleTransform)
                    setReviewCardBoxes(nextPreset.cardBoxes)
                  }}
                  onSave={saveReviewLayoutPreset}
                />
                {saveToast ? (
                  <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#222b36] px-4 py-2 text-[12px] font-medium text-white shadow-[0_22px_44px_-28px_rgba(25,31,40,0.55)]">
                    {saveToast}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex h-full w-full origin-top-left scale-[0.86] transform-gpu flex-col gap-3">
                <section className="grid gap-2.5 min-[1280px]:grid-cols-[minmax(0,1.22fr)_minmax(360px,0.78fr)] 2xl:grid-cols-[minmax(0,1.24fr)_minmax(430px,0.76fr)]">
                  <ShellCard className="overflow-hidden p-0">
                    <MaskedContent shellOnly={shellOnly}>
                      <CardViewport>
                        <div className="grid min-h-[248px] gap-0 tablet:grid-cols-[minmax(0,0.84fr)_minmax(320px,1.16fr)] min-[1400px]:grid-cols-[minmax(0,0.76fr)_minmax(420px,1.24fr)]">
                          <div className="flex h-full flex-col justify-between p-4 sm:p-5">
                            <div>
                              <div className="flex items-center gap-3 text-[#242c38]">
                                <Star className="h-5 w-5 fill-[#ffbe2b] text-[#ef8622]" />
                                <span className="text-[17px] font-semibold tracking-tight">
                                  学习总览
                                </span>
                              </div>
                              <div className="mt-4 flex items-start gap-3">
                                <h2 className="max-w-[320px] text-[35px] font-semibold leading-[1.04] tracking-tight text-[#252d39] sm:text-[41px]">
                                  保持你的
                                  <br />
                                  连胜势头！
                                </h2>
                                <span className="mt-1 text-[30px] leading-none">🔥</span>
                              </div>
                              <p className="mt-3.5 text-[13px] text-[#596371]">
                                你今天状态很好。
                              </p>

                              <div className="mt-4 flex flex-wrap gap-2.5">
                                <div className="flex items-center gap-3 rounded-[16px] border border-[#efd9bf] bg-white/85 px-4 py-2.5 shadow-[0_16px_28px_-24px_rgba(120,72,32,0.25)]">
                                  <Star className="h-6 w-6 fill-[#ffcb29] text-[#f08b1f]" />
                                  <div className="text-[14px] font-semibold text-[#222b36]">
                                    1240{' '}
                                    <span className="ml-1 text-[13px] font-medium text-[#69727f]">
                                      XP
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-[16px] border border-[#efd9bf] bg-white/85 px-4 py-2.5 shadow-[0_16px_28px_-24px_rgba(120,72,32,0.25)]">
                                  <Medal className="h-6 w-6 text-[#3ea653]" />
                                  <div className="text-[14px] font-semibold text-[#222b36]">
                                    7级 探索者
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="mt-5 inline-flex h-11 w-full items-center justify-between rounded-[16px] bg-[linear-gradient(90deg,#ff8a1f_0%,#ff5e18_100%)] px-6 text-[14px] font-semibold text-white shadow-[0_22px_32px_-26px_rgba(255,102,25,0.9)] sm:w-[206px]"
                            >
                              <span>继续学习</span>
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#ff7d19]">
                                <ChevronRight className="h-5 w-5" />
                              </span>
                            </button>
                          </div>

                          <div className="relative">
                            <HeroArtwork />
                          </div>
                        </div>
                      </CardViewport>
                    </MaskedContent>
                  </ShellCard>

                <div className="space-y-3">
                  <ShellCard className="p-3 sm:p-3.5">
                    <MaskedContent shellOnly={shellOnly}>
                      <CardViewport>
                        <div className="flex items-center gap-4">
                          <AvatarIllustration />
                          <div className="min-w-0 flex-1">
                            <div className="text-[19px] font-semibold tracking-tight text-[#252d38] sm:text-[22px]">
                              嗨，Alex!
                            </div>
                            <div className="mt-1.5 flex items-center gap-2 text-[14px] text-[#4d5764]">
                              <Medal className="h-4 w-4 text-[#2ebf69]" />
                              好奇探索者
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2.5 border-t border-[#ecd9c4] pt-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_76px]">
                          <div className="text-[15px] text-[#2d3641]">
                            <div className="flex items-center gap-2 font-semibold">
                              <Star className="h-5 w-5 fill-[#ffbf2f] text-[#ef8a1f]" />
                              1240{' '}
                              <span className="text-[13px] font-medium text-[#68727e]">
                                XP
                              </span>
                            </div>
                          </div>
                          <div className="text-[15px] text-[#2d3641]">
                            <div className="flex items-center gap-2 font-semibold">
                              <Flame className="h-5 w-5 text-[#ff6d1b]" />
                              12天
                            </div>
                            <div className="mt-1 text-[13px] text-[#69727f]">
                              连续学习
                            </div>
                          </div>
                          <div className="flex justify-start sm:justify-end">
                            <div className="rounded-[18px] bg-[linear-gradient(180deg,#ffb223_0%,#f37a1c_100%)] p-3 text-white shadow-[0_20px_30px_-24px_rgba(240,125,44,0.8)]">
                              <Medal className="h-8 w-8" />
                            </div>
                          </div>
                        </div>
                      </CardViewport>
                    </MaskedContent>
                  </ShellCard>

                  <ShellCard className="p-3 sm:p-3.5">
                    <MaskedContent shellOnly={shellOnly}>
                      <CardViewport>
                        <SectionTitle
                          icon={<BookText className="h-5 w-5" />}
                          title="活动日历"
                        />

                        <div className="mt-3">
                          <div className="grid grid-cols-[56px_repeat(11,minmax(0,1fr))] gap-x-1.5 gap-y-2.5 text-center text-[12px] text-[#59636f] sm:grid-cols-[66px_repeat(11,minmax(0,1fr))] sm:gap-x-2 sm:text-[13px]">
                            <div />
                            {[
                              '一',
                              '二',
                              '三',
                              '四',
                              '五',
                              '六',
                              '日',
                              '一',
                              '二',
                              '三',
                              '四',
                            ].map((day, index) => (
                              <div key={`${day}-${index}`}>{day}</div>
                            ))}

                            {calendarRows.map((row) => (
                              <React.Fragment key={row.label}>
                                <div className="flex items-center text-left text-[13px] text-[#4d5662] sm:text-[14px]">
                                  {row.label}
                                </div>
                                {row.cells.map((cell, index) => (
                                  <div
                                    key={`${row.label}-${index}`}
                                    className="flex justify-center"
                                  >
                                    <HeatCell level={cell} />
                                  </div>
                                ))}
                              </React.Fragment>
                            ))}
                          </div>

                          <div className="mt-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3 text-[13px] text-[#5f6975]">
                              <span>较少</span>
                              <div className="flex gap-1.5">
                                {[0, 1, 2, 3, 4, 5].map((level) => (
                                  <HeatCell key={level} level={level} />
                                ))}
                              </div>
                              <span>较多</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-full border border-[#f2d7bc] bg-[#fff6eb] px-4 py-2 text-[14px] font-medium text-[#ff6a1a]">
                              <Flame className="h-5 w-5" />
                              连续表现很棒！
                            </div>
                          </div>
                        </div>
                      </CardViewport>
                    </MaskedContent>
                  </ShellCard>
                </div>
                </section>

                <section className="grid gap-4 min-[1280px]:grid-cols-[minmax(0,1.16fr)_minmax(320px,0.84fr)] 2xl:grid-cols-[minmax(0,1.18fr)_minmax(390px,0.82fr)]">
                  <div className="space-y-2.5">
                    <ShellCard className="p-3 sm:p-3.5">
                      <CardViewport>
                        <SectionTitle
                          icon={<Target className="h-5 w-5" />}
                          title="今日任务"
                        />

                        <div className="mt-3 grid gap-2 sm:grid-cols-2 min-[1500px]:grid-cols-4">
                          {taskCards.map((task) => (
                            <div
                              key={task.title}
                              className="rounded-[20px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ef_100%)] p-2.5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <SubjectIcon kind={task.icon} />
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e9cfb7] text-[#b89576]">
                                  <span className="h-[10px] w-[10px] rounded-full border border-[#d7b595]" />
                                </div>
                              </div>
                              <div className="mt-2 text-[13px] font-semibold text-[#25303c]">
                                {task.title}
                              </div>
                              <div className="mt-1 text-[12px] text-[#455160]">
                                {task.subtitle}
                              </div>
                              <div className="mt-4 flex items-center gap-3">
                                <div className="min-w-0 flex-1">
                                  <ProgressTrack
                                    value={task.width}
                                    color={
                                      task.icon === 'science'
                                        ? '#23b48a'
                                        : task.icon === 'english'
                                          ? '#efdccc'
                                          : '#1e73e9'
                                    }
                                  />
                                </div>
                                <span className="text-[13px] font-medium text-[#374250]">
                                  {task.progress}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardViewport>
                    </ShellCard>

                    <ShellCard className="overflow-hidden p-3 sm:p-3.5">
                    <MaskedContent shellOnly={shellOnly} forceVisible>
                      <PathCardBody
                        editMode={layoutEditMode}
                        titleTransform={pathTitleTransform}
                        backgroundOffset={pathBackgroundOffset}
                        onStartTitleMove={(event) =>
                          startEditableTitleInteraction('path-title', 'move', event)
                        }
                        onStartTitleScale={(event) =>
                          startEditableTitleInteraction('path-title', 'scale', event)
                        }
                        onStartBackgroundMove={startPathBackgroundInteraction}
                      />
                    </MaskedContent>
                    </ShellCard>
                  </div>

                  <div className="grid gap-3 min-[1280px]:grid-cols-2">
                    <ShellCard className="h-full min-h-[256px] p-3 sm:p-3.5">
                    <MaskedContent shellOnly={shellOnly} forceVisible>
                      <CardViewport>
                        <SectionTitle
                          icon={
                            <GeneratedSectionIcon
                              src={studyTimeSectionIcon}
                              alt="学习时长分布图标"
                            />
                          }
                          title="学习时长分布"
                        />

                        <div className="mt-2.5 flex flex-col gap-1.5">
                          <div className="mx-auto flex h-[94px] w-[94px] items-center justify-center rounded-full bg-[conic-gradient(#2f8bff_0deg_126deg,#24b892_126deg_223deg,#ff6940_223deg_306deg,#ffb930_306deg_349deg,#b6b1aa_349deg_360deg)]">
                            <div className="flex h-[62px] w-[62px] flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(236,217,196,0.7)]">
                              <div className="text-[11px] font-semibold text-[#2a3340]">
                                本周
                              </div>
                              <div className="mt-0.5 text-[9px] text-[#4f5966]">
                                6小时30分
                              </div>
                            </div>
                          </div>

                          <div className="min-w-0 space-y-1">
                            {subjectStats.map((item) => (
                              <div
                                key={item.label}
                                className="grid grid-cols-[10px_minmax(0,1fr)_auto_auto] items-center gap-[5px] text-[9px]"
                              >
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="text-[#35404d]">{item.label}</span>
                                <span className="text-[#6a7480]">{item.value}</span>
                                <span className="font-medium text-[#4e5865]">
                                  {item.percent}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardViewport>
                    </MaskedContent>
                    </ShellCard>

                    <ShellCard className="h-full min-h-[256px] p-3 sm:p-3.5">
                    <MaskedContent shellOnly={shellOnly} forceVisible>
                      <CardViewport>
                        <SectionTitle
                          icon={
                            <GeneratedSectionIcon
                              src={subjectSectionIcon}
                              alt="科目进度图标"
                            />
                          }
                          title="科目进度"
                        />

                        <div className="mt-2 grid gap-1 sm:grid-cols-2 min-[1280px]:grid-cols-1 2xl:grid-cols-2">
                          {subjectCards.map((item) => (
                            <div
                              key={item.title}
                              className="rounded-[20px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ef_100%)] p-1.5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="origin-left scale-[0.65]">
                                          <SubjectProgressIcon kind={item.icon} />
                                </div>
                                <div className="text-right">
                                  <div className="text-[9px] font-semibold text-[#24303b]">
                                    {item.title}
                                  </div>
                                  <div className="mt-0.5 text-[12px] font-semibold leading-none tracking-tight text-[#1f2935]">
                                    {item.value}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2">
                                <ProgressTrack
                                  value={item.width}
                                  color={
                                            item.icon === 'math'
                                              ? '#1f73eb'
                                              : item.icon === 'science'
                                                ? '#21b287'
                                                : item.icon === 'chinese'
                                                  ? '#ff5a2b'
                                                  : '#ffb300'
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardViewport>
                    </MaskedContent>
                    </ShellCard>
                  </div>
                </section>

                <section className="grid gap-2.5 min-[1280px]:grid-cols-[minmax(0,0.95fr)_minmax(0,0.95fr)_minmax(0,1.45fr)]">
                  <ShellCard className="overflow-hidden p-3 sm:p-3.5">
                    <StreakCardBody
                      editMode={layoutEditMode}
                      showEditControls={false}
                      titleTransform={streakTitleTransform}
                      campfireFrame={streakCampfireFrame}
                      onStartTitleMove={(event) =>
                        startEditableTitleInteraction('streak-title', 'move', event)
                      }
                      onStartTitleScale={(event) =>
                        startEditableTitleInteraction('streak-title', 'scale', event)
                      }
                      onStartCampfireMove={(event) => startStreakCampfireInteraction('move', event)}
                      onStartCampfireResize={(event) =>
                        startStreakCampfireInteraction('resize', event)
                      }
                    />
                  </ShellCard>

                  <ShellCard className="p-3.5 sm:p-4">
                    <GoalCardBody
                      editMode={layoutEditMode}
                      showEditControls={false}
                      titleTransform={goalTitleTransform}
                      summaryOffset={goalSummaryOffset}
                      trophyFrame={goalTrophyFrame}
                      onStartTitleMove={(event) =>
                        startEditableTitleInteraction('goal-title', 'move', event)
                      }
                      onStartTitleScale={(event) =>
                        startEditableTitleInteraction('goal-title', 'scale', event)
                      }
                    />
                  </ShellCard>

                  <ShellCard className="p-3 sm:p-3.5">
                    <MaskedContent shellOnly={shellOnly} forceVisible>
                      <ReviewCardBody
                        editMode={layoutEditMode}
                        showEditControls={false}
                        titleTransform={reviewTitleTransform}
                        reviewBoxes={reviewCardBoxes}
                        onStartTitleMove={(event) =>
                          startEditableTitleInteraction('review-title', 'move', event)
                        }
                        onStartTitleScale={(event) =>
                          startEditableTitleInteraction('review-title', 'scale', event)
                        }
                        onStartCardMove={(key, event) =>
                          startReviewCardInteraction(key, 'move', event)
                        }
                        onStartCardResize={(key, event) =>
                          startReviewCardInteraction(key, 'resize', event)
                        }
                      />
                    </MaskedContent>
                  </ShellCard>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
