import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  normalizeReferralCode,
  recordReferralAttributionEvent,
} from '@/lib/referrals/attribution'

type RouteContext = {
  params: Promise<{
    code: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { code } = await params
  const normalizedCode = normalizeReferralCode(code)
  const sourcePath = `${request.nextUrl.pathname}${request.nextUrl.search}`

  const destinationUrl = new URL('/register', request.url)
  let referralError: string | null = null
  if (normalizedCode) {
    destinationUrl.searchParams.set('referralCode', normalizedCode)
  }

  try {
    const referrer = normalizedCode
      ? await prisma.user.findUnique({
          where: { referralCode: normalizedCode },
          select: { id: true },
        })
      : null

    await recordReferralAttributionEvent(prisma, {
      referralCode: normalizedCode || code,
      eventType: 'CLICK',
      referrerId: referrer?.id ?? null,
      sourcePath,
      destinationPath: `${destinationUrl.pathname}${destinationUrl.search}`,
      success: !!normalizedCode && !!referrer,
      errorCode: !normalizedCode
        ? 'INVALID_REFERRAL_CODE'
        : referrer
          ? null
          : 'REFERRAL_NOT_FOUND',
      metadata: {
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
      },
    })

    if (!normalizedCode) {
      referralError = 'INVALID_REFERRAL_CODE'
    } else if (!referrer) {
      referralError = 'REFERRAL_NOT_FOUND'
    }
  } catch (error) {
    console.warn('[ReferralAttribution] click log failed', error)
  }

  if (referralError) {
    destinationUrl.searchParams.set('referralError', referralError)
  }

  return NextResponse.redirect(destinationUrl)
}
