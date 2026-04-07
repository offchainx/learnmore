import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { lookupReferrerByReferralCode, normalizeReferralCode } from '@/lib/referrals/attribution'

const referralCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{8}$/, '推荐码格式不正确')

export async function GET(request: NextRequest) {
  try {
    const referralCode = request.nextUrl.searchParams.get('referralCode') || ''

    if (!referralCode.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing referralCode',
        },
        { status: 400 },
      )
    }

    const parsed = referralCodeSchema.safeParse(referralCode)
    const normalizedReferralCode = normalizeReferralCode(referralCode) || referralCode.trim().toUpperCase()

    if (!parsed.success) {
      return NextResponse.json({
        success: true,
        available: false,
        normalizedReferralCode,
        reason: parsed.error.issues[0]?.message || '推荐码格式不正确',
      })
    }

    const referrer = await lookupReferrerByReferralCode(parsed.data)

    return NextResponse.json({
      success: true,
      available: Boolean(referrer),
      normalizedReferralCode: parsed.data,
      reason: referrer ? null : '推荐码不存在，请确认后重试',
    })
  } catch (error) {
    console.error('[referral-code-availability] failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: '暂时无法验证推荐码',
      },
      { status: 500 },
    )
  }
}
