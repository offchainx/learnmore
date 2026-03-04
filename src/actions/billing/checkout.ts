'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { bindReferralCodeAction } from '@/actions/billing/referral';
import { createCheckoutSession } from '@/actions/billing/stripe';
import { getCurrentUser } from '@/actions/user/auth';

const prepareCheckoutInputSchema = z.object({
  planKey: z.enum(['standard', 'smart_plus', 'premier']),
  billingCycle: z.enum(['monthly', 'annual']),
  paymentMode: z.enum(['stripe', 'touch_n_go', 'bank_transfer']),
  referralCode: z.string().trim().optional().or(z.literal('')),
  voucherCode: z.string().trim().optional().or(z.literal('')),
});

type PrepareCheckoutInput = z.infer<typeof prepareCheckoutInputSchema>;

type PrepareCheckoutResult = {
  ok: boolean;
  code: string;
  message: string;
  checkoutUrl?: string;
};

function normalizeCode(code?: string): string | null {
  const normalized = code?.trim().toUpperCase();
  return normalized ? normalized : null;
}

async function resolveVoucherCouponId(userId: string, voucherCode?: string): Promise<{
  ok: boolean;
  code: string;
  message: string;
  stripeCouponId?: string;
  normalizedVoucherCode?: string;
}> {
  const normalizedVoucherCode = normalizeCode(voucherCode);
  if (!normalizedVoucherCode) {
    return { ok: true, code: 'NO_VOUCHER', message: 'No voucher applied' };
  }

  const now = new Date();
  const voucher = await prisma.voucherCode.findUnique({
    where: { code: normalizedVoucherCode },
    select: {
      id: true,
      isActive: true,
      validFrom: true,
      validTo: true,
      maxRedemptions: true,
      redeemedCount: true,
      stripeCouponId: true,
    },
  });

  if (!voucher || !voucher.isActive) {
    return { ok: false, code: 'INVALID_VOUCHER', message: 'Voucher 不存在或已失效' };
  }

  if (voucher.validFrom && voucher.validFrom > now) {
    return { ok: false, code: 'VOUCHER_NOT_STARTED', message: 'Voucher 尚未生效' };
  }

  if (voucher.validTo && voucher.validTo < now) {
    return { ok: false, code: 'VOUCHER_EXPIRED', message: 'Voucher 已过期' };
  }

  if (voucher.maxRedemptions !== null && voucher.redeemedCount >= voucher.maxRedemptions) {
    return { ok: false, code: 'VOUCHER_EXHAUSTED', message: 'Voucher 已达到使用上限' };
  }

  const usedByCurrentUser = await prisma.voucherRedemption.findFirst({
    where: {
      voucherId: voucher.id,
      userId,
    },
    select: { id: true },
  });

  if (usedByCurrentUser) {
    return { ok: false, code: 'VOUCHER_ALREADY_USED', message: '该 Voucher 您已使用过' };
  }

  if (!voucher.stripeCouponId) {
    return {
      ok: false,
      code: 'VOUCHER_NOT_READY',
      message: '该 Voucher 尚未配置 Stripe Coupon',
    };
  }

  return {
    ok: true,
    code: 'VOUCHER_OK',
    message: 'Voucher 验证通过',
    stripeCouponId: voucher.stripeCouponId,
    normalizedVoucherCode,
  };
}

export async function prepareCheckoutAction(input: PrepareCheckoutInput): Promise<PrepareCheckoutResult> {
  const user = await getCurrentUser();
  if (!user || !user.email) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '请先登录后再继续支付',
    };
  }

  const parsed = prepareCheckoutInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: 'INVALID_INPUT',
      message: parsed.error.issues[0]?.message || '输入参数不正确',
    };
  }

  const payload = parsed.data;

  if (payload.paymentMode !== 'stripe') {
    return {
      ok: false,
      code: 'PAYMENT_MODE_NOT_READY',
      message: '当前仅支持 Stripe 支付，其他方式即将支持',
    };
  }

  const normalizedReferralCode = normalizeCode(payload.referralCode);
  if (normalizedReferralCode) {
    const bindResult = await bindReferralCodeAction(normalizedReferralCode);
    if (!bindResult.ok) {
      return bindResult;
    }
  }

  const voucherResult = await resolveVoucherCouponId(user.id, payload.voucherCode);
  if (!voucherResult.ok) {
    return voucherResult;
  }

  const cancelRedirectPath = `/pricing?payment=cancelled&planKey=${payload.planKey}&billingCycle=${payload.billingCycle}`;
  const checkoutResult = await createCheckoutSession(payload.planKey, payload.billingCycle, {
    paymentMode: payload.paymentMode,
    referralCode: normalizedReferralCode,
    voucherCode: voucherResult.normalizedVoucherCode || null,
    stripeCouponId: voucherResult.stripeCouponId || null,
    cancelRedirectPath,
  });

  if (!checkoutResult.ok) {
    return {
      ok: false,
      code: checkoutResult.error.code,
      message: checkoutResult.error.message,
    };
  }

  return {
    ok: true,
    code: 'CHECKOUT_READY',
    message: 'Checkout session created',
    checkoutUrl: checkoutResult.checkoutUrl,
  };
}
