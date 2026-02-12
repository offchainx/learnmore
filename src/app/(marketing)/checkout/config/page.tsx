import { Button } from '@/components/ui/button';
import { CheckoutConfigClient } from './CheckoutConfigClient';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type PlanKey = 'standard' | 'smart_plus' | 'premier';
type BillingCycle = 'monthly' | 'annual';

function parsePlanKey(value: string | string[] | undefined): PlanKey | null {
  const normalized = Array.isArray(value) ? value[0] : value;
  if (normalized === 'standard' || normalized === 'smart_plus' || normalized === 'premier') {
    return normalized;
  }
  return null;
}

function parseBillingCycle(value: string | string[] | undefined): BillingCycle {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized === 'annual' ? 'annual' : 'monthly';
}

export default async function CheckoutConfigPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const planKey = parsePlanKey(params.planKey);
  const billingCycle = parseBillingCycle(params.billingCycle);

  if (!planKey) {
    return (
      <div className="min-h-screen bg-slate-950 text-white px-4 pt-24">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
          <h1 className="text-2xl font-bold mb-3">参数无效</h1>
          <p className="text-slate-300 mb-6">请从价格页重新选择套餐后继续。</p>
          <Button asChild>
            <a href="/pricing">返回价格页</a>
          </Button>
        </div>
      </div>
    );
  }

  return <CheckoutConfigClient planKey={planKey} billingCycle={billingCycle} />;
}

