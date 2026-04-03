'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, ShieldCheck, TriangleAlert, X } from 'lucide-react'
import { Admin } from '@/types'
import { applyAdminOverride } from '@/actions/admin/permission-override'
import { toast } from 'sonner'

interface GrantPermissionDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentTier: Admin.SubscriptionTier
}

type PermissionTierValue = 'STARTER' | 'STANDARD' | 'SMART_PLUS' | 'PREMIER'

const TIERS: Array<{
  value: PermissionTierValue
  label: string
  description: string
}> = [
  {
    value: 'STARTER',
    label: 'Starter',
    description: '基础权限',
  },
  {
    value: 'STANDARD',
    label: 'Standard',
    description: '标准权限',
  },
  {
    value: 'SMART_PLUS',
    label: 'Smart+',
    description: '增强权限',
  },
  {
    value: 'PREMIER',
    label: 'Premier',
    description: '最高权限',
  },
]

const DURATIONS = [
  { value: '7_days', label: '7 天（试用）' },
  { value: '30_days', label: '30 天' },
  { value: '90_days', label: '90 天' },
  { value: 'permanent', label: '永久' },
]

type DialogStep = 'edit' | 'confirm' | 'forbidden' | 'error'

function isPermissionError(message: string): boolean {
  return message.includes('Unauthorized') || message.includes('权限不足')
}

export const GrantPermissionDialog: React.FC<GrantPermissionDialogProps> = ({
  isOpen,
  onClose,
  userId,
  currentTier,
}) => {
  const [step, setStep] = useState<DialogStep>('edit')
  const [selectedTier, setSelectedTier] = useState<PermissionTierValue | ''>('')
  const [duration, setDuration] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setStep('edit')
    setSelectedTier('')
    setDuration('')
    setReason('')
    setMessage(null)
    setIsLoading(false)
  }, [isOpen, currentTier])

  const selectedTierLabel = useMemo(
    () =>
      TIERS.find((tier) => tier.value === selectedTier)?.label || '未选择',
    [selectedTier]
  )

  const durationLabel = useMemo(
    () =>
      DURATIONS.find((item) => item.value === duration)?.label || '未选择',
    [duration]
  )

  const canContinue =
    selectedTier !== '' && duration !== '' && reason.trim().length >= 10

  const resetAndClose = () => {
    setStep('edit')
    setSelectedTier('')
    setDuration('')
    setReason('')
    setMessage(null)
    setIsLoading(false)
    onClose()
  }

  const handleStartConfirm = () => {
    if (!canContinue) {
      setMessage('请先选择目标等级、有效期，并填写不少于 10 个字符的理由。')
      return
    }

    setMessage(null)
    setStep('confirm')
  }

  const handleConfirm = async () => {
    if (!canContinue || !selectedTier) {
      setMessage('请先补全提权信息。')
      setStep('edit')
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      await applyAdminOverride({
        userId,
        tier: selectedTier as PermissionTierValue,
        reason: reason.trim(),
        duration,
      })

      toast.success('权限覆写已提交')
      resetAndClose()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '提交权限覆写失败'
      setMessage(errorMessage)
      setStep(isPermissionError(errorMessage) ? 'forbidden' : 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/50 p-4">
          <div>
            <h3 className="text-lg font-bold text-white">权限提权 / 覆写</h3>
            <p className="mt-1 text-xs text-slate-400">
              目标用户当前等级：{currentTier}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 transition-colors hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {(step === 'forbidden' || step === 'error') && (
          <div className="space-y-4 p-6">
            <div
              className={`rounded-xl border p-4 ${
                step === 'forbidden'
                  ? 'border-amber-900/60 bg-amber-950/30'
                  : 'border-rose-900/60 bg-rose-950/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <TriangleAlert
                  className={
                    step === 'forbidden' ? 'mt-0.5 text-amber-300' : 'mt-0.5 text-rose-300'
                  }
                  size={18}
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    {step === 'forbidden' ? '无权限执行该操作' : '权限覆写提交失败'}
                  </p>
                  <p className="text-sm leading-6 text-slate-300">
                    {message || '请检查当前账号权限或稍后重试。'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStep('edit')
                  setMessage(null)
                }}
                className="flex-1 rounded-lg border border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
              >
                返回编辑
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                关闭
              </button>
            </div>
          </div>
        )}

        {step === 'edit' && (
          <>
            <div className="space-y-5 p-6">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 text-blue-400" size={18} />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-100">先完成信息，再进入确认</p>
                    <p className="text-sm leading-6 text-slate-400">
                      这次提交会写入 `userPermissionOverride`、`user` 和 `securityLog`。
                    </p>
                  </div>
                </div>
              </div>

              {message ? (
                <div className="rounded-lg border border-amber-900/60 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
                  {message}
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  目标等级
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIERS.map((tier) => (
                    <button
                      key={tier.value}
                      onClick={() => setSelectedTier(tier.value)}
                      disabled={isLoading}
                      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                        selectedTier === tier.value
                          ? 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                          : 'border-slate-700 bg-slate-800/40 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-medium">{tier.label}</div>
                      <div className="mt-0.5 text-xs text-current/70">{tier.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                  htmlFor="duration"
                >
                  有效期
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-200 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="">请选择有效期</option>
                  {DURATIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
                  htmlFor="reason"
                >
                  操作理由 <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  disabled={isLoading}
                  placeholder="例如：客服补救、活动赠送、人工审批等。"
                  className="h-24 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-800 p-6 pt-4">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleStartConfirm}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
              >
                下一步确认
              </button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="space-y-4 p-6">
              <div className="rounded-xl border border-blue-900/50 bg-blue-950/20 p-4">
                <p className="text-sm font-semibold text-blue-100">确认提权 / 覆写</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  提交后会更新用户订阅等级，并写入审计日志。请确认下面内容无误：
                </p>
                <dl className="mt-4 grid gap-3 text-sm text-slate-300">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">当前等级</dt>
                    <dd>{currentTier}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">目标等级</dt>
                  <dd>{selectedTierLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">有效期</dt>
                    <dd>{durationLabel}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-slate-500">理由</dt>
                    <dd className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-slate-200">
                      {reason.trim()}
                    </dd>
                  </div>
                </dl>
              </div>

              <button
                onClick={() => {
                  setStep('edit')
                  setMessage(null)
                }}
                className="text-sm font-medium text-blue-300 transition-colors hover:text-blue-200"
              >
                返回修改
              </button>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-800 p-6 pt-4">
              <button
                onClick={() => setStep('edit')}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-slate-700 px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                返回编辑
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                确认提交
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
