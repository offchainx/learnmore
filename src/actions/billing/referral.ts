'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/actions/user/auth';
import {
  lookupReferrerByReferralCode,
  normalizeReferralCode,
  recordReferralAttributionEvent,
} from '@/lib/referrals/attribution';

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
    const normalizedCode = normalizeReferralCode(referralCode)
    if (normalizedCode) {
      void recordReferralAttributionEvent(prisma, {
        referralCode: normalizedCode,
        eventType: 'BIND',
        refereeId: user?.id ?? null,
        success: false,
        errorCode: 'UNAUTHORIZED',
        metadata: {
          result: 'UNAUTHORIZED',
        },
      }).catch((error) => {
        console.warn('[ReferralAttribution] bind log failed', error)
      })
    }

    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '请先登录后再绑定推荐码',
    };
  }

  const parsed = bindReferralInputSchema.safeParse({ referralCode });
  if (!parsed.success) {
    void recordReferralAttributionEvent(prisma, {
      referralCode,
      eventType: 'BIND',
      refereeId: user.id,
      success: false,
      errorCode: 'INVALID_REFERRAL_CODE',
      metadata: {
        result: 'INVALID_REFERRAL_CODE',
      },
    }).catch((error) => {
      console.warn('[ReferralAttribution] bind log failed', error)
    })

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
    const existingReferrer = await lookupReferrerByReferralCode(normalizedCode)
    void recordReferralAttributionEvent(prisma, {
      referralCode: normalizedCode,
      eventType: 'BIND',
      referrerId: existingReferrer?.id ?? null,
      refereeId: user.id,
      success: existingBinding.referralCode === normalizedCode,
      errorCode: existingBinding.referralCode === normalizedCode ? null : 'REFERRAL_ALREADY_BOUND',
      metadata: {
        result: existingBinding.referralCode === normalizedCode ? 'ALREADY_BOUND' : 'REFERRAL_ALREADY_BOUND',
      },
    }).catch((error) => {
      console.warn('[ReferralAttribution] bind log failed', error)
    })

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
    void recordReferralAttributionEvent(prisma, {
      referralCode: normalizedCode,
      eventType: 'BIND',
      refereeId: user.id,
      success: false,
      errorCode: 'REFERRAL_NOT_FOUND',
      metadata: {
        result: 'REFERRAL_NOT_FOUND',
      },
    }).catch((error) => {
      console.warn('[ReferralAttribution] bind log failed', error)
    })

    return {
      ok: false,
      code: 'REFERRAL_NOT_FOUND',
      message: '推荐码不存在，请确认后重试',
    };
  }

  if (referrer.id === user.id) {
    void recordReferralAttributionEvent(prisma, {
      referralCode: normalizedCode,
      eventType: 'BIND',
      referrerId: referrer.id,
      refereeId: user.id,
      success: false,
      errorCode: 'SELF_REFERRAL',
      metadata: {
        result: 'SELF_REFERRAL',
      },
    }).catch((error) => {
      console.warn('[ReferralAttribution] bind log failed', error)
    })

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

    void recordReferralAttributionEvent(prisma, {
      referralCode: normalizedCode,
      eventType: 'BIND',
      referrerId: referrer.id,
      refereeId: user.id,
      success: true,
      metadata: {
        result: 'BOUND',
      },
    }).catch((error) => {
      console.warn('[ReferralAttribution] bind log failed', error)
    })
  } catch (error) {
    // 并发下 unique(refereeId) 可能命中
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      void recordReferralAttributionEvent(prisma, {
        referralCode: normalizedCode,
        eventType: 'BIND',
        referrerId: referrer.id,
        refereeId: user.id,
        success: false,
        errorCode: 'REFERRAL_ALREADY_BOUND',
        metadata: {
          result: 'REFERRAL_ALREADY_BOUND',
        },
      }).catch((logError) => {
        console.warn('[ReferralAttribution] bind log failed', logError)
      })

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

export async function recordReferralCopyAction(input: {
  referralCode: string
  sourcePath?: string | null
  destinationPath?: string | null
}) {
  const user = await getCurrentUser()
  if (!user || !user.email) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '请先登录后再记录分享',
    }
  }

  const normalizedCode = normalizeReferralCode(input.referralCode)
  if (!normalizedCode) {
    return {
      ok: false,
      code: 'INVALID_REFERRAL_CODE',
      message: '推荐码格式不正确',
    }
  }

  try {
    await recordReferralAttributionEvent(prisma, {
      referralCode: normalizedCode,
      eventType: 'COPY',
      referrerId: user.id,
      sourcePath: input.sourcePath ?? null,
      destinationPath: input.destinationPath ?? null,
      metadata: {
        action: 'copy_referral_link',
      },
    })
  } catch (error) {
    console.warn('[ReferralAttribution] copy log failed', error)
  }

  return {
    ok: true,
    code: 'COPIED',
    message: '推荐链接已记录',
  }
}
