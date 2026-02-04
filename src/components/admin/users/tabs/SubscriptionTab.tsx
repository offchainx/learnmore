'use client'

import React, { useEffect, useState } from 'react'
import { CreditCard, CheckCircle2 } from 'lucide-react'
import { UserDetail } from '@/types/admin-user'
import { UserTierBadge } from '../UserBadges'
import { GrantPermissionDialog } from '../GrantPermissionDialog'
import { StripeHistoryTable } from '../StripeHistoryTable'
import { getStripePaymentHistory, PaymentRecord } from '@/actions/admin/stripe-mock'
import { SubscriptionTier as PrismaSubscriptionTier } from '@prisma/client'

// Helper to map UI tier to Prisma tier
const mapTierToPrisma = (tier: string): PrismaSubscriptionTier => {
  switch (tier) {
    case 'Starter': return 'STARTER'
    case 'Standard': return 'STANDARD'
    case 'Smart+': return 'SMART_PLUS'
    case 'Premier': return 'PREMIER'
    default: return 'STARTER'
  }
}

interface SubscriptionTabProps {
  user: UserDetail
}

export const SubscriptionTab: React.FC<SubscriptionTabProps> = ({ user }) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      try {
        const data = await getStripePaymentHistory(user.id)
        if (isMounted) {
          setPayments(data)
        }
      } catch (error) {
        console.error("Failed to load payments", error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [user.id])

  const prismaTier = mapTierToPrisma(user.tier)

  return (
    <div className="max-w-4xl space-y-6">
      {/* Current Subscription Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <CreditCard size={120} className="text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Current Plan</div>
              <div className="flex items-center gap-3">
                <UserTierBadge tier={user.tier} />
              </div>
            </div>
            <div className="flex gap-8">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Duration</div>
                <div className="text-slate-200 text-sm font-mono">
                  {/* Mock display since we don't have subscriptionStart/End in UserDetail yet */}
                  {user.joinDate} - Ongoing
                </div>
              </div>
              <div>
                 <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Status</div>
                 <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 size={14} /> Active
                 </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-end">
            <GrantPermissionDialog userId={user.id} currentTier={prismaTier} />
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-400" />
          Payment History
        </h3>
        {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-500 text-sm">
                Loading payments...
            </div>
        ) : (
            <StripeHistoryTable payments={payments} />
        )}
      </div>
    </div>
  )
}