'use client'

/**
 * User Profile Header Component
 * Story-046: 用户全生命周期管理后台 - Task B
 *
 * 用户详情页 Header：头像、基本信息、快捷操作按钮
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Ban,
  ShieldCheck,
  LogIn,
  KeyRound,
  Mail,
  Calendar,
  MapPin,
  MoreHorizontal,
} from 'lucide-react'
import { UserStatusBadge, UserTierBadge } from './UserBadges'
import { HighRiskConfirmDialog } from './HighRiskConfirmDialog'
import { toggleUserStatus, impersonateUser } from '@/actions/admin/user-ops'
import type { Admin } from '@/types'
import { toast } from 'sonner'

interface UserProfileHeaderProps {
  user: Admin.UserDetail
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ user }) => {
  const router = useRouter()
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    action: Admin.HighRiskAction
  }>({ isOpen: false, action: 'ban' })
  const [isLoading, setIsLoading] = useState(false)

  const isBanned = user.status === ('Banned' as Admin.UserStatus)

  const handleBack = () => {
    router.push('/admin/users')
  }

  const openConfirmDialog = (action: Admin.HighRiskAction) => {
    setDialogState({ isOpen: true, action })
  }

  const closeConfirmDialog = () => {
    setDialogState({ isOpen: false, action: 'ban' })
  }

  const handleConfirmAction = async (reason: string, duration?: string) => {
    setIsLoading(true)
    try {
      switch (dialogState.action) {
        case 'ban':
        case 'unban': {
          const result = await toggleUserStatus(user.id, dialogState.action, reason)
          if (result.success) {
            toast.success(dialogState.action === 'ban' ? '用户已封禁' : '用户已解封')
            closeConfirmDialog()
          } else {
            toast.error(result.error || '操作失败')
          }
          break
        }
        case 'impersonate': {
          const result = await impersonateUser(user.id, reason)
          if (result.success && result.data) {
            toast.success('正在进入伪装模式...')
            closeConfirmDialog()
            // 在新标签页打开
            window.open(result.data.redirectUrl, '_blank')
          } else {
            toast.error(result.error || '伪装登录失败')
          }
          break
        }
        case 'resetPassword': {
          // TODO: 实现密码重置逻辑
          toast.info('密码重置功能开发中')
          closeConfirmDialog()
          break
        }
      }
    } catch (error) {
      console.error('Action error:', error)
      toast.error('操作失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 获取用户名首字母
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <>
      <div className="overflow-hidden rounded-[28px] border border-borderTone bg-[linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] text-text-primary shadow-surface-lg dark:border-borderTone dark:bg-[linear-gradient(180deg,hsl(var(--surface-default))_0%,hsl(var(--surface-muted))_100%)] dark:text-white">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-borderTone px-6 py-4 dark:border-borderTone">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-text-secondary transition-colors hover:text-text-primary dark:text-text-secondary dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">返回列表</span>
          </button>

          {/* More Actions */}
          <div className="relative">
            <button className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary dark:text-text-secondary dark:hover:bg-white/10 dark:hover:text-white">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-start gap-4">
              <div className={`h-20 w-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg ${user.avatarColor}`}>
                {initials}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-text-primary dark:text-white">{user.name}</h1>
                  <UserStatusBadge status={user.status} />
                  <UserTierBadge tier={user.tier} />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary dark:text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    加入于 {new Date(user.joinDate).toLocaleDateString('zh-CN')}
                  </span>
                  {user.location !== '未设置' && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {user.location}
                    </span>
                  )}
                </div>

                <p className="text-xs text-text-tertiary dark:text-text-tertiary">
                  用户ID: <code className="rounded bg-surface-subtle px-1.5 py-0.5 font-mono dark:bg-surface-subtle">{user.id}</code>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="md:ml-auto flex flex-wrap gap-2">
              {isBanned ? (
                <button
                  onClick={() => openConfirmDialog('unban')}
                  className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/15"
                >
                  <ShieldCheck className="w-4 h-4" />
                  解除封禁
                </button>
              ) : (
                <button
                  onClick={() => openConfirmDialog('ban')}
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/15"
                >
                  <Ban className="w-4 h-4" />
                  封禁用户
                </button>
              )}

              <button
                onClick={() => openConfirmDialog('impersonate')}
                className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/15"
              >
                <LogIn className="w-4 h-4" />
                伪装登录
              </button>

              <button
                onClick={() => openConfirmDialog('resetPassword')}
                className="flex items-center gap-2 rounded-lg border border-borderTone bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-subtle dark:border-borderTone dark:bg-surface dark:text-white dark:hover:bg-white/10"
              >
                <KeyRound className="w-4 h-4" />
                重置密码
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-borderTone pt-6 dark:border-borderTone md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary dark:text-white">{user.learningStats.totalQuestions}</p>
              <p className="text-xs text-text-secondary dark:text-text-secondary">答题总数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-300">{user.learningStats.accuracy}%</p>
              <p className="text-xs text-text-secondary dark:text-text-secondary">正确率</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-300">{user.learningStats.mistakes}</p>
              <p className="text-xs text-text-secondary dark:text-text-secondary">错题数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-cyan-300">{user.learningStats.daysActive}</p>
              <p className="text-xs text-text-secondary dark:text-text-secondary">连续学习天数</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <HighRiskConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmAction}
        action={dialogState.action}
        userEmail={user.email}
        userName={user.name}
        isLoading={isLoading}
      />
    </>
  )
}
