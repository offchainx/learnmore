import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { normalizeVoucherCode } from '@/lib/vouchers/preview'

export async function GET(request: NextRequest) {
  try {
    const voucherCode = request.nextUrl.searchParams.get('voucherCode') || ''
    const normalizedVoucherCode = normalizeVoucherCode(voucherCode)

    if (!normalizedVoucherCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing voucherCode',
        },
        { status: 400 },
      )
    }

    if (normalizedVoucherCode.length < 3 || normalizedVoucherCode.length > 32) {
      return NextResponse.json({
        success: true,
        available: false,
        normalizedVoucherCode,
        reason: '优惠券码格式不正确',
      })
    }

    const now = new Date()
    const voucher = await prisma.voucherCode.findUnique({
      where: { code: normalizedVoucherCode },
      select: {
        id: true,
        isActive: true,
        validFrom: true,
        validTo: true,
        maxRedemptions: true,
        redeemedCount: true,
        discountType: true,
        discountValue: true,
        stripeCouponId: true,
      },
    })

    if (!voucher || !voucher.isActive) {
      return NextResponse.json({
        success: true,
        available: false,
        normalizedVoucherCode,
        reason: '优惠券不存在或已失效',
      })
    }

    if (voucher.validFrom && voucher.validFrom > now) {
      return NextResponse.json({
        success: true,
        available: false,
        normalizedVoucherCode,
        reason: '优惠券尚未生效',
      })
    }

    if (voucher.validTo && voucher.validTo < now) {
      return NextResponse.json({
        success: true,
        available: false,
        normalizedVoucherCode,
        reason: '优惠券已过期',
      })
    }

    if (voucher.maxRedemptions !== null && voucher.redeemedCount >= voucher.maxRedemptions) {
      return NextResponse.json({
        success: true,
        available: false,
        normalizedVoucherCode,
        reason: '优惠券已达到使用上限',
      })
    }

    if (!voucher.stripeCouponId) {
      return NextResponse.json({
        success: true,
        available: false,
        normalizedVoucherCode,
        reason: '优惠券尚未配置 Stripe 优惠',
      })
    }

    return NextResponse.json({
      success: true,
      available: true,
      normalizedVoucherCode,
      reason: null,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
    })
  } catch (error) {
    console.error('[voucher-code-availability] failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: '暂时无法验证优惠券',
      },
      { status: 500 },
    )
  }
}
