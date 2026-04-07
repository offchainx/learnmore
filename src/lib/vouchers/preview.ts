import type { VoucherDiscountType } from '@prisma/client'

export type VoucherPreviewDiscount = {
  discountType: VoucherDiscountType
  discountValue: number
}

export function normalizeVoucherCode(value?: string | null): string | null {
  const normalized = value?.trim().toUpperCase()
  return normalized || null
}

export function calculateVoucherDiscountedPrice(
  basePrice: number,
  voucher?: VoucherPreviewDiscount | null,
): number {
  if (!voucher || !Number.isFinite(basePrice) || basePrice <= 0) {
    return Math.max(0, Math.trunc(basePrice) || 0)
  }

  if (voucher.discountType === 'PERCENT') {
    const discounted = basePrice - Math.floor((basePrice * voucher.discountValue) / 100)
    return Math.max(0, Math.trunc(discounted))
  }

  return Math.max(0, Math.trunc(basePrice - voucher.discountValue))
}

export function calculateVoucherSavings(
  basePrice: number,
  voucher?: VoucherPreviewDiscount | null,
): number {
  const discountedPrice = calculateVoucherDiscountedPrice(basePrice, voucher)
  return Math.max(0, Math.trunc(basePrice) - discountedPrice)
}
