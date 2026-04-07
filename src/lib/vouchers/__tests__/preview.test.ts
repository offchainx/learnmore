import { describe, expect, it } from 'vitest'
import {
  calculateVoucherDiscountedPrice,
  calculateVoucherSavings,
  normalizeVoucherCode,
} from '../preview'

describe('voucher preview helpers', () => {
  it('should normalize voucher code', () => {
    expect(normalizeVoucherCode('  lm10off  ')).toBe('LM10OFF')
    expect(normalizeVoucherCode('')).toBeNull()
    expect(normalizeVoucherCode(null)).toBeNull()
  })

  it('should calculate percent discount correctly', () => {
    expect(
      calculateVoucherDiscountedPrice(100, {
        discountType: 'PERCENT',
        discountValue: 10,
      }),
    ).toBe(90)

    expect(
      calculateVoucherSavings(100, {
        discountType: 'PERCENT',
        discountValue: 10,
      }),
    ).toBe(10)
  })

  it('should calculate amount discount correctly and never go below zero', () => {
    expect(
      calculateVoucherDiscountedPrice(60, {
        discountType: 'AMOUNT',
        discountValue: 15,
      }),
    ).toBe(45)

    expect(
      calculateVoucherDiscountedPrice(60, {
        discountType: 'AMOUNT',
        discountValue: 100,
      }),
    ).toBe(0)
  })
})
