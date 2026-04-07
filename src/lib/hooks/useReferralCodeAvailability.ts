import { useEffect, useState } from 'react'
import useDebounce from '@/lib/hooks/useDebounce'

type ReferralCodeAvailabilityState = {
  status: 'idle' | 'checking' | 'available' | 'unavailable'
  normalizedReferralCode: string
  reason: string | null
}

function normalizeReferralCode(value: string): string {
  return value.trim().toUpperCase()
}

export function useReferralCodeAvailability(referralCode: string): ReferralCodeAvailabilityState {
  const debouncedReferralCode = useDebounce(referralCode, 350)
  const [state, setState] = useState<ReferralCodeAvailabilityState>({
    status: 'idle',
    normalizedReferralCode: '',
    reason: null,
  })

  useEffect(() => {
    const normalizedReferralCode = normalizeReferralCode(debouncedReferralCode)

    if (!normalizedReferralCode) {
      setState({
        status: 'idle',
        normalizedReferralCode: '',
        reason: null,
      })
      return
    }

    if (!/^[A-Z0-9]{8}$/.test(normalizedReferralCode)) {
      setState({
        status: 'unavailable',
        normalizedReferralCode,
        reason: '推荐码格式不正确',
      })
      return
    }

    const controller = new AbortController()

    setState({
      status: 'checking',
      normalizedReferralCode,
      reason: null,
    })

    fetch(`/api/referral-code-availability?referralCode=${encodeURIComponent(normalizedReferralCode)}`, {
      method: 'GET',
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json()

        if (!response.ok || !payload.success) {
          throw new Error(payload.reason || payload.error || '暂时无法验证推荐码')
        }

        setState({
          status: payload.available ? 'available' : 'unavailable',
          normalizedReferralCode: payload.normalizedReferralCode || normalizedReferralCode,
          reason: payload.reason || null,
        })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setState({
          status: 'unavailable',
          normalizedReferralCode,
          reason: error instanceof Error ? error.message : '暂时无法验证推荐码',
        })
      })

    return () => {
      controller.abort()
    }
  }, [debouncedReferralCode])

  return state
}
