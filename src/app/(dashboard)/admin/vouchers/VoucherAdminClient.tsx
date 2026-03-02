'use client';

import { useState, useTransition } from 'react';
import { VoucherDiscountType } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/labeled-input';
import { toast } from '@/components/ui/use-toast';
import {
  createVoucherCodeAction,
  toggleVoucherStatusAction,
} from '@/actions/admin/voucher';

type VoucherListItem = {
  id: string;
  code: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  isActive: boolean;
  maxRedemptions: number | null;
  redeemedCount: number;
  validFrom: string | null;
  validTo: string | null;
  stripeCouponId: string | null;
  createdAt: string;
};

interface VoucherAdminClientProps {
  vouchers: VoucherListItem[];
}

export function VoucherAdminClient({ vouchers }: VoucherAdminClientProps) {
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<VoucherDiscountType>('AMOUNT');
  const [discountValue, setDiscountValue] = useState('10');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [stripeCouponId, setStripeCouponId] = useState('');

  const submitCreate = () => {
    startTransition(async () => {
      const parsedDiscount = Number(discountValue);
      if (!Number.isFinite(parsedDiscount) || parsedDiscount <= 0) {
        toast({
          title: '创建失败',
          description: '折扣值必须为正整数',
          variant: 'destructive',
        });
        return;
      }

      const result = await createVoucherCodeAction({
        code,
        discountType,
        discountValue: Math.trunc(parsedDiscount),
        maxRedemptions: maxRedemptions ? Math.trunc(Number(maxRedemptions)) : null,
        validFrom: validFrom ? new Date(validFrom).toISOString() : null,
        validTo: validTo ? new Date(validTo).toISOString() : null,
        stripeCouponId: stripeCouponId || null,
      });

      if (!result.ok) {
        toast({
          title: '创建失败',
          description: result.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '创建成功',
        description: result.message,
      });

      setCode('');
      setDiscountType('AMOUNT');
      setDiscountValue('10');
      setMaxRedemptions('');
      setValidFrom('');
      setValidTo('');
      setStripeCouponId('');

      window.location.reload();
    });
  };

  const toggleStatus = (voucherId: string, nextActive: boolean) => {
    startTransition(async () => {
      const result = await toggleVoucherStatusAction(voucherId, nextActive);
      if (!result.ok) {
        toast({
          title: '更新失败',
          description: result.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '更新成功',
        description: result.message,
      });
      window.location.reload();
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-xl font-bold text-white mb-4">创建 Voucher</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="例如: LM10OFF"
          />

          <div>
            <label className="text-sm text-slate-300 block mb-2">Discount Type</label>
            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              value={discountType}
              onChange={(event) => setDiscountType(event.target.value as VoucherDiscountType)}
            >
              <option value="AMOUNT">AMOUNT</option>
              <option value="PERCENT">PERCENT</option>
            </select>
          </div>

          <Input
            label="Discount Value"
            type="number"
            value={discountValue}
            onChange={(event) => setDiscountValue(event.target.value)}
            placeholder={discountType === 'PERCENT' ? '例如 10（10%）' : '例如 10（RM10）'}
          />

          <Input
            label="Max Redemptions（可选）"
            type="number"
            value={maxRedemptions}
            onChange={(event) => setMaxRedemptions(event.target.value)}
            placeholder="留空 = 不限"
          />

          <Input
            label="Valid From（可选）"
            type="datetime-local"
            value={validFrom}
            onChange={(event) => setValidFrom(event.target.value)}
          />

          <Input
            label="Valid To（可选）"
            type="datetime-local"
            value={validTo}
            onChange={(event) => setValidTo(event.target.value)}
          />

          <Input
            label="Stripe Coupon ID（可选）"
            value={stripeCouponId}
            onChange={(event) => setStripeCouponId(event.target.value)}
            placeholder="例如: 3mQw..."
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={submitCreate} disabled={isPending || !code.trim()}>
            {isPending ? '处理中...' : '创建 Voucher'}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 overflow-auto">
        <h2 className="text-xl font-bold text-white mb-4">Voucher 列表</h2>
        <table className="w-full text-sm text-left text-slate-200">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="py-2 pr-4">Code</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Value</th>
              <th className="py-2 pr-4">Usage</th>
              <th className="py-2 pr-4">Stripe Coupon</th>
              <th className="py-2 pr-4">Window</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((voucher) => (
              <tr key={voucher.id} className="border-b border-slate-800/60">
                <td className="py-3 pr-4 font-mono">{voucher.code}</td>
                <td className="py-3 pr-4">{voucher.discountType}</td>
                <td className="py-3 pr-4">
                  {voucher.discountType === 'PERCENT'
                    ? `${voucher.discountValue}%`
                    : `RM ${voucher.discountValue}`}
                </td>
                <td className="py-3 pr-4">
                  {voucher.redeemedCount}
                  {voucher.maxRedemptions !== null ? ` / ${voucher.maxRedemptions}` : ' / ∞'}
                </td>
                <td className="py-3 pr-4 font-mono text-xs">{voucher.stripeCouponId || '—'}</td>
                <td className="py-3 pr-4 text-xs">
                  <div>{voucher.validFrom ? new Date(voucher.validFrom).toLocaleString('zh-CN') : '—'}</div>
                  <div>{voucher.validTo ? new Date(voucher.validTo).toLocaleString('zh-CN') : '—'}</div>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      voucher.isActive
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {voucher.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleStatus(voucher.id, !voucher.isActive)}
                    disabled={isPending}
                  >
                    {voucher.isActive ? '停用' : '启用'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
