'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/actions/user/auth';

const bindReferralInputSchema = z.object({
  referralCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{8}$/, '推荐码格式不正确'),
});

type BindReferralResult = {
  ok: boolean;
  code: string;
  message: string;
};

export async function bindReferralCodeAction(referralCode: string): Promise<BindReferralResult> {
  const user = await getCurrentUser();
  if (!user || !user.email) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '请先登录后再绑定推荐码',
    };
  }

  const parsed = bindReferralInputSchema.safeParse({ referralCode });
  if (!parsed.success) {
    return {
      ok: false,
      code: 'INVALID_REFERRAL_CODE',
      message: parsed.error.issues[0]?.message || '推荐码格式不正确',
    };
  }

  const normalizedCode = parsed.data.referralCode;

  const existingBinding = await prisma.referral.findUnique({
    where: { refereeId: user.id },
    select: {
      id: true,
      referralCode: true,
    },
  });

  if (existingBinding) {
    if (existingBinding.referralCode === normalizedCode) {
      return {
        ok: true,
        code: 'ALREADY_BOUND',
        message: '推荐码已绑定，无需重复操作',
      };
    }

    return {
      ok: false,
      code: 'REFERRAL_ALREADY_BOUND',
      message: '您已绑定过推荐码，暂不支持修改',
    };
  }

  const referrer = await prisma.user.findUnique({
    where: { referralCode: normalizedCode },
    select: {
      id: true,
      email: true,
      subscriptionTier: true,
    },
  });

  if (!referrer) {
    return {
      ok: false,
      code: 'REFERRAL_NOT_FOUND',
      message: '推荐码不存在，请确认后重试',
    };
  }

  if (referrer.id === user.id) {
    return {
      ok: false,
      code: 'SELF_REFERRAL',
      message: '不能绑定自己的推荐码',
    };
  }

  try {
    await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        refereeId: user.id,
        referralCode: normalizedCode,
        refereeEmail: user.email,
        status: 'PENDING',
        bindSource: 'UPGRADE',
      },
    });
  } catch (error) {
    // 并发下 unique(refereeId) 可能命中
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return {
        ok: false,
        code: 'REFERRAL_ALREADY_BOUND',
        message: '您已绑定过推荐码，暂不支持修改',
      };
    }

    console.error('[Referral] bind error', error);
    return {
      ok: false,
      code: 'BIND_FAILED',
      message: '绑定推荐码失败，请稍后再试',
    };
  }

  return {
    ok: true,
    code: 'BOUND',
    message: '推荐码绑定成功',
  };
}

