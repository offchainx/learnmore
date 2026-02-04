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
import type { UserDetail, HighRiskAction, UserStatus } from '@/types/admin-user'
import { toast } from 'sonner'

interface UserProfileHeaderProps {
  user: UserDetail
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ user }) => {
  const router = useRouter()
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    action: HighRiskAction
  }>({ isOpen: false, action: 'ban' })
  const [isLoading, setIsLoading] = useState(false)

  const isBanned = user.status === ('Banned' as UserStatus)

  const handleBack = () => {
    router.push('/admin/users')
  }

  const openConfirmDialog = (action: HighRiskAction) => {
    setDialogState({ isOpen: true, action })
  }

  const closeConfirmDialog = () => {
    setDialogState({ isOpen: false, action: 'ban' })
  }

  const handleConfirmAction = async (reason: string) => {
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">返回列表</span>
          </button>

          {/* More Actions */}
          <div className="relative">
            <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
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
                  <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                  <UserStatusBadge status={user.status} />
                  <UserTierBadge tier={user.tier} />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
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

                <p className="text-xs text-slate-500">
                  用户ID: <code className="px-1.5 py-0.5 bg-slate-800 rounded font-mono">{user.id}</code>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="md:ml-auto flex flex-wrap gap-2">
              {isBanned ? (
                <button
                  onClick={() => openConfirmDialog('unban')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-colors text-sm font-medium"
                >
                  <ShieldCheck className="w-4 h-4" />
                  解除封禁
                </button>
              ) : (
                <button
                  onClick={() => openConfirmDialog('ban')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium"
                >
                  <Ban className="w-4 h-4" />
                  封禁用户
                </button>
              )}

              <button
                onClick={() => openConfirmDialog('impersonate')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded-lg hover:bg-amber-600/30 transition-colors text-sm font-medium"
              >
                <LogIn className="w-4 h-4" />
                伪装登录
              </button>

              <button
                onClick={() => openConfirmDialog('resetPassword')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 border border-slate-600/30 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                <KeyRound className="w-4 h-4" />
                重置密码
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{user.learningStats.totalQuestions}</p>
              <p className="text-xs text-slate-400">答题总数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{user.learningStats.accuracy}%</p>
              <p className="text-xs text-slate-400">正确率</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{user.learningStats.mistakes}</p>
              <p className="text-xs text-slate-400">错题数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{user.learningStats.daysActive}</p>
              <p className="text-xs text-slate-400">连续学习天数</p>
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
        isLoading={isLoading}
      />
    </>
  )
}
