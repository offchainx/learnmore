'use client'

import React, {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useFormStatus } from 'react-dom'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/labeled-input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useApp } from '@/providers'
import type { Lang } from '@/providers/app-provider'
import { updateProfile } from '@/actions/user/profile'
import { updateAIConfig } from '@/actions/user/settings'
import { generateInviteCode } from '@/actions/user/parent'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/actions/notification/preferences'
import { cancelSubscriptionAction } from '@/actions/billing/stripe'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useHandleAvailability } from '@/lib/hooks/useHandleAvailability'
import { PageHeroShell } from '@/components/shared/PageHeroShell'
import { PageHeroTitle } from '@/components/shared/PageHeroTitle'
import {
  pageCardTitleClass,
  pageHeroNumericValueClass,
  pageKickerClass,
  pageMetaTextClass,
  pageNumericValueClass,
  pageSectionDescriptionClass,
  pageSectionTitleClass,
} from '@/components/shared/pageTypography'
import {
  pageBadgeClass,
  pageHeroShellClass,
  pageInputClass,
  pageInsetClass,
  pagePanelClass,
  pagePanelStrongClass,
  pagePillActiveClass,
  pagePillInactiveClass,
  pageSegmentedButtonClass,
  pageShellFrameClass,
  pageSoftInsetClass,
} from '@/components/shared/pageSurfaces'
import {
  pageCardPaddingClass,
  pageGridGapClass,
  pageSectionGapClass,
} from '@/components/shared/pageSpacing'
import {
  Bell,
  Bot,
  Brain,
  Camera,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Copy,
  CreditCard,
  Gift,
  Glasses,
  Globe,
  Link as LinkIcon,
  Moon,
  Shield,
  Sparkles,
  Sun,
  User,
  Users,
  Zap,
} from 'lucide-react'

type TabId =
  | 'profile'
  | 'ai-config'
  | 'notifications'
  | 'account'
  | 'subscription'

const SETTINGS_SECTIONS: TabId[] = [
  'profile',
  'ai-config',
  'notifications',
  'account',
  'subscription',
]

function isTabId(value: string | null): value is TabId {
  return value !== null && SETTINGS_SECTIONS.includes(value as TabId)
}

type NotificationPreferenceKey =
  | 'inAppSystem'
  | 'inAppSocial'
  | 'inAppStudy'
  | 'inAppAchievement'
  | 'emailSystem'
  | 'emailSocial'
  | 'emailWeekly'
  | 'emailMarketing'

type NotificationPreferenceState = Record<NotificationPreferenceKey, boolean>

type NotificationMatrixRow = {
  label: string
  description: string
  inApp: NotificationPreferenceKey | null
  email: NotificationPreferenceKey | null
  alwaysOn?: boolean
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferenceState = {
  inAppSystem: true,
  inAppSocial: true,
  inAppStudy: true,
  inAppAchievement: true,
  emailSystem: true,
  emailSocial: true,
  emailWeekly: true,
  emailMarketing: true,
}

const NOTIFICATION_MATRIX: NotificationMatrixRow[] = [
  {
    label: '社交互动',
    description: '帖子回复与评论',
    inApp: 'inAppSocial',
    email: 'emailSocial',
  },
  {
    label: '系统通知',
    description: '版本更新和重要公告',
    inApp: 'inAppSystem',
    email: 'emailSystem',
  },
  {
    label: '成就提醒',
    description: '徽章、等级和里程碑变动',
    inApp: 'inAppAchievement',
    email: null,
  },
  {
    label: '学习提醒',
    description: '学习节奏与进度提醒',
    inApp: 'inAppStudy',
    email: null,
  },
  {
    label: '支付确认',
    description: '账单与订阅变更通知',
    inApp: null,
    email: null,
    alwaysOn: true,
  },
  {
    label: '学习周报',
    description: '每周学习总结与趋势',
    inApp: null,
    email: 'emailWeekly',
  },
  {
    label: '活动信息',
    description: '优惠与活动提醒',
    inApp: null,
    email: 'emailMarketing',
  },
]

const surfaceClassName = pagePanelClass

const insetCardClassName = pageInsetClass

const inputClassName = `${pageInputClass} h-12 rounded-2xl px-4`

const choiceActiveClass =
  'border-blue-200 bg-surface-selected text-sky-700 shadow-surface dark:border-sky-400/28 dark:bg-sky-400/12 dark:text-white'

const choiceIdleClass =
  'border-borderTone bg-surface text-text-secondary hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary dark:hover:bg-surface-selected dark:hover:text-white'

const choiceButtonClass = `${pageSegmentedButtonClass} flex w-full items-center justify-between rounded-2xl border`

const subtleButtonClass =
  'h-11 rounded-full border border-borderTone bg-surface-subtle px-4 text-text-primary hover:bg-surface-selected hover:text-sky-700 dark:border-borderTone dark:bg-surface-subtle dark:text-text-primary dark:hover:bg-surface-selected'

const dataBlockClass =
  'rounded-2xl border border-borderTone bg-surface-subtle px-4 py-3 text-text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-white'

const initialState = { error: undefined, success: undefined }

type ThemePreference = 'light' | 'dark' | 'system'

function isLangPreference(value: string | null | undefined): value is Lang {
  return value === 'en' || value === 'zh' || value === 'ms'
}

function isThemePreference(
  value: string | null | undefined
): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

type UserProfile = {
  id: string
  email: string
  username: string | null
  handle: string | null
  avatar: string | null
  grade: number | null
  role: string
  subscriptionTier?: string | null
  subscriptionStatus?: string | null
  subscriptionStart?: Date | string | null
  subscriptionEnd?: Date | string | null
  cancelAtPeriodEnd?: boolean
  stripeSubscriptionId?: string | null
  firstPaidAt?: Date | string | null
  referralsGiven?: Array<{
    id: string
    deferredRewardWeeks: number
    deferredRewardTier: string | null
  }>
  settings: {
    aiPersonality?: string | null
    difficultyCalibration?: number | null
    language?: string | null
    theme?: string | null
    notificationDaily?: boolean | null
    notificationWeekly?: boolean | null
  } | null
  referralCode: string | null
  referralCount: number
  referralLimit: number
}

type SettingsViewProps = {
  user?: UserProfile | null
}

function SectionSubmitButton({
  idleLabel,
  pendingLabel,
  disabled = false,
}: {
  idleLabel: string
  pendingLabel: string
  disabled?: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="h-11 rounded-full px-5 text-sm font-semibold"
      isLoading={pending}
      loadingText={pendingLabel}
      disabled={disabled || pending}
    >
      {idleLabel}
    </Button>
  )
}

function NotificationPreferencesSkeleton() {
  return (
    <div
      className="space-y-4"
      data-settings-section-loading="notifications"
    >
      <div className="overflow-hidden rounded-[28px] border border-borderTone bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle">
        <div className="grid grid-cols-[minmax(0,1fr)_88px_88px] border-b border-borderTone px-5 py-3 dark:border-borderTone">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="mx-auto h-3 w-10 rounded-full" />
          <Skeleton className="mx-auto h-3 w-10 rounded-full" />
        </div>
        {Array.from({ length: NOTIFICATION_MATRIX.length }).map((_, index) => (
          <div
            key={`notif-skeleton-${index}`}
            className={cn(
              'grid grid-cols-[minmax(0,1fr)_88px_88px] items-center px-5 py-4',
              index !== NOTIFICATION_MATRIX.length - 1 &&
                'border-b border-borderTone dark:border-borderTone'
            )}
          >
            <div className="space-y-2 pr-4">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-3 w-40 rounded-full" />
            </div>
            <div className="flex items-center justify-center">
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
            <div className="flex items-center justify-center">
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-48 rounded-full" />
        <Skeleton className="h-11 w-32 rounded-full" />
      </div>
    </div>
  )
}

function SettingsSection({
  id,
  title,
  description,
  icon: Icon,
  badge,
  children,
  sectionRef,
  headerRef,
}: {
  id: TabId
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children: React.ReactNode
  sectionRef: (node: HTMLElement | null) => void
  headerRef?: (node: HTMLDivElement | null) => void
}) {
  return (
    <section
      id={id}
      data-section-id={id}
      ref={sectionRef}
      className={`${surfaceClassName} overflow-hidden ${pageCardPaddingClass}`}
    >
      <div
        ref={headerRef}
        className="flex flex-col gap-4 border-b border-borderTone pb-5 dark:border-borderTone desktop:flex-row desktop:items-start desktop:justify-between"
      >
        <div className="space-y-3">
          <div className={pageBadgeClass}>
            <Icon className="h-3.5 w-3.5 text-sky-600 dark:text-sky-300" />
            {title}
          </div>
          <div>
            <h2 className={pageSectionTitleClass}>{title}</h2>
            <p className={`mt-2 max-w-3xl ${pageSectionDescriptionClass}`}>
              {description}
            </p>
          </div>
        </div>
        {badge ? (
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
            {badge}
          </div>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

function ReferralSection({
  user,
  lang,
}: {
  user: {
    referralCode: string | null
    referralCount: number
  }
  lang: 'en' | 'zh' | 'ms'
}) {
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const copy = useMemo(() => {
    if (lang === 'zh') {
      return {
        title: '推荐好友',
        desc: '邀请好友注册并完成付费，双方都能获得额外会员奖励。',
        code: '您的推荐码',
        link: '推荐入口链接',
        copyCode: '复制推荐码',
        copyLink: '复制链接',
        copied: '已复制',
        empty: '未生成',
        reward: '奖励规则',
        rule1: '好友在升级流程填写您的推荐码并完成首笔真实扣款后开始结算。',
        rule2: '你可获得 2 周额外会员时长。',
        rule3: '好友可获得 2 周额外会员时长。',
        rule4: `您已成功推荐 ${user.referralCount} 位好友，当前不设上限。`,
      }
    }

    if (lang === 'ms') {
      return {
        title: 'Rujuk rakan',
        desc: 'Jemput rakan mendaftar dan melanggan. Kedua-dua pihak akan menerima ganjaran masa ahli.',
        code: 'Kod rujukan anda',
        link: 'Pautan rujukan',
        copyCode: 'Salin kod',
        copyLink: 'Salin pautan',
        copied: 'Disalin',
        empty: 'Belum dijana',
        reward: 'Peraturan ganjaran',
        rule1:
          'Ganjaran dikira selepas rakan melengkapkan bayaran sebenar pertama dengan kod anda.',
        rule2: 'Anda menerima tambahan 2 minggu keahlian.',
        rule3: 'Rakan anda juga menerima tambahan 2 minggu keahlian.',
        rule4: `Anda telah berjaya merujuk ${user.referralCount} rakan setakat ini.`,
      }
    }

    return {
      title: 'Refer friends',
      desc: 'Invite friends to sign up and complete a paid subscription. Both of you unlock extra membership time.',
      code: 'Your referral code',
      link: 'Referral link',
      copyCode: 'Copy code',
      copyLink: 'Copy link',
      copied: 'Copied',
      empty: 'Not generated',
      reward: 'Reward rules',
      rule1:
        'Rewards are settled after the first real paid renewal with your code.',
      rule2: 'You receive 2 extra weeks of membership.',
      rule3: 'Your friend receives 2 extra weeks of membership.',
      rule4: `You have referred ${user.referralCount} friends so far.`,
    }
  }, [lang, user.referralCount])

  const referralPath = '/pricing'

  const handleCopyCode = async () => {
    if (!user.referralCode) return
    await navigator.clipboard.writeText(user.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const handleCopyLink = async () => {
    const referralUrl =
      typeof window === 'undefined'
        ? referralPath
        : `${window.location.origin}${referralPath}`
    await navigator.clipboard.writeText(referralUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 1800)
  }

  return (
    <div className={`${surfaceClassName} ${pageCardPaddingClass}`}>
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-400/20 dark:bg-emerald-400/10">
          <Gift className="h-5 w-5 text-emerald-300" />
        </div>
        <div>
          <div className="text-[18px] font-semibold text-text-primary dark:text-white">
            {copy.title}
          </div>
          <div className="mt-1 text-sm leading-6 text-text-secondary dark:text-text-secondary">
            {copy.desc}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 desktop:grid-cols-2">
        <div className={`${insetCardClassName} p-4`}>
          <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.18em] text-text-tertiary dark:text-text-tertiary">
            {copy.code}
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`${dataBlockClass} min-w-0 flex-1 text-center font-mono text-lg tracking-[0.3em]`}
            >
              {user.referralCode || copy.empty}
            </div>
            <Button
              type="button"
              variant="outline"
              className={subtleButtonClass}
              onClick={handleCopyCode}
              disabled={!user.referralCode}
            >
              {copied ? copy.copied : copy.copyCode}
            </Button>
          </div>
        </div>

        <div className={`${insetCardClassName} p-4`}>
          <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.18em] text-text-tertiary dark:text-text-tertiary">
            {copy.link}
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`${dataBlockClass} min-w-0 flex-1 truncate text-sm`}
            >
              {referralPath}
            </div>
            <Button
              type="button"
              variant="outline"
              className={subtleButtonClass}
              onClick={handleCopyLink}
            >
              {copiedLink ? copy.copied : copy.copyLink}
            </Button>
          </div>
        </div>
      </div>

      <div className={`${insetCardClassName} mt-4 p-4`}>
        <div className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-text-primary dark:text-white">
          <Users className="h-4 w-4 text-sky-300" />
          {copy.reward}
        </div>
        <ul className="space-y-2 text-sm leading-6 text-text-secondary dark:text-text-secondary">
          {[copy.rule1, copy.rule2, copy.rule3, copy.rule4].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export const SettingsView = ({ user }: SettingsViewProps) => {
  const { t, lang, setLang, theme, setThemePreference } = useApp()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabFromQuery = searchParams.get('tab')
  const [activeSection, setActiveSection] = useState<TabId>(
    isTabId(tabFromQuery) ? tabFromQuery : 'profile'
  )

  const [profileState, profileAction] = useActionState(
    updateProfile,
    initialState
  )
  const [aiConfigState, aiConfigAction] = useActionState(
    updateAIConfig,
    initialState
  )

  const [selectedTutor, setSelectedTutor] = useState<
    'encouraging' | 'socratic' | 'strict'
  >(
    (user?.settings?.aiPersonality?.toLowerCase() as
      | 'encouraging'
      | 'socratic'
      | 'strict') || 'encouraging'
  )
  const [difficulty, setDifficulty] = useState(
    user?.settings?.difficultyCalibration || 60
  )
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferenceState>(
    DEFAULT_NOTIFICATION_PREFS
  )
  const [initialNotifPrefs, setInitialNotifPrefs] =
    useState<NotificationPreferenceState>(DEFAULT_NOTIFICATION_PREFS)
  const [isNotifLoading, setIsNotifLoading] = useState(true)
  const [isNotifSaving, setIsNotifSaving] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const sectionRefs = useRef<Record<TabId, HTMLElement | null>>({
    profile: null,
    'ai-config': null,
    notifications: null,
    account: null,
    subscription: null,
  })
  const sectionHeaderRefs = useRef<Record<TabId, HTMLDivElement | null>>({
    profile: null,
    'ai-config': null,
    notifications: null,
    account: null,
    subscription: null,
  })
  const persistedLang = isLangPreference(user?.settings?.language)
    ? user.settings.language
    : lang
  const persistedTheme = isThemePreference(user?.settings?.theme)
    ? user.settings.theme
    : isThemePreference(theme)
      ? theme
      : 'system'
  const [profileLang, setProfileLang] = useState<Lang>(persistedLang)
  const [profileTheme, setProfileTheme] =
    useState<ThemePreference>(persistedTheme)
  const [profileHandle, setProfileHandle] = useState(user?.handle || '')
  const profilePreferenceSyncRef = useRef(false)
  const handleAvailability = useHandleAvailability(profileHandle, user?.handle)

  const copy = useMemo(() => {
    if (lang === 'zh') {
      return {
        heroBadge: 'Preference Console',
        heroTitle: '设置',
        heroSub:
          '把个人资料、AI 配置、通知、账户安全与订阅管理放在同一张工作台里，减少跳转和重复操作。',
        navHint: '页内导航',
        navSub: '点击后滚动到对应设置区块。',
        profileDesc:
          '维护公开展示信息、语言与外观偏好，让个人资料与 Dashboard 视觉保持一致。',
        aiDesc: '统一调整导师风格、难度校准与当前课程体系，避免多级设置切换。',
        notificationsDesc:
          '按渠道管理提醒偏好，支付确认保持强制开启，其他通知支持自由组合。',
        accountDesc:
          '管理家长连接、推荐关系和账户相关能力，保留增长入口但收口到同一页。',
        subscriptionDesc:
          '查看当前套餐、到期状态和推荐奖励待结算情况，在同一区域完成升级与续费决策。',
        preferenceSaveHint: '保存后同步到当前设备与账号偏好。',
        notificationPending: '有未保存的通知改动。',
        subscriptionHealthy: '当前按计划续期。',
        savedToAccount: '已同步到当前账号偏好。',
        profileSave: '保存个人资料',
        aiSave: '保存 AI 配置',
        notifSave: '保存通知偏好',
        profileSaving: '保存中...',
        aiSaving: '保存中...',
        notifSaving: '保存中...',
        profileSuccess: '个人资料已更新',
        aiSuccess: 'AI 配置已更新',
        handleLabel: '账号标识',
        handleHint: '用于后续社区 @提及与用户识别，系统会自动转成小写并拦截保留词。',
        handleChecking: '正在检查账号标识是否可用...',
        handleAvailable: '账号标识可用，将保存为',
        gradeLabel: '年级',
        emailLabel: '邮箱地址',
        avatarLabel: '头像',
        avatarHint: '当前先保留头像展示，上传入口后续再接入真实链路。',
        appearance: '外观',
        language: '语言 / Bahasa',
        darkMode: '深色模式',
        lightMode: '浅色模式',
        systemMode: '跟随系统',
        tutorCurrent: '当前导师',
        curriculumNote: '当前课程体系',
        notificationsSaved: '通知偏好已更新',
        notificationsFailed: '通知偏好保存失败，请稍后重试。',
        parentTitle: '家长连接',
        parentDesc: '生成邀请码后即可邀请家长绑定，便于同步学习进度与提醒。',
        parentWaiting: '等待家长加入',
        parentDisconnected: '尚未连接',
        inviteCode: '邀请码',
        generateInviteCode: '生成邀请码',
        generating: '生成中...',
        copyCode: '复制邀请码',
        copied: '已复制',
        accountSummary: '账户概览',
        currentPlan: '当前套餐',
        nextCharge: '下次扣款 / 到期时间',
        freeTier: '免费版长期有效',
        upgrade: '升级套餐',
        cancelPlan: '到期取消',
        canceling: '提交中...',
        canceledStatus: '已设置到期取消',
        pendingReward: '待结算推荐奖励',
        notificationChannels: '渠道偏好',
        inApp: '站内',
        email: '邮件',
        noChange: '当前没有新的改动需要保存。',
      }
    }

    if (lang === 'ms') {
      return {
        heroBadge: 'Preference Console',
        heroTitle: 'Tetapan',
        heroSub:
          'Satukan profil, konfigurasi AI, notifikasi, keselamatan akaun dan langganan dalam satu workspace.',
        navHint: 'Navigasi halaman',
        navSub: 'Klik untuk pergi ke seksyen tetapan yang berkaitan.',
        profileDesc:
          'Urus profil awam, bahasa dan rupa supaya ia selari dengan gaya Dashboard.',
        aiDesc:
          'Laraskan gaya tutor, tahap kesukaran dan kurikulum aktif tanpa perlu berpindah-pindah tab.',
        notificationsDesc:
          'Kawal notifikasi mengikut saluran. Pengesahan pembayaran sentiasa aktif.',
        accountDesc:
          'Urus sambungan ibu bapa, kod jemputan dan modul pertumbuhan dalam seksyen yang sama.',
        subscriptionDesc:
          'Semak pelan, tempoh tamat dan ganjaran rujukan yang masih menunggu penyelesaian.',
        preferenceSaveHint:
          'Simpan dahulu untuk diselaraskan ke peranti ini dan keutamaan akaun.',
        notificationPending:
          'Terdapat perubahan notifikasi yang belum disimpan.',
        subscriptionHealthy: 'Langganan sedang diperbaharui seperti biasa.',
        savedToAccount: 'Telah diselaraskan ke keutamaan akaun semasa.',
        profileSave: 'Simpan profil',
        aiSave: 'Simpan AI',
        notifSave: 'Simpan notifikasi',
        profileSaving: 'Menyimpan...',
        aiSaving: 'Menyimpan...',
        notifSaving: 'Menyimpan...',
        profileSuccess: 'Profil dikemas kini',
        aiSuccess: 'Konfigurasi AI dikemas kini',
        handleLabel: 'Handle',
        handleHint: 'Digunakan untuk @sebutan komuniti dan identiti pengguna. Sistem akan menyimpan dalam huruf kecil.',
        handleChecking: 'Sedang menyemak ketersediaan handle...',
        handleAvailable: 'Handle tersedia dan akan disimpan sebagai',
        gradeLabel: 'Tingkatan',
        emailLabel: 'Emel',
        avatarLabel: 'Avatar',
        avatarHint:
          'Paparan avatar dikekalkan dahulu. Muat naik sebenar akan disambung kemudian.',
        appearance: 'Rupa',
        language: 'Bahasa',
        darkMode: 'Mod gelap',
        lightMode: 'Mod cerah',
        systemMode: 'Ikut sistem',
        tutorCurrent: 'Tutor semasa',
        curriculumNote: 'Kurikulum aktif',
        notificationsSaved: 'Keutamaan notifikasi telah dikemas kini',
        notificationsFailed:
          'Gagal menyimpan notifikasi. Cuba lagi sebentar lagi.',
        parentTitle: 'Sambungan ibu bapa',
        parentDesc:
          'Jana kod jemputan untuk menyambungkan akaun ibu bapa dan berkongsi kemajuan belajar.',
        parentWaiting: 'Menunggu ibu bapa',
        parentDisconnected: 'Belum disambungkan',
        inviteCode: 'Kod jemputan',
        generateInviteCode: 'Jana kod',
        generating: 'Menjana...',
        copyCode: 'Salin kod',
        copied: 'Disalin',
        accountSummary: 'Ringkasan akaun',
        currentPlan: 'Pelan semasa',
        nextCharge: 'Caj seterusnya / tamat tempoh',
        freeTier: 'Pelan percuma tidak luput',
        upgrade: 'Naik taraf',
        cancelPlan: 'Batal pada tempoh tamat',
        canceling: 'Menghantar...',
        canceledStatus: 'Sudah ditanda untuk dibatalkan',
        pendingReward: 'Ganjaran rujukan tertunda',
        notificationChannels: 'Saluran',
        inApp: 'Dalam app',
        email: 'Emel',
        noChange: 'Tiada perubahan baharu untuk disimpan.',
      }
    }

    return {
      heroBadge: 'Preference Console',
      heroTitle: 'Settings',
      heroSub:
        'Bring profile, AI config, notifications, account and subscription into one dashboard-style workspace.',
      navHint: 'Page navigation',
      navSub: 'Jump to each settings section without switching tabs.',
      profileDesc:
        'Maintain public profile, language and appearance in one place.',
      aiDesc:
        'Tune tutor style, difficulty calibration and active curriculum without leaving the page.',
      notificationsDesc:
        'Manage notification channels in one matrix while keeping billing notices always on.',
      accountDesc:
        'Handle parent connection, invite code and referral tools inside the same console.',
      subscriptionDesc:
        'Review your plan, renewal status and pending referral rewards in one area.',
      preferenceSaveHint:
        'Save first to sync this device and your account preference.',
      notificationPending:
        'You have notification changes that are not saved yet.',
      subscriptionHealthy: 'Your subscription is renewing as scheduled.',
      savedToAccount: 'Synced to your current account preference.',
      profileSave: 'Save profile',
      aiSave: 'Save AI config',
      notifSave: 'Save notifications',
      profileSaving: 'Saving...',
      aiSaving: 'Saving...',
      notifSaving: 'Saving...',
      profileSuccess: 'Profile updated',
      aiSuccess: 'AI config updated',
      handleLabel: 'Handle',
      handleHint:
        'Used for future community @mentions and identity. The system stores it in lowercase and blocks reserved words.',
      handleChecking: 'Checking handle availability...',
      handleAvailable: 'Handle is available and will be saved as',
      gradeLabel: 'Grade',
      emailLabel: 'Email',
      avatarLabel: 'Avatar',
      avatarHint:
        'Avatar display is kept for now. Upload flow can be wired later.',
      appearance: 'Appearance',
      language: 'Language',
      darkMode: 'Dark mode',
      lightMode: 'Light mode',
      systemMode: 'System',
      tutorCurrent: 'Current tutor',
      curriculumNote: 'Active curriculum',
      notificationsSaved: 'Notification preferences updated',
      notificationsFailed:
        'Failed to save notification preferences. Please try again later.',
      parentTitle: 'Parent connection',
      parentDesc:
        'Generate an invite code to connect a parent account and share progress updates.',
      parentWaiting: 'Waiting for parent',
      parentDisconnected: 'Not connected',
      inviteCode: 'Invite code',
      generateInviteCode: 'Generate code',
      generating: 'Generating...',
      copyCode: 'Copy code',
      copied: 'Copied',
      accountSummary: 'Account summary',
      currentPlan: 'Current plan',
      nextCharge: 'Next charge / end date',
      freeTier: 'Free tier does not expire',
      upgrade: 'Upgrade plan',
      cancelPlan: 'Cancel at period end',
      canceling: 'Submitting...',
      canceledStatus: 'Cancel at period end enabled',
      pendingReward: 'Pending referral rewards',
      notificationChannels: 'Channels',
      inApp: 'In-app',
      email: 'Email',
      noChange: 'No new changes to save.',
    }
  }, [lang])

  const handleHelperText =
    handleAvailability.status === 'checking'
      ? copy.handleChecking
      : handleAvailability.status === 'available'
        ? `${copy.handleAvailable} @${handleAvailability.normalizedHandle}`
        : handleAvailability.status === 'unavailable'
          ? handleAvailability.reason || copy.handleHint
          : copy.handleHint

  const menuItems = useMemo(
    () => [
      {
        id: 'profile' as TabId,
        label: t.settings.tabs.profile,
        desc: copy.profileDesc,
        icon: User,
      },
      {
        id: 'ai-config' as TabId,
        label: t.settings.tabs.aiConfig,
        desc: copy.aiDesc,
        icon: Brain,
      },
      {
        id: 'notifications' as TabId,
        label: t.settings.tabs.notifications,
        desc: copy.notificationsDesc,
        icon: Bell,
      },
      {
        id: 'account' as TabId,
        label: t.settings.tabs.account,
        desc: copy.accountDesc,
        icon: Shield,
      },
      {
        id: 'subscription' as TabId,
        label: t.settings.tabs.subscription,
        desc: copy.subscriptionDesc,
        icon: CreditCard,
      },
    ],
    [copy, t.settings.tabs]
  )

  const tierLabelMap = useMemo(() => {
    if (lang === 'zh') {
      return {
        STARTER: 'Starter',
        STANDARD: 'Standard',
        SMART_PLUS: 'Smart Plus',
        PREMIER: 'Premier',
      }
    }
    return {
      STARTER: 'Starter',
      STANDARD: 'Standard',
      SMART_PLUS: 'Smart Plus',
      PREMIER: 'Premier',
    }
  }, [lang])

  const tierToneMap = useMemo(
    () => ({
      STARTER: {
        capsule:
          'border-slate-400/18 bg-slate-400/10 text-slate-100 shadow-[0_0_0_1px_rgba(148,163,184,0.08)]',
        accent: 'text-slate-200',
        icon: Shield,
      },
      STANDARD: {
        capsule:
          'border-blue-400/24 bg-blue-500/12 text-blue-100 shadow-[0_10px_25px_rgba(59,130,246,0.14)]',
        accent: 'text-blue-200',
        icon: CircleCheck,
      },
      SMART_PLUS: {
        capsule:
          'border-cyan-400/24 bg-cyan-400/12 text-cyan-100 shadow-[0_10px_25px_rgba(34,211,238,0.14)]',
        accent: 'text-cyan-200',
        icon: Sparkles,
      },
      PREMIER: {
        capsule:
          'border-amber-400/26 bg-amber-400/12 text-amber-100 shadow-[0_10px_25px_rgba(251,191,36,0.16)]',
        accent: 'text-amber-200',
        icon: Zap,
      },
    }),
    []
  )

  const statusLabelMap = useMemo(() => {
    if (lang === 'zh') {
      return {
        TRIALING: '试用中',
        ACTIVE: '已生效',
        CANCEL_AT_PERIOD_END: '到期取消',
        CANCELED: '已取消',
        PAST_DUE: '逾期待处理',
      }
    }
    if (lang === 'ms') {
      return {
        TRIALING: 'Percubaan',
        ACTIVE: 'Aktif',
        CANCEL_AT_PERIOD_END: 'Batal di hujung tempoh',
        CANCELED: 'Dibatalkan',
        PAST_DUE: 'Tertunggak',
      }
    }
    return {
      TRIALING: 'Trialing',
      ACTIVE: 'Active',
      CANCEL_AT_PERIOD_END: 'Cancel at period end',
      CANCELED: 'Canceled',
      PAST_DUE: 'Past due',
    }
  }, [lang])

  const normalizedTier = (user?.subscriptionTier || 'STARTER').toUpperCase()
  const normalizedStatus = (
    user?.subscriptionStatus || 'CANCELED'
  ).toUpperCase()
  const subscriptionEndDate = user?.subscriptionEnd
    ? new Date(user.subscriptionEnd)
    : null
  const pendingDeferredRewards = user?.referralsGiven || []
  const pendingDeferredWeeks = pendingDeferredRewards.reduce(
    (total, item) => total + (item.deferredRewardWeeks || 0),
    0
  )
  const notifDirty =
    JSON.stringify(notifPrefs) !== JSON.stringify(initialNotifPrefs)
  const railTopOffset = 28

  useEffect(() => {
    setProfileLang(persistedLang)
  }, [persistedLang])

  useEffect(() => {
    setProfileTheme(persistedTheme)
  }, [persistedTheme])

  useEffect(() => {
    if (!profileState.success) {
      profilePreferenceSyncRef.current = false
      return
    }

    if (profilePreferenceSyncRef.current) {
      return
    }

    setLang(profileLang)
    setThemePreference(profileTheme)
    profilePreferenceSyncRef.current = true
  }, [
    profileLang,
    profileState.success,
    profileTheme,
    setLang,
    setThemePreference,
  ])

  const resolveScrollTarget = (sectionId: TabId) =>
    sectionHeaderRefs.current[sectionId]

  const computeAlignedTop = (
    scrollContainer: HTMLElement,
    targetNode: HTMLElement,
    offset: number
  ) => {
    const containerRect = scrollContainer.getBoundingClientRect()
    const targetRect = targetNode.getBoundingClientRect()

    return Math.max(
      0,
      scrollContainer.scrollTop + targetRect.top - containerRect.top - offset
    )
  }

  useEffect(() => {
    const fetchPrefs = async () => {
      setIsNotifLoading(true)
      const result = await getNotificationPreferences()
      if (result.success && result.data) {
        const nextState = {
          inAppSystem: result.data.inAppSystem,
          inAppSocial: result.data.inAppSocial,
          inAppStudy: result.data.inAppStudy,
          inAppAchievement: result.data.inAppAchievement,
          emailSystem: result.data.emailSystem,
          emailSocial: result.data.emailSocial,
          emailWeekly: result.data.emailWeekly,
          emailMarketing: result.data.emailMarketing,
        }
        setNotifPrefs(nextState)
        setInitialNotifPrefs(nextState)
      } else {
        setNotifPrefs(DEFAULT_NOTIFICATION_PREFS)
        setInitialNotifPrefs(DEFAULT_NOTIFICATION_PREFS)
      }
      setIsNotifLoading(false)
    }

    void fetchPrefs()
  }, [])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (!activeEntry) return
        const sectionId = activeEntry.target.getAttribute('data-section-id')
        if (isTabId(sectionId)) {
          setActiveSection(sectionId)
        }
      },
      {
        threshold: [0.18, 0.4, 0.72],
        rootMargin: '-8% 0px -72% 0px',
        root: scrollContainer,
      }
    )

    SETTINGS_SECTIONS.forEach((sectionId) => {
      const node = sectionRefs.current[sectionId]
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isTabId(tabFromQuery)) return
    const node = resolveScrollTarget(tabFromQuery)
    if (!node) return
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const timer = window.setTimeout(() => {
      const nextTop = computeAlignedTop(scrollContainer, node, railTopOffset)
      scrollContainer.scrollTo({ top: nextTop, behavior: 'smooth' })
      setActiveSection(tabFromQuery)
    }, 80)

    return () => window.clearTimeout(timer)
  }, [tabFromQuery])

  const handleTogglePreference = (
    key: NotificationPreferenceKey,
    value: boolean
  ) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveNotificationPreferences = async () => {
    setIsNotifSaving(true)

    const result = await updateNotificationPreferences(notifPrefs)
    setIsNotifSaving(false)

    if (result.success) {
      setInitialNotifPrefs(notifPrefs)
      toast({
        title: copy.notificationsSaved,
        description: copy.savedToAccount,
      })
      return
    }

    toast({
      title:
        lang === 'zh'
          ? '保存失败'
          : lang === 'ms'
            ? 'Gagal menyimpan'
            : 'Save failed',
      description: copy.notificationsFailed,
      variant: 'destructive',
    })
  }

  const handleScrollToSection = (sectionId: TabId) => {
    const scrollContainer = scrollContainerRef.current
    const node = resolveScrollTarget(sectionId)
    if (!scrollContainer || !node) return

    setActiveSection(sectionId)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', sectionId)
    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    })
    const nextTop = computeAlignedTop(scrollContainer, node, railTopOffset)
    scrollContainer.scrollTo({ top: nextTop, behavior: 'smooth' })
  }

  const handleGenerateCode = async () => {
    setIsGenerating(true)
    const result = await generateInviteCode()
    setIsGenerating(false)

    if (result.success && result.code) {
      setInviteCode(result.code)
      toast({
        title: copy.inviteCode,
        description: result.code,
      })
      return
    }

    toast({
      title:
        lang === 'zh'
          ? '生成失败'
          : lang === 'ms'
            ? 'Gagal jana'
            : 'Generate failed',
      description:
        result.error ||
        (lang === 'zh'
          ? '请稍后重试。'
          : lang === 'ms'
            ? 'Cuba lagi sebentar lagi.'
            : 'Please try again later.'),
      variant: 'destructive',
    })
  }

  const handleCopyInviteCode = async () => {
    if (!inviteCode) return
    await navigator.clipboard.writeText(inviteCode)
    toast({
      title: copy.copied,
      description: inviteCode,
    })
  }

  const handleCancelPlan = async () => {
    if (!user?.stripeSubscriptionId) {
      toast({
        title:
          lang === 'zh'
            ? '无法取消'
            : lang === 'ms'
              ? 'Tidak boleh batal'
              : 'Unable to cancel',
        description:
          lang === 'zh'
            ? '当前没有可取消的 Stripe 订阅。'
            : lang === 'ms'
              ? 'Tiada langganan Stripe aktif untuk dibatalkan.'
              : 'No active Stripe subscription to cancel.',
        variant: 'destructive',
      })
      return
    }

    setIsCanceling(true)
    const result = await cancelSubscriptionAction()
    setIsCanceling(false)

    if (!result.ok) {
      toast({
        title:
          lang === 'zh'
            ? '取消失败'
            : lang === 'ms'
              ? 'Batal gagal'
              : 'Cancel failed',
        description: result.message,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: copy.canceledStatus,
      description: result.cancelAt
        ? `${copy.nextCharge}：${new Date(result.cancelAt).toLocaleString(
            lang === 'zh' ? 'zh-CN' : lang === 'ms' ? 'ms-MY' : 'en-US'
          )}`
        : result.message,
    })
  }

  const tutorCards = useMemo(
    () => [
      {
        id: 'encouraging' as const,
        label:
          lang === 'zh'
            ? '鼓励型'
            : lang === 'ms'
              ? 'Pendorong'
              : 'Encouraging',
        desc:
          lang === 'zh'
            ? '温和、耐心，适合持续陪练。'
            : lang === 'ms'
              ? 'Lembut dan sabar untuk pembelajaran berterusan.'
              : 'Warm and patient for steady momentum.',
        icon: Bot,
        tone: 'text-sky-300',
        bg: 'bg-sky-400/12',
        border: 'border-sky-400/30',
      },
      {
        id: 'socratic' as const,
        label:
          lang === 'zh'
            ? '苏格拉底型'
            : lang === 'ms'
              ? 'Sokratik'
              : 'Socratic',
        desc:
          lang === 'zh'
            ? '更强调提问和反思。'
            : lang === 'ms'
              ? 'Lebih menekankan soalan dan renungan.'
              : 'Question-led and reflective.',
        icon: Glasses,
        tone: 'text-violet-300',
        bg: 'bg-violet-400/12',
        border: 'border-violet-400/30',
      },
      {
        id: 'strict' as const,
        label:
          lang === 'zh'
            ? '严格教练'
            : lang === 'ms'
              ? 'Jurulatih tegas'
              : 'Strict Coach',
        desc:
          lang === 'zh'
            ? '更直接，适合追求效率。'
            : lang === 'ms'
              ? 'Lebih tegas untuk pengguna yang mahukan kecekapan.'
              : 'Direct and efficiency-focused.',
        icon: ClipboardList,
        tone: 'text-rose-300',
        bg: 'bg-rose-400/12',
        border: 'border-rose-400/30',
      },
    ],
    [lang]
  )

  const tierTone =
    tierToneMap[normalizedTier as keyof typeof tierToneMap] ||
    tierToneMap.STARTER
  const TierIcon = tierTone.icon
  const tierLabel =
    tierLabelMap[normalizedTier as keyof typeof tierLabelMap] || normalizedTier
  const statusLabel =
    statusLabelMap[normalizedStatus as keyof typeof statusLabelMap] ||
    normalizedStatus

  return (
    <div className="animate-fade-in-up pb-12">
      <div className={`${pageShellFrameClass} ${pageSectionGapClass} sm:p-2.5`}>
        <PageHeroShell
          className={`${pagePanelStrongClass} ${pageHeroShellClass}`}
          title={
            <PageHeroTitle
              title={copy.heroTitle}
              capsuleLabel={copy.heroBadge}
            />
          }
          subtitle={copy.heroSub}
          titleClassName="font-semibold"
          subtitleClassName="text-[13px] leading-6 text-text-secondary dark:text-text-secondary"
          actions={
            <div
              className={`grid sm:grid-cols-2 desktop:min-w-[360px] ${pageGridGapClass}`}
            >
              <div className={`${insetCardClassName} min-w-[164px] p-3.5`}>
                <div className={pageKickerClass}>{copy.accountSummary}</div>
                <div className={pageCardTitleClass}>
                  {user?.username || user?.email || 'User'}
                </div>
                <div className={pageMetaTextClass}>{user?.email}</div>
              </div>
              <div className={`${insetCardClassName} min-w-[164px] p-3.5`}>
                <div className={pageKickerClass}>{copy.currentPlan}</div>
                <div
                  className={cn(
                    'mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold',
                    tierTone.capsule
                  )}
                >
                  <TierIcon className={cn('h-3.5 w-3.5', tierTone.accent)} />
                  {tierLabel}
                </div>
                <div className={pageMetaTextClass}>{statusLabel}</div>
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-1 gap-6 desktop:h-[calc(100vh-14.5rem)] desktop:grid-cols-[260px_minmax(0,1fr)] desktop:overflow-hidden">
          <div className={`desktop:self-start ${pageSectionGapClass}`}>
            <Card className={`${surfaceClassName} ${pageCardPaddingClass}`}>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleScrollToSection(item.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[22px] border px-4 py-3 text-left transition-colors',
                      activeSection === item.id
                        ? choiceActiveClass
                        : choiceIdleClass
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-2xl border p-2',
                        activeSection === item.id
                          ? 'dark:border-sky-400/24 dark:bg-sky-400/12 border-blue-200 bg-surface-selected text-sky-700 dark:text-sky-100'
                          : 'border-borderTone bg-surface text-text-tertiary dark:border-borderTone dark:bg-surface-subtle dark:text-text-tertiary'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {item.label}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div
            ref={scrollContainerRef}
            className={`desktop:h-full desktop:overflow-y-auto desktop:pb-[42rem] desktop:pr-2 desktop:pt-7 ${pageSectionGapClass}`}
          >
            <SettingsSection
              id="profile"
              title={t.settings.tabs.profile}
              description={copy.profileDesc}
              icon={User}
              sectionRef={(node) => {
                sectionRefs.current.profile = node
              }}
              headerRef={(node) => {
                sectionHeaderRefs.current.profile = node
              }}
            >
              <form action={profileAction} className="space-y-5">
                <input type="hidden" name="language" value={profileLang} />
                <input type="hidden" name="theme" value={profileTheme} />
                <input
                  type="checkbox"
                  name="notificationDaily"
                  checked={notifPrefs.inAppStudy}
                  readOnly
                  className="hidden"
                />
                <input
                  type="checkbox"
                  name="notificationWeekly"
                  checked={notifPrefs.emailWeekly}
                  readOnly
                  className="hidden"
                />

                {profileState.success ? (
                  <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                    {copy.profileSuccess}
                  </div>
                ) : null}
                {profileState.error ? (
                  <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100">
                    {profileState.error}
                  </div>
                ) : null}

                <div
                  className={`grid desktop:grid-cols-[300px_minmax(0,1fr)] ${pageGridGapClass}`}
                >
                  <div className={`${insetCardClassName} p-5`}>
                    <div className={`mb-4 ${pageCardTitleClass}`}>
                      {copy.avatarLabel}
                    </div>
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="relative">
                        <img
                          src={
                            user?.avatar ||
                            'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop'
                          }
                          alt="Avatar"
                          className="h-28 w-28 rounded-full border border-borderTone object-cover dark:border-borderTone"
                        />
                        <div className="bg-slate-950/18 dark:bg-slate-950/24 absolute inset-0 flex items-center justify-center rounded-full">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className={pageSectionDescriptionClass}>
                        {copy.avatarHint}
                      </div>
                    </div>
                  </div>

                  <div className={`grid ${pageGridGapClass}`}>
                    <div
                      className={`${insetCardClassName} grid p-5 tablet:grid-cols-2 ${pageGridGapClass}`}
                    >
                      <Input
                        label={t.settings.profile.displayName}
                        name="username"
                        defaultValue={user?.username || ''}
                        className="bg-surface-subtle dark:bg-surface-subtle"
                      />
                      <div className="space-y-2">
                        <Input
                          label={copy.handleLabel}
                          name="handle"
                          value={profileHandle}
                          onChange={(event) => setProfileHandle(event.target.value)}
                          placeholder="@yourname"
                          className="bg-surface-subtle dark:bg-surface-subtle"
                          error={
                            handleAvailability.status === 'unavailable'
                              ? handleAvailability.reason || undefined
                              : undefined
                          }
                        />
                        <p
                          className={cn(
                            'px-1 text-xs',
                            handleAvailability.status === 'unavailable'
                              ? 'text-[hsl(var(--state-danger-fg))]'
                              : 'text-text-secondary dark:text-text-secondary'
                          )}
                        >
                          {handleHelperText}
                        </p>
                      </div>
                      <Input
                        label={copy.gradeLabel}
                        name="grade"
                        type="number"
                        min="7"
                        max="9"
                        defaultValue={user?.grade?.toString() || ''}
                        className="bg-surface-subtle dark:bg-surface-subtle"
                      />
                      <Input
                        label={copy.emailLabel}
                        defaultValue={user?.email || ''}
                        disabled
                        className="bg-surface-subtle text-text-tertiary dark:bg-surface-subtle tablet:col-span-2"
                      />
                    </div>

                    <div
                      className={`${insetCardClassName} grid p-5 tablet:grid-cols-2 ${pageGridGapClass}`}
                    >
                      <div>
                        <div className={`mb-3 ${pageCardTitleClass}`}>
                          {copy.language}
                        </div>
                        <div className="space-y-2">
                          {[
                            { id: 'en', label: 'English', icon: 'EN' },
                            { id: 'zh', label: '中文', icon: '中' },
                            { id: 'ms', label: 'Bahasa Melayu', icon: 'BM' },
                          ].map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => setProfileLang(option.id as Lang)}
                              aria-pressed={profileLang === option.id}
                              className={cn(
                                choiceButtonClass,
                                profileLang === option.id
                                  ? choiceActiveClass
                                  : choiceIdleClass
                              )}
                            >
                              <span className="flex items-center gap-3">
                                <span className="rounded-xl border border-borderTone bg-surface-subtle px-2 py-1 text-[11px] font-semibold dark:border-borderTone dark:bg-surface-subtle">
                                  {option.icon}
                                </span>
                                {option.label}
                              </span>
                              {profileLang === option.id ? (
                                <CircleCheck className="h-4 w-4 text-sky-500 dark:text-sky-200" />
                              ) : null}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className={`mb-3 ${pageCardTitleClass}`}>
                          {copy.appearance}
                        </div>
                        <div className="space-y-2">
                          {[
                            { id: 'light', label: copy.lightMode, icon: Sun },
                            { id: 'dark', label: copy.darkMode, icon: Moon },
                            {
                              id: 'system',
                              label: copy.systemMode,
                              icon: Globe,
                            },
                          ].map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                const nextTheme = option.id as ThemePreference
                                setProfileTheme(nextTheme)
                                setThemePreference(nextTheme)
                              }}
                              className={cn(
                                choiceButtonClass,
                                profileTheme === option.id
                                  ? choiceActiveClass
                                  : choiceIdleClass
                              )}
                              aria-pressed={profileTheme === option.id}
                            >
                              <span className="flex items-center gap-3">
                                <option.icon className="h-4 w-4 text-sky-600 dark:text-sky-300" />
                                {option.label}
                              </span>
                              {profileTheme === option.id ? (
                                <CircleCheck className="h-4 w-4 text-sky-500 dark:text-sky-200" />
                              ) : null}
                            </button>
                          ))}
                        </div>
                      </div>

                    <div className="tablet:col-span-2">
                        <p className={pageMetaTextClass}>
                          {copy.preferenceSaveHint}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <SectionSubmitButton
                    idleLabel={copy.profileSave}
                    pendingLabel={copy.profileSaving}
                    disabled={
                      handleAvailability.status === 'checking' ||
                      handleAvailability.status === 'unavailable'
                    }
                  />
                </div>
              </form>
            </SettingsSection>

            <SettingsSection
              id="ai-config"
              title={t.settings.tabs.aiConfig}
              description={copy.aiDesc}
              icon={Brain}
              badge={`${copy.tutorCurrent} · ${
                tutorCards.find((item) => item.id === selectedTutor)?.label
              }`}
              sectionRef={(node) => {
                sectionRefs.current['ai-config'] = node
              }}
              headerRef={(node) => {
                sectionHeaderRefs.current['ai-config'] = node
              }}
            >
              <form action={aiConfigAction} className="space-y-5">
                <input
                  type="hidden"
                  name="aiPersonality"
                  value={selectedTutor.toUpperCase()}
                />
                <input
                  type="hidden"
                  name="difficultyCalibration"
                  value={difficulty}
                />

                {aiConfigState.success ? (
                  <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                    {copy.aiSuccess}
                  </div>
                ) : null}
                {aiConfigState.error ? (
                  <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100">
                    {aiConfigState.error}
                  </div>
                ) : null}

                <div className={`grid desktop:grid-cols-3 ${pageGridGapClass}`}>
                  {tutorCards.map((tutor) => (
                    <button
                      key={tutor.id}
                      type="button"
                      onClick={() => setSelectedTutor(tutor.id)}
                      className={cn(
                        `${insetCardClassName} flex h-full flex-col items-start p-5 text-left transition-colors`,
                        selectedTutor === tutor.id
                          ? tutor.border + ' ' + tutor.bg
                          : 'hover:bg-surface-subtle dark:hover:bg-surface-selected'
                      )}
                    >
                      <div
                        className={cn(
                          'mb-5 rounded-2xl border p-3',
                          selectedTutor === tutor.id
                            ? tutor.border + ' ' + tutor.bg
                            : 'border-borderTone bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle'
                        )}
                      >
                        <tutor.icon className={cn('h-6 w-6', tutor.tone)} />
                      </div>
                      <div className={pageSectionTitleClass}>{tutor.label}</div>
                      <div className={`mt-2 ${pageSectionDescriptionClass}`}>
                        {tutor.desc}
                      </div>
                      {selectedTutor === tutor.id ? (
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
                          <CircleCheck className="h-3.5 w-3.5" />
                          {copy.tutorCurrent}
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>

                <div className={`grid desktop:grid-cols-2 ${pageGridGapClass}`}>
                  <div className={`${insetCardClassName} p-5`}>
                    <div className="mb-4 flex items-center justify-between">
                      <div className={pageCardTitleClass}>
                        {t.settings.ai.difficulty}
                      </div>
                      <div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100">
                        {difficulty < 30
                          ? 'Foundational'
                          : difficulty < 70
                            ? 'Proficient'
                            : 'Challenge'}
                      </div>
                    </div>
                    <input
                      name="difficultyCalibrationVisible"
                      type="range"
                      min="0"
                      max="100"
                      value={difficulty}
                      onChange={(event) =>
                        setDifficulty(Number(event.target.value))
                      }
                      className="h-3 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-500 dark:bg-surface-subtle"
                    />
                    <div className="mt-4 flex justify-between text-[11px] font-medium uppercase tracking-[0.18em] text-text-tertiary dark:text-text-tertiary">
                      <span>Standard</span>
                      <span>Advanced</span>
                      <span>Challenge</span>
                    </div>
                  </div>

                  <div className={`${insetCardClassName} p-5`}>
                    <div className={`mb-3 ${pageCardTitleClass}`}>
                      {copy.curriculumNote}
                    </div>
                    <div className={`${dataBlockClass} text-sm`}>
                      IGCSE (Cambridge International)
                    </div>
                    <div className={`mt-3 ${pageSectionDescriptionClass}`}>
                      {t.settings.ai.desc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <SectionSubmitButton
                    idleLabel={copy.aiSave}
                    pendingLabel={copy.aiSaving}
                  />
                </div>
              </form>
            </SettingsSection>

            <SettingsSection
              id="notifications"
              title={t.settings.tabs.notifications}
              description={copy.notificationsDesc}
              icon={Bell}
              sectionRef={(node) => {
                sectionRefs.current.notifications = node
              }}
              headerRef={(node) => {
                sectionHeaderRefs.current.notifications = node
              }}
            >
              {isNotifLoading ? (
                <NotificationPreferencesSkeleton />
              ) : (
                <div className="space-y-4">
                  <div className={`${insetCardClassName} overflow-hidden`}>
                    <div className="grid grid-cols-[minmax(0,1fr)_88px_88px] border-b border-borderTone bg-surface-subtle px-5 py-3 dark:border-borderTone dark:bg-surface-subtle">
                      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-text-tertiary dark:text-text-tertiary">
                        {copy.notificationChannels}
                      </div>
                      <div className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-text-tertiary dark:text-text-tertiary">
                        {copy.inApp}
                      </div>
                      <div className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-text-tertiary dark:text-text-tertiary">
                        {copy.email}
                      </div>
                    </div>

                    {NOTIFICATION_MATRIX.map((row, index) => (
                      <div
                        key={row.label}
                        className={cn(
                          'grid grid-cols-[minmax(0,1fr)_88px_88px] items-center px-5 py-4',
                          index !== NOTIFICATION_MATRIX.length - 1 &&
                            'border-b border-borderTone dark:border-borderTone',
                          row.alwaysOn
                            ? 'bg-surface-subtle/70 dark:bg-surface-subtle/70'
                            : 'hover:bg-surface-subtle dark:hover:bg-surface-selected'
                        )}
                      >
                        <div className="pr-4">
                          <div className={pageCardTitleClass}>
                            {lang === 'zh' ? row.label : row.label}
                          </div>
                          <div className={`mt-1 ${pageMetaTextClass}`}>
                            {row.description}
                          </div>
                        </div>

                        <div className="flex items-center justify-center">
                          {row.alwaysOn ? (
                            <Switch checked disabled />
                          ) : row.inApp ? (
                            <Switch
                              checked={notifPrefs[row.inApp]}
                              onCheckedChange={(checked) =>
                                handleTogglePreference(row.inApp!, checked)
                              }
                            />
                          ) : (
                            <Switch checked={false} disabled />
                          )}
                        </div>

                        <div className="flex items-center justify-center">
                          {row.alwaysOn ? (
                            <Switch checked disabled />
                          ) : row.email ? (
                            <Switch
                              checked={notifPrefs[row.email]}
                              onCheckedChange={(checked) =>
                                handleTogglePreference(row.email!, checked)
                              }
                            />
                          ) : (
                            <Switch checked={false} disabled />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-text-secondary dark:text-text-secondary">
                      {notifDirty ? copy.notificationPending : copy.noChange}
                    </div>
                    <Button
                      type="button"
                      className="h-11 rounded-full px-5 text-sm font-semibold"
                      onClick={handleSaveNotificationPreferences}
                      disabled={isNotifSaving || !notifDirty}
                      isLoading={isNotifSaving}
                      loadingText={copy.notifSaving}
                    >
                      {copy.notifSave}
                    </Button>
                  </div>
                </div>
              )}
            </SettingsSection>

            <SettingsSection
              id="account"
              title={t.settings.tabs.account}
              description={copy.accountDesc}
              icon={Shield}
              sectionRef={(node) => {
                sectionRefs.current.account = node
              }}
              headerRef={(node) => {
                sectionHeaderRefs.current.account = node
              }}
            >
              <div className="space-y-4">
                {user?.role === 'STUDENT' ? (
                  <div className={`${surfaceClassName} p-5`}>
                    <div className="flex flex-col gap-5 desktop:flex-row desktop:items-center desktop:justify-between">
                      <div className="max-w-2xl">
                        <div className={pageBadgeClass}>
                          <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-300" />
                          {copy.parentTitle}
                        </div>
                        <div className={pageNumericValueClass}>
                          {inviteCode
                            ? copy.parentWaiting
                            : copy.parentDisconnected}
                        </div>
                        <div className={`mt-2 ${pageSectionDescriptionClass}`}>
                          {copy.parentDesc}
                        </div>
                      </div>

                      {inviteCode ? (
                        <div
                          className={`${insetCardClassName} min-w-[260px] p-5`}
                        >
                          <div className={pageKickerClass}>
                            {copy.inviteCode}
                          </div>
                          <div
                            className={`mt-3 font-mono tracking-[0.3em] ${pageHeroNumericValueClass}`}
                          >
                            {inviteCode}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className={`mt-4 ${subtleButtonClass}`}
                            onClick={handleCopyInviteCode}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            {copy.copyCode}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          className="h-11 rounded-full px-5 text-sm font-semibold"
                          onClick={handleGenerateCode}
                          disabled={isGenerating}
                          isLoading={isGenerating}
                          loadingText={copy.generating}
                        >
                          <LinkIcon className="mr-2 h-4 w-4" />
                          {copy.generateInviteCode}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : null}

                <ReferralSection
                  user={{
                    referralCode: user?.referralCode || null,
                    referralCount: user?.referralCount || 0,
                  }}
                  lang={lang}
                />
              </div>
            </SettingsSection>

            <SettingsSection
              id="subscription"
              title={t.settings.tabs.subscription}
              description={copy.subscriptionDesc}
              icon={CreditCard}
              badge={statusLabel}
              sectionRef={(node) => {
                sectionRefs.current.subscription = node
              }}
              headerRef={(node) => {
                sectionHeaderRefs.current.subscription = node
              }}
            >
              <div className="space-y-4">
                <div className={`grid desktop:grid-cols-3 ${pageGridGapClass}`}>
                  <div className={`${insetCardClassName} p-5`}>
                    <div className={pageKickerClass}>{copy.currentPlan}</div>
                    <div className={pageNumericValueClass}>{tierLabel}</div>
                    <div className={pageMetaTextClass}>{statusLabel}</div>
                  </div>

                  <div className={`${insetCardClassName} p-5`}>
                    <div className={pageKickerClass}>{copy.nextCharge}</div>
                    <div className={pageNumericValueClass}>
                      {subscriptionEndDate
                        ? subscriptionEndDate.toLocaleString(
                            lang === 'zh'
                              ? 'zh-CN'
                              : lang === 'ms'
                                ? 'ms-MY'
                                : 'en-US'
                          )
                        : copy.freeTier}
                    </div>
                    <div className={pageMetaTextClass}>
                      {user?.cancelAtPeriodEnd
                        ? copy.canceledStatus
                        : copy.subscriptionHealthy}
                    </div>
                  </div>

                  <div className={`${insetCardClassName} p-5`}>
                    <div className={pageKickerClass}>{copy.pendingReward}</div>
                    <div className={pageNumericValueClass}>
                      {pendingDeferredWeeks} 周
                    </div>
                    <div className={pageMetaTextClass}>
                      {pendingDeferredRewards.length} 条待结算记录
                    </div>
                  </div>
                </div>

                {normalizedStatus === 'TRIALING' ? (
                  <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
                    当前处于试用期，首次真实扣款前可在此页面取消计划。
                  </div>
                ) : null}

                {user?.cancelAtPeriodEnd ? (
                  <div className="rounded-[22px] border border-orange-200 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-700 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-100">
                    {copy.canceledStatus}
                  </div>
                ) : null}

                {pendingDeferredWeeks > 0 ? (
                  <div className="rounded-[22px] border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm leading-6 text-indigo-700 dark:border-indigo-400/20 dark:bg-indigo-400/10 dark:text-indigo-100">
                    待结算推荐奖励共 {pendingDeferredRewards.length} 条，合计{' '}
                    {pendingDeferredWeeks} 周。后续完成真实扣款后会自动补发。
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    type="button"
                    className="h-11 rounded-full px-5 text-sm font-semibold"
                    onClick={() => router.push('/pricing')}
                  >
                    {copy.upgrade}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={subtleButtonClass}
                    onClick={handleCancelPlan}
                    disabled={
                      isCanceling ||
                      !user?.stripeSubscriptionId ||
                      normalizedStatus === 'CANCELED' ||
                      !!user?.cancelAtPeriodEnd
                    }
                    isLoading={isCanceling}
                    loadingText={copy.canceling}
                  >
                    {copy.cancelPlan}
                  </Button>
                </div>
              </div>
            </SettingsSection>
          </div>
        </div>
      </div>
    </div>
  )
}
