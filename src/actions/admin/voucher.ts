'use server'

import { VoucherDiscountType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { resolveRequestAdminIdentity } from '@/lib/auth/request-user'

const createVoucherInputSchema = z.object({
  code: z.string().trim().min(3).max(32),
  discountType: z.enum(['AMOUNT', 'PERCENT']),
  discountValue: z.number().int().positive(),
  maxRedemptions: z.number().int().positive().nullable().optional(),
  validFrom: z.string().datetime().nullable().optional(),
  validTo: z.string().datetime().nullable().optional(),
  stripeCouponId: z.string().trim().min(1).nullable().optional(),
})

type CreateVoucherInput = z.infer<typeof createVoucherInputSchema>

type VoucherActionResult = {
  ok: boolean
  code: string
  message: string
}

function normalizeVoucherCode(code: string): string {
  return code.trim().toUpperCase()
}

async function ensureAdmin() {
  const currentUser = await resolveRequestAdminIdentity()
  if (!currentUser) {
    return null
  }
  return currentUser
}

export async function createVoucherCodeAction(
  input: CreateVoucherInput
): Promise<VoucherActionResult> {
  const admin = await ensureAdmin()
  if (!admin) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '仅管理员可操作 Voucher',
    }
  }

  const parsed = createVoucherInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      code: 'INVALID_INPUT',
      message: parsed.error.issues[0]?.message || '输入参数不正确',
    }
  }

  const payload = parsed.data
  const normalizedCode = normalizeVoucherCode(payload.code)

  if (payload.discountType === 'PERCENT' && payload.discountValue > 100) {
    return {
      ok: false,
      code: 'INVALID_PERCENT',
      message: '百分比折扣不能超过 100',
    }
  }

  const validFrom = payload.validFrom ? new Date(payload.validFrom) : null
  const validTo = payload.validTo ? new Date(payload.validTo) : null

  if (validFrom && validTo && validFrom > validTo) {
    return {
      ok: false,
      code: 'INVALID_DATE_RANGE',
      message: '生效时间不能晚于失效时间',
    }
  }

  try {
    await prisma.voucherCode.create({
      data: {
        code: normalizedCode,
        discountType: payload.discountType as VoucherDiscountType,
        discountValue: payload.discountValue,
        maxRedemptions: payload.maxRedemptions ?? null,
        validFrom,
        validTo,
        stripeCouponId: payload.stripeCouponId ?? null,
        isActive: true,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return {
        ok: false,
        code: 'DUPLICATE_CODE',
        message: 'Voucher Code 已存在',
      }
    }

    console.error('[VoucherAdmin] create failed', error)
    return {
      ok: false,
      code: 'CREATE_FAILED',
      message: '创建 Voucher 失败，请稍后再试',
    }
  }

  revalidatePath('/admin/vouchers')
  revalidatePath('/admin/referrals')
  revalidatePath('/pricing')

  return {
    ok: true,
    code: 'CREATED',
    message: 'Voucher 已创建',
  }
}

export async function toggleVoucherStatusAction(
  voucherId: string,
  isActive: boolean
): Promise<VoucherActionResult> {
  const admin = await ensureAdmin()
  if (!admin) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: '仅管理员可操作 Voucher',
    }
  }

  if (!voucherId) {
    return {
      ok: false,
      code: 'INVALID_VOUCHER_ID',
      message: '缺少 Voucher ID',
    }
  }

  try {
    await prisma.voucherCode.update({
      where: { id: voucherId },
      data: { isActive },
    })
  } catch (error) {
    console.error('[VoucherAdmin] toggle failed', error)
    return {
      ok: false,
      code: 'UPDATE_FAILED',
      message: '更新 Voucher 状态失败',
    }
  }

  revalidatePath('/admin/vouchers')
  revalidatePath('/admin/referrals')
  revalidatePath('/pricing')

  return {
    ok: true,
    code: 'UPDATED',
    message: isActive ? 'Voucher 已启用' : 'Voucher 已停用',
  }
}
