import Image from 'next/image'
import React from 'react'
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
  { label: '起点', tone: 'done' },
  { label: '基础完成', tone: 'done' },
  { label: '第2级', sublabel: '进行中', tone: 'active' },
  { label: '第3级', sublabel: '已锁定', tone: 'locked' },
  { label: '第4级', sublabel: '已锁定', tone: 'locked' },
  { label: '大师奖励', sublabel: '等待解锁', tone: 'treasure' },
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
  { icon: 'english', title: '英语', value: '76%', width: '76%' },
  { icon: 'social', title: '社会', value: '58%', width: '58%' },
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

const reviewCards = [
  {
    icon: 'math',
    title: '代数基础',
    score: '8/10',
    note: '做得好！',
    accent: '#1f73eb',
  },
  {
    icon: 'science',
    title: '物质状态',
    score: '9/10',
    note: '太棒了！',
    accent: '#108f67',
  },
  {
    icon: 'english',
    title: '比喻语言',
    score: '7/10',
    note: '继续加油！',
    accent: '#ff5f1f',
  },
  {
    icon: 'social',
    title: '古代文明',
    score: '8/10',
    note: '做得不错！',
    accent: '#f29b00',
  },
]

const HERO_ART_IMAGE = '/preview/crops/hero-art.png'
const AVATAR_IMAGE = '/preview/crops/avatar-alex.png'
const FLAME_IMAGE = '/preview/crops/flame-camp.png'
const TROPHY_IMAGE = '/preview/crops/trophy-goal.png'

function ShellCard({
  className = '',
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`rounded-[28px] border border-[#ecd9c4] bg-white/[0.94] shadow-[0_22px_54px_-34px_rgba(133,79,26,0.24)] ${className}`}
    >
      {children}
    </div>
  )
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
      className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ebd7c1] bg-white text-[#3b4553] shadow-[0_16px_28px_-22px_rgba(120,72,32,0.32)]"
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
}: {
  variant?: 'profile' | 'sidebar' | 'topbar'
}) {
  const sizeClass =
    variant === 'profile'
      ? 'h-[112px] w-[112px] border-[4px]'
      : variant === 'sidebar'
        ? 'h-[64px] w-[64px] border-[3px]'
        : 'h-9 w-9 border-[2px]'

  return (
    <div
      className={`relative overflow-hidden rounded-full border-[#f2a462] bg-[#ffe6b8] shadow-[0_16px_30px_-24px_rgba(120,72,32,0.45)] ${sizeClass}`}
    >
      <Image
        src={AVATAR_IMAGE}
        alt="Alex 头像"
        fill
        sizes={
          variant === 'profile'
            ? '112px'
            : variant === 'sidebar'
              ? '64px'
              : '36px'
        }
        className="object-cover"
      />
    </div>
  )
}

function HeroArtwork() {
  return (
    <div className="relative min-h-[290px] overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#ffd56c_0%,#ffb942_18%,#ff9a25_58%,#ff7b18_100%)]">
      <Image
        src={HERO_ART_IMAGE}
        alt="学习主视觉插画"
        fill
        sizes="(min-width: 1024px) 520px, 100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0)_26%),linear-gradient(90deg,rgba(255,255,255,0.05)0%,rgba(255,255,255,0)34%)]" />
    </div>
  )
}

function IllustrationCrop({
  src,
  alt,
  className,
  sizes,
  imageClassName,
}: {
  src: string
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

export function DashboardVisualReplica() {
  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top_left,rgba(255,197,101,0.18)_0%,transparent_18%),radial-gradient(circle_at_top_right,rgba(255,244,223,0.85)_0%,transparent_26%),linear-gradient(180deg,#fcf7f0_0%,#f7f0e8_100%)] text-[#242c38]">
      <div className="flex min-h-[100dvh] w-full">
        <aside className="hidden shrink-0 border-r border-[#ecd8c1] bg-white/55 px-3 py-5 backdrop-blur desktop:flex desktop:w-[84px] desktop:flex-col min-[1280px]:w-[244px] min-[1280px]:px-4">
          <div className="flex items-center gap-3 px-2">
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

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[#ecd8c1] bg-[rgba(252,247,240,0.92)] px-4 py-5 backdrop-blur sm:px-6 desktop:px-7">
            <div className="flex items-center justify-between gap-6">
              <div className="min-w-0">
                <h1 className="text-[24px] font-semibold tracking-tight text-[#222b36] sm:text-[28px]">
                  仪表盘
                </h1>
                <p className="mt-1 text-[13px] text-[#66707d] sm:text-[14px]">
                  欢迎回来，Alex
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden min-w-[180px] items-center gap-2 rounded-full border border-[#ebd7c1] bg-white px-4 py-3 shadow-[0_16px_28px_-24px_rgba(120,72,32,0.32)] tablet:flex min-[1280px]:min-w-[210px]">
                  <Search className="h-4 w-4 text-[#677280]" />
                  <span className="text-[14px] text-[#7b8490]">搜索</span>
                </div>
                <HeaderCircleButton>
                  <MessageSquare className="h-4 w-4" />
                </HeaderCircleButton>
                <div className="relative">
                  <HeaderCircleButton>
                    <Bell className="h-4 w-4" />
                  </HeaderCircleButton>
                  <div className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6621] text-[10px] font-semibold text-white">
                    3
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#ebd7c1] bg-white shadow-[0_16px_28px_-24px_rgba(120,72,32,0.32)]"
                >
                  <AvatarIllustration variant="topbar" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 px-3 py-4 sm:px-5 sm:py-5 desktop:px-6 desktop:py-6">
            <div className="mx-auto flex w-full max-w-[1660px] flex-col gap-4 2xl:gap-5">
              <section className="grid gap-4 min-[1280px]:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)] 2xl:grid-cols-[minmax(0,1.22fr)_minmax(430px,0.78fr)]">
                <ShellCard className="overflow-hidden p-0">
                  <div className="grid min-h-[316px] gap-0 tablet:grid-cols-[minmax(0,0.84fr)_minmax(320px,1.16fr)] min-[1400px]:grid-cols-[minmax(0,0.76fr)_minmax(420px,1.24fr)]">
                    <div className="flex flex-col justify-between p-7 sm:p-8">
                      <div>
                        <div className="flex items-center gap-3 text-[#242c38]">
                          <Star className="h-5 w-5 fill-[#ffbe2b] text-[#ef8622]" />
                          <span className="text-[17px] font-semibold tracking-tight">
                            学习总览
                          </span>
                        </div>
                        <h2 className="mt-5 max-w-[320px] text-[40px] font-semibold leading-[1.08] tracking-tight text-[#252d39] sm:text-[48px]">
                          保持你的
                          <br />
                          连胜势头！
                          <span className="ml-3 inline-block">🔥</span>
                        </h2>
                        <p className="mt-4 text-[14px] text-[#596371]">
                          你今天状态很好。
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <div className="flex items-center gap-3 rounded-[16px] border border-[#efd9bf] bg-white/85 px-5 py-3 shadow-[0_16px_28px_-24px_rgba(120,72,32,0.25)]">
                            <Star className="h-6 w-6 fill-[#ffcb29] text-[#f08b1f]" />
                            <div className="text-[14px] font-semibold text-[#222b36]">
                              1240{' '}
                              <span className="ml-1 text-[13px] font-medium text-[#69727f]">
                                XP
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-[16px] border border-[#efd9bf] bg-white/85 px-5 py-3 shadow-[0_16px_28px_-24px_rgba(120,72,32,0.25)]">
                            <Medal className="h-6 w-6 text-[#3ea653]" />
                            <div className="text-[14px] font-semibold text-[#222b36]">
                              7级 探索者
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="mt-8 inline-flex h-14 w-full items-center justify-between rounded-[16px] bg-[linear-gradient(90deg,#ff8a1f_0%,#ff5e18_100%)] px-7 text-[18px] font-semibold text-white shadow-[0_22px_32px_-26px_rgba(255,102,25,0.9)] sm:w-[240px]"
                      >
                        <span>继续学习</span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#ff7d19]">
                          <ChevronRight className="h-5 w-5" />
                        </span>
                      </button>
                    </div>

                    <div className="relative p-4 sm:p-5">
                      <HeroArtwork />
                    </div>
                  </div>
                </ShellCard>

                <div className="space-y-4">
                  <ShellCard className="p-5 sm:p-6">
                    <div className="flex items-center gap-4">
                      <AvatarIllustration />
                      <div className="min-w-0 flex-1">
                        <div className="text-[20px] font-semibold tracking-tight text-[#252d38] sm:text-[24px]">
                          嗨，Alex!
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-[15px] text-[#4d5764]">
                          <Medal className="h-4 w-4 text-[#2ebf69]" />
                          好奇探索者
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 border-t border-[#ecd9c4] pt-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_76px]">
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
                  </ShellCard>

                  <ShellCard className="p-5 sm:p-6">
                    <SectionTitle
                      icon={<BookText className="h-5 w-5" />}
                      title="活动日历"
                    />

                    <div className="mt-5">
                      <div className="grid grid-cols-[56px_repeat(11,minmax(0,1fr))] gap-x-1.5 gap-y-3 text-center text-[12px] text-[#59636f] sm:grid-cols-[66px_repeat(11,minmax(0,1fr))] sm:gap-x-2 sm:text-[13px]">
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

                      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  </ShellCard>
                </div>
              </section>

              <section className="grid gap-4 min-[1280px]:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] 2xl:grid-cols-[minmax(0,1.18fr)_minmax(390px,0.82fr)]">
                <div className="space-y-4">
                  <ShellCard className="p-5 sm:p-6">
                    <SectionTitle
                      icon={<Target className="h-5 w-5" />}
                      title="今日任务"
                    />

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 min-[1500px]:grid-cols-4">
                      {taskCards.map((task) => (
                        <div
                          key={task.title}
                          className="rounded-[20px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ef_100%)] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <SubjectIcon kind={task.icon} />
                            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#e9cfb7] text-[#b89576]">
                              <span className="h-[10px] w-[10px] rounded-full border border-[#d7b595]" />
                            </div>
                          </div>
                          <div className="mt-3 text-[15px] font-semibold text-[#25303c]">
                            {task.title}
                          </div>
                          <div className="mt-1 text-[14px] text-[#455160]">
                            {task.subtitle}
                          </div>
                          <div className="mt-5 flex items-center gap-3">
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
                  </ShellCard>

                  <ShellCard className="overflow-hidden p-5 sm:p-6">
                    <SectionTitle
                      icon={<Compass className="h-5 w-5" />}
                      title="学习路径"
                    />

                    <div className="relative mt-5 rounded-[24px] border border-[#efe1d1] bg-[radial-gradient(circle_at_top_left,rgba(227,244,242,0.75)_0%,transparent_26%),linear-gradient(180deg,#f8fcfb_0%,#fffaf3_100%)] px-5 py-6">
                      <div className="absolute inset-x-10 top-[44%] hidden border-t-2 border-dashed border-[#94a86f] opacity-90 2xl:block" />
                      <div className="grid gap-6 sm:grid-cols-2 desktop:grid-cols-3 2xl:grid-cols-6">
                        {pathSteps.map((step, index) => (
                          <div
                            key={step.label}
                            className="relative text-center"
                          >
                            <div
                              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[4px] shadow-[0_18px_30px_-22px_rgba(120,72,32,0.34)] ${
                                step.tone === 'done'
                                  ? 'border-[#5bc36a] bg-[linear-gradient(180deg,#60d385_0%,#27b887_100%)] text-white'
                                  : step.tone === 'active'
                                    ? 'border-[#ffa648] bg-[linear-gradient(180deg,#ffab38_0%,#ff7a1f_100%)] text-white'
                                    : step.tone === 'treasure'
                                      ? 'border-[#ffb43d] bg-[linear-gradient(180deg,#ffd95b_0%,#ffb82a_100%)] text-[#af6700]'
                                      : 'border-[#d9d7dd] bg-[linear-gradient(180deg,#f2f2f5_0%,#d8dce2_100%)] text-[#727a86]'
                              }`}
                            >
                              {step.tone === 'done' ? (
                                <span className="text-[24px] font-semibold">
                                  ✓
                                </span>
                              ) : step.tone === 'active' ? (
                                <Compass className="h-7 w-7" />
                              ) : step.tone === 'treasure' ? (
                                <Gift className="h-7 w-7" />
                              ) : (
                                <span className="text-[18px] font-semibold">
                                  🔒
                                </span>
                              )}
                            </div>
                            <div className="mt-3 text-[14px] font-semibold text-[#2c3541]">
                              {step.label}
                            </div>
                            {step.sublabel ? (
                              <div
                                className={`mt-1 text-[13px] ${
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
                            {index === 2 ? (
                              <div className="absolute left-1/2 top-[-18px] h-7 w-7 -translate-x-1/2 rounded-full bg-[#ff8a20] text-white shadow-[0_12px_22px_-18px_rgba(255,102,25,0.8)]">
                                <div className="flex h-full items-center justify-center text-[14px]">
                                  📍
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </ShellCard>
                </div>

                <div className="space-y-4">
                  <ShellCard className="p-5 sm:p-6">
                    <SectionTitle
                      icon={<Compass className="h-5 w-5" />}
                      title="学习时长分布"
                    />

                    <div className="mt-5 flex flex-col gap-5">
                      <div className="mx-auto flex h-[170px] w-[170px] items-center justify-center rounded-full bg-[conic-gradient(#2f8bff_0deg_126deg,#24b892_126deg_223deg,#ff6940_223deg_306deg,#ffb930_306deg_349deg,#b6b1aa_349deg_360deg)]">
                        <div className="flex h-[112px] w-[112px] flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(236,217,196,0.7)]">
                          <div className="text-[17px] font-semibold text-[#2a3340]">
                            本周
                          </div>
                          <div className="mt-1 text-[14px] text-[#4f5966]">
                            6小时30分
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0 space-y-3">
                        {subjectStats.map((item) => (
                          <div
                            key={item.label}
                            className="grid grid-cols-[10px_minmax(0,1fr)_auto_auto] items-center gap-3 text-[13px]"
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
                  </ShellCard>

                  <ShellCard className="p-5 sm:p-6">
                    <SectionTitle
                      icon={<BookOpen className="h-5 w-5" />}
                      title="科目进度"
                    />

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 min-[1280px]:grid-cols-1 2xl:grid-cols-2">
                      {subjectCards.map((item) => (
                        <div
                          key={item.title}
                          className="rounded-[20px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8ef_100%)] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="origin-left scale-[0.86]">
                              <SubjectIcon kind={item.icon} />
                            </div>
                            <div className="text-right">
                              <div className="text-[14px] font-semibold text-[#24303b]">
                                {item.title}
                              </div>
                              <div className="mt-1 text-[22px] font-semibold leading-none tracking-tight text-[#1f2935]">
                                {item.value}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <ProgressTrack
                              value={item.width}
                              color={
                                item.icon === 'math'
                                  ? '#1f73eb'
                                  : item.icon === 'science'
                                    ? '#21b287'
                                    : item.icon === 'english'
                                      ? '#ff5a2b'
                                      : '#ffb300'
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ShellCard>
                </div>
              </section>

              <section className="space-y-4">
                <div className="grid gap-4 desktop:grid-cols-2">
                  <ShellCard className="overflow-hidden p-5 sm:p-6">
                    <SectionTitle
                      icon={<Flame className="h-5 w-5" />}
                      title="连续性"
                    />

                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="text-[56px] font-semibold leading-none tracking-tight text-[#ff6b1c]">
                          <span className="inline-flex items-end gap-1 whitespace-nowrap">
                            <span>14</span>
                            <span className="pb-1 text-[20px]">天</span>
                          </span>
                        </div>
                        <div className="mt-2 text-[14px] font-semibold text-[#24303b]">
                          连续学习
                        </div>
                        <div className="mt-2 text-[14px] text-[#ff6f1d]">
                          表现很棒！
                        </div>
                      </div>
                      <IllustrationCrop
                        src={FLAME_IMAGE}
                        alt="连续学习火焰插画"
                        sizes="(min-width: 1280px) 182px, 150px"
                        className="h-[116px] w-[150px] self-center sm:self-auto"
                        imageClassName="object-contain object-center"
                      />
                    </div>

                    <div className="bg-white/82 mt-5 rounded-[18px] border border-[#ecd9c4] px-4 py-3">
                      <div className="flex items-center justify-between text-[12px] text-[#67727e]">
                        {streakDays.map((day, index) => (
                          <span key={`${day}-${index}`}>{day}</span>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-1.5">
                        {streakDays.map((_, index) => (
                          <div
                            key={index}
                            className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
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
                  </ShellCard>

                  <ShellCard className="p-5 sm:p-6">
                    <SectionTitle
                      icon={<Trophy className="h-5 w-5" />}
                      title="本周目标进度"
                    />

                    <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-medium text-[#414b57]">
                          进展不错！
                        </div>
                        <div className="mt-3 text-[62px] font-semibold leading-none tracking-tight text-[#ff6d1b]">
                          72%
                        </div>
                        <div className="mt-3 text-[15px] text-[#4b5663]">
                          已完成 5 / 7 个任务
                        </div>
                        <div className="mt-8 h-[18px] overflow-hidden rounded-full bg-[#f2e5d8]">
                          <div className="h-full w-[72%] rounded-full bg-[linear-gradient(90deg,#ff8b1e_0%,#ff5f18_100%)]" />
                        </div>
                      </div>

                      <IllustrationCrop
                        src={TROPHY_IMAGE}
                        alt="本周目标奖杯插画"
                        sizes="(min-width: 1280px) 178px, 160px"
                        className="h-[160px] w-[168px] shrink-0 self-center sm:self-auto"
                        imageClassName="object-contain object-center"
                      />
                    </div>
                  </ShellCard>
                </div>

                <ShellCard className="p-5 sm:p-6">
                  <SectionTitle
                    icon={<BookText className="h-5 w-5" />}
                    title="最近练习回顾"
                    action={
                      <button
                        type="button"
                        className="rounded-full border border-[#ebd7c1] bg-white px-4 py-2 text-[13px] font-medium text-[#5c6673]"
                      >
                        查看全部
                      </button>
                    }
                  />

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 min-[1500px]:grid-cols-4">
                    {reviewCards.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-[22px] border border-[#ecd9c4] bg-[linear-gradient(180deg,#fbfdff_0%,#fff9f1_100%)] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <SubjectIcon kind={item.icon} />
                          <div className="text-[14px] font-medium text-[#41505c]">
                            {item.title}
                          </div>
                        </div>
                        <div
                          className="mt-7 text-[50px] font-semibold leading-none tracking-tight"
                          style={{ color: item.accent }}
                        >
                          {item.score}
                        </div>
                        <div
                          className="mt-4 text-[16px] font-medium"
                          style={{ color: item.accent }}
                        >
                          {item.note}
                        </div>
                        <div className="mt-5 flex justify-end">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff2cf] text-[24px]">
                            {item.icon === 'english' || item.icon === 'social'
                              ? '🙂'
                              : '⭐'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ShellCard>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
