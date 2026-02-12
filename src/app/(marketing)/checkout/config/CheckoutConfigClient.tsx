'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/labeled-input';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { prepareCheckoutAction } from '@/actions/billing/checkout';

type PlanKey = 'standard' | 'smart_plus' | 'premier';
type BillingCycle = 'monthly' | 'annual';
type PaymentMode = 'stripe' | 'touch_n_go' | 'bank_transfer';

const PLAN_LABEL: Record<PlanKey, string> = {
  standard: 'Standard',
  smart_plus: 'Smart Plus',
  premier: 'Premier',
};

const CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: '月付',
  annual: '年付',
};

interface CheckoutConfigClientProps {
  planKey: PlanKey;
  billingCycle: BillingCycle;
}

export function CheckoutConfigClient({ planKey, billingCycle }: CheckoutConfigClientProps) {
  const router = useRouter();
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('stripe');
  const [referralCode, setReferralCode] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      const result = await prepareCheckoutAction({
        planKey,
        billingCycle,
        paymentMode,
        referralCode,
        voucherCode,
      });

      if (!result.ok) {
        if (result.code === 'UNAUTHORIZED') {
          router.push('/login?redirectTo=%2Fcheckout%2Fconfig');
          return;
        }

        toast({
          title: '无法创建支付会话',
          description: result.message,
          variant: 'destructive',
        });
        return;
      }

      if (!result.checkoutUrl) {
        toast({
          title: '创建失败',
          description: '缺少 Stripe 跳转链接',
          variant: 'destructive',
        });
        return;
      }

      window.location.assign(result.checkoutUrl);
    });
  };

  const paymentModeCard = (mode: PaymentMode, title: string, description: string, disabled = false) => (
    <button
      type="button"
      disabled={disabled || isPending}
      onClick={() => !disabled && setPaymentMode(mode)}
      className={`w-full text-left rounded-2xl border px-4 py-4 transition ${
        paymentMode === mode && !disabled
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-slate-700 bg-slate-900/40'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-500'}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-white">{title}</div>
          <div className="text-xs text-slate-400 mt-1">{description}</div>
        </div>
        {disabled && (
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-slate-700 text-slate-300">
            即将支持
          </span>
        )}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">确认支付配置</h1>
          <p className="text-slate-300 mt-2">
            套餐：<span className="text-white font-semibold">{PLAN_LABEL[planKey]}</span>
            {' · '}
            周期：<span className="text-white font-semibold">{CYCLE_LABEL[billingCycle]}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">1. 选择支付方式</h2>
            <div className="space-y-3">
              {paymentModeCard('stripe', 'Stripe', '信用卡 / 借记卡（本期已支持）')}
              {paymentModeCard('touch_n_go', 'Touch n Go', '本期仅占位展示', true)}
              {paymentModeCard('bank_transfer', '银行转账', '本期仅占位展示', true)}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">2. 可选优惠信息</h2>
            <div className="grid gap-4">
              <Input
                label="Referral Code（可选）"
                value={referralCode}
                onChange={(event) => setReferralCode(event.target.value.toUpperCase())}
                placeholder="例如：AB12CD34"
                maxLength={8}
              />
              <Input
                label="Voucher Code（可选）"
                value={voucherCode}
                onChange={(event) => setVoucherCode(event.target.value.toUpperCase())}
                placeholder="输入折扣码"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              推荐码只允许首次绑定且不可修改；Voucher 与 Referral 可叠加（以系统校验结果为准）。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-100 hover:bg-slate-800"
              onClick={() => router.push('/pricing')}
              disabled={isPending}
            >
              返回价格页
            </Button>
            <Button
              onClick={submit}
              disabled={isPending}
              className="sm:ml-auto min-w-[200px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  正在创建支付会话...
                </>
              ) : (
                '继续前往支付'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

