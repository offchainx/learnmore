'use server'

import { createClient } from '@supabase/supabase-js'
import { REFERRAL_SOURCES, type ReferralSource } from '@/lib/marketing/beta-signup-options'

// 内测报名表单写入的是 Learnbank *移动端* 生产库（project wuhnfyplwyqwvanqwgpc），
// 不是本仓库自己的 Supabase 项目（kyepcpkzmoxiyrpmwlnu，见 .env 的 NEXT_PUBLIC_SUPABASE_URL）。
// 两个项目分开，所以这里单独起一个 client，专用一对独立的 env 变量。
// 表 `beta_signups` 的 RLS 只放行 insert，用 anon key 已经是最小权限，不需要 service role。
const learnbankUrl = process.env.LEARNBANK_SUPABASE_URL
const learnbankAnonKey = process.env.LEARNBANK_SUPABASE_ANON_KEY

export type DeviceType = 'ios' | 'android'

export interface BetaSignupParams {
  email: string
  deviceType: DeviceType
  testingInterest?: string
  referralSource?: ReferralSource | ''
  /** 落地页 URL 上的 ?utm_source= 原值，由客户端读 window.location 后带上来 */
  utmSource?: string
}

export interface BetaSignupResult {
  ok: boolean
  error?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// utm_source 来自 URL，等于让任何人往库里写字符串。库里有长度约束，这里再做一次
// 归一化：小写、只留 [a-z0-9_-]、截到 64 字符。归一化后为空就当没有。
function normalizeUtmSource(raw: string | undefined): string | null {
  if (!raw) return null
  const cleaned = raw.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64)
  return cleaned || null
}

export async function submitBetaSignup(params: BetaSignupParams): Promise<BetaSignupResult> {
  const email = params.email.trim().toLowerCase()
  const deviceType = params.deviceType
  const testingInterest = params.testingInterest?.trim() || null
  const referralSource =
    params.referralSource && (REFERRAL_SOURCES as readonly string[]).includes(params.referralSource)
      ? params.referralSource
      : null
  const utmSource = normalizeUtmSource(params.utmSource)

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: 'invalid_email' }
  }
  if (deviceType !== 'ios' && deviceType !== 'android') {
    return { ok: false, error: 'invalid_device_type' }
  }

  if (!learnbankUrl || !learnbankAnonKey) {
    console.error('[beta-signup] Missing LEARNBANK_SUPABASE_URL / LEARNBANK_SUPABASE_ANON_KEY')
    return { ok: false, error: 'not_configured' }
  }

  const supabase = createClient(learnbankUrl, learnbankAnonKey, {
    auth: { persistSession: false },
  })

  const { error } = await supabase.from('beta_signups').insert({
    email,
    device_type: deviceType,
    testing_interest: testingInterest,
    referral_source: referralSource,
    utm_source: utmSource,
  })

  if (error) {
    console.error('[beta-signup] insert failed:', error.message)
    return { ok: false, error: 'insert_failed' }
  }

  return { ok: true }
}
