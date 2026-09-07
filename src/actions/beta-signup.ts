'use server'

import { createClient } from '@supabase/supabase-js'

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
}

export interface BetaSignupResult {
  ok: boolean
  error?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function submitBetaSignup(params: BetaSignupParams): Promise<BetaSignupResult> {
  const email = params.email.trim().toLowerCase()
  const deviceType = params.deviceType
  const testingInterest = params.testingInterest?.trim() || null

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
  })

  if (error) {
    console.error('[beta-signup] insert failed:', error.message)
    return { ok: false, error: 'insert_failed' }
  }

  return { ok: true }
}
