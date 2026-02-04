'use client'

import React, { useState } from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import { SubscriptionTier } from '@/types/admin-user'
import { applyAdminOverride } from '@/actions/admin/permission-override'
import { toast } from 'sonner'

interface GrantPermissionDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentTier: SubscriptionTier
}

const TIERS = [
  { value: 'STARTER', label: 'Starter' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'SMART_PLUS', label: 'Smart+' },
  { value: 'PREMIER', label: 'Premier' },
]

const DURATIONS = [
  { value: '7_days', label: '7 Days (Trial)' },
  { value: '30_days', label: '30 Days' },
  { value: '90_days', label: '3 Months' },
  { value: 'permanent', label: 'Permanent' },
]

export const GrantPermissionDialog: React.FC<GrantPermissionDialogProps> = ({
  isOpen,
  onClose,
  userId,
  currentTier,
}) => {
  const [tier, setTier] = useState<SubscriptionTier>(currentTier === 'PREMIER' ? 'PREMIER' : 'SMART_PLUS')
  const [duration, setDuration] = useState('7_days')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (reason.trim().length < 5) {
      toast.error('Please provide a reason (min 5 characters)')
      return
    }

    setIsLoading(true)
    try {
      // 这里的 Server Action 需要对应修改以支持 duration 参数
      // 目前 applyAdminOverride 只接受 tier 和 reason，duration 需要后续扩展
      // 暂时我们在 reason 中备注 duration
      const fullReason = `[Duration: ${duration}] ${reason}`
      
      await applyAdminOverride({
        userId,
        tier: tier as any, // Cast to match Prisma enum if needed
        reason: fullReason,
      })

      toast.success('Permission granted successfully')
      onClose()
      setReason('')
    } catch (error) {
      console.error(error)
      toast.error('Failed to grant permission')
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
      
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <h3 className="text-lg font-bold text-white">Grant Permission</h3>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Tier Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Target Tier
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTier(t.value as SubscriptionTier)}
                  disabled={isLoading}
                  className={`text-sm px-3 py-2 rounded-lg border transition-all ${
                    tier === t.value
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                      : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
            >
              {DURATIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              placeholder="e.g., Customer support compensation..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none h-24 resize-none placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-all font-medium text-sm shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Confirm Grant
          </button>
        </div>
      </div>
    </div>
  )
}