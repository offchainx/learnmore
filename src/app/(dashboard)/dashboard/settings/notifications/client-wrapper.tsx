'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ChevronLeft } from 'lucide-react'
import { getNotificationPreferences, updateNotificationPreferences } from '@/actions/notification-preferences'
import type { User, UserSettings } from '@prisma/client'

type UserProfile = User & { settings: UserSettings | null }

// 偏好字段 key 类型（排除 emailBilling 和时间戳）
type PreferenceKey =
  | 'inAppSystem'
  | 'inAppSocial'
  | 'inAppStudy'
  | 'inAppAchievement'
  | 'emailSystem'
  | 'emailSocial'
  | 'emailWeekly'
  | 'emailMarketing'

interface NotificationRow {
  label: string
  description: string
  inApp: PreferenceKey | null   // null = 该行无站内开关
  email: PreferenceKey | null   // null = 该行无邮件开关
  alwaysOn?: boolean            // true = 双列均显示禁用的开启状态
}

// 通知偏好矩阵配置（映射到 NotificationPreference 字段）
const NOTIFICATION_MATRIX: NotificationRow[] = [
  { label: '社交互动',  description: '帖子回复和评论',     inApp: 'inAppSocial',      email: 'emailSocial' },
  { label: '系统通知',  description: '版本更新和公告',     inApp: 'inAppSystem',      email: 'emailSystem' },
  { label: '成就',      description: '获得新勋章',         inApp: 'inAppAchievement', email: null },
  { label: '学习提醒',  description: '学习进度提醒',       inApp: 'inAppStudy',       email: null },
  { label: '支付确认',  description: '收据和订阅变更',     inApp: null,               email: null, alwaysOn: true },
  { label: '学习周报',  description: '每周学习总结',       inApp: null,               email: 'emailWeekly' },
  { label: '营销推广',  description: '活动和促销信息',     inApp: null,               email: 'emailMarketing' },
]

interface Props {
  user: UserProfile
  userRole: string
}

export function NotificationSettingsClient({ user, userRole }: Props) {
  const router = useRouter()
  const { toast } = useToast()

  const [prefs, setPrefs] = useState<Record<PreferenceKey, boolean>>({
    inAppSystem: true,
    inAppSocial: true,
    inAppStudy: true,
    inAppAchievement: true,
    emailSystem: true,
    emailSocial: true,
    emailWeekly: true,
    emailMarketing: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // 挂载时从服务端拉取当前偏好（含自动迁移逻辑）
  useEffect(() => {
    getNotificationPreferences().then((result) => {
      if (result.success && result.data) {
        const d = result.data
        setPrefs({
          inAppSystem:      d.inAppSystem,
          inAppSocial:      d.inAppSocial,
          inAppStudy:       d.inAppStudy,
          inAppAchievement: d.inAppAchievement,
          emailSystem:      d.emailSystem,
          emailSocial:      d.emailSocial,
          emailWeekly:      d.emailWeekly,
          emailMarketing:   d.emailMarketing,
        })
      }
      setIsLoading(false)
    })
  }, [])

  const handleToggle = (key: PreferenceKey) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateNotificationPreferences(prefs)
      if (result.success) {
        toast({ title: '已保存', description: '通知偏好已更新。' })
      } else {
        toast({ title: '保存失败', description: '请稍后重试。', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Failed to save notification preferences:', error)
      toast({ title: '保存失败', description: '网络错误，请稍后重试。', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleNavigate = (view: string) => {
    const routes: Record<string, string> = {
      dashboard:        '/dashboard',
      courses:          '/dashboard/courses',
      questionBank:     '/dashboard/practice',
      leaderboard:      '/dashboard/leaderboard',
      community:        '/dashboard/community',
      settings:         '/dashboard/settings',
      achievements:     '/dashboard/achievements',
      knowledgeGraph:   '/dashboard/knowledge-graph',
      admin:            '/admin/content',
      parent:           '/dashboard',
    }
    router.push(routes[view] || '/dashboard')
  }

  // ── 单元格渲染辅助 ──────────────────────────────────────
  const renderCell = (key: PreferenceKey | null, alwaysOn?: boolean) => {
    if (alwaysOn) return <Switch checked disabled />
    if (key)       return <Switch checked={prefs[key]} onCheckedChange={() => handleToggle(key)} />
    return         <span className="text-slate-300 dark:text-slate-600 text-sm">—</span>
  }

  return (
    <DashboardLayout
      currentView="settings"
      onNavigate={handleNavigate}
      userRole={userRole}
      subscriptionTier={user?.subscriptionTier}
      subscriptionEnd={user?.subscriptionEnd}
    >
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 页面标题区 */}
        <div>
          <button
            onClick={() => router.push('/dashboard/settings')}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            返回设置
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">通知设置</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            自定义你希望接收的通知类型和渠道
          </p>
        </div>

        {/* 主卡片 */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                通知偏好矩阵
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                支付确认类通知不允许关闭，以确保账户安全
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {/* 列表头 */}
              <div className="grid grid-cols-[1fr_80px_80px] bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700">
                <div className="px-5 py-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    通知类型
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    站内通知
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    邮件通知
                  </span>
                </div>
              </div>

              {/* 矩阵行 */}
              {NOTIFICATION_MATRIX.map((row, index) => (
                <div
                  key={row.label}
                  className={[
                    'grid grid-cols-[1fr_80px_80px] items-center',
                    index !== NOTIFICATION_MATRIX.length - 1
                      ? 'border-b border-slate-100 dark:border-slate-800'
                      : '',
                    row.alwaysOn
                      ? 'bg-slate-50/60 dark:bg-slate-800/20'
                      : 'hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors',
                  ].join(' ')}
                >
                  {/* 标签 + 说明 */}
                  <div className="px-5 py-4">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {row.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {row.description}
                    </p>
                  </div>

                  {/* 站内通知开关 */}
                  <div className="flex items-center justify-center">
                    {renderCell(row.inApp, row.alwaysOn)}
                  </div>

                  {/* 邮件通知开关 */}
                  <div className="flex items-center justify-center">
                    {renderCell(row.email, row.alwaysOn)}
                  </div>
                </div>
              ))}
            </CardContent>

            {/* 保存区 */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30">
              <Button onClick={handleSave} disabled={isSaving} className="w-full h-10">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    保存中…
                  </>
                ) : (
                  '保存偏好'
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
