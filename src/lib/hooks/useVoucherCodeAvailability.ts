import { useEffect, useState } from 'react'
import useDebounce from '@/lib/hooks/useDebounce'
import type { VoucherDiscountType } from '@prisma/client'
import { normalizeVoucherCode } from '@/lib/vouchers/preview'

type VoucherCodeAvailabilityState = {
  status: 'idle' | 'checking' | 'available' | 'unavailable'
  normalizedVoucherCode: string
  reason: string | null
  discountType: VoucherDiscountType | null
  discountValue: number | null
}

export function useVoucherCodeAvailability(voucherCode: string): VoucherCodeAvailabilityState {
  const debouncedVoucherCode = useDebounce(voucherCode, 350)
  const [state, setState] = useState<VoucherCodeAvailabilityState>({
    status: 'idle',
    normalizedVoucherCode: '',
    reason: null,
    discountType: null,
    discountValue: null,
  })

  useEffect(() => {
    const normalizedVoucherCode = normalizeVoucherCode(debouncedVoucherCode)

    if (!normalizedVoucherCode) {
      setState({
        status: 'idle',
        normalizedVoucherCode: '',
        reason: null,
        discountType: null,
        discountValue: null,
      })
      return
    }

    if (normalizedVoucherCode.length < 3 || normalizedVoucherCode.length > 32) {
      setState({
        status: 'unavailable',
        normalizedVoucherCode,
        reason: '优惠券码格式不正确',
        discountType: null,
        discountValue: null,
      })
      return
    }

    const controller = new AbortController()

    setState({
      status: 'checking',
      normalizedVoucherCode,
      reason: null,
      discountType: null,
      discountValue: null,
    })

    fetch(`/api/voucher-code-availability?voucherCode=${encodeURIComponent(normalizedVoucherCode)}`, {
      method: 'GET',
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json()

        if (!response.ok || !payload.success) {
          throw new Error(payload.reason || payload.error || '暂时无法验证优惠券')
        }

        setState({
          status: payload.available ? 'available' : 'unavailable',
          normalizedVoucherCode: payload.normalizedVoucherCode || normalizedVoucherCode,
          reason: payload.reason || null,
          discountType: payload.discountType || null,
          discountValue:
            typeof payload.discountValue === 'number' ? payload.discountValue : null,
        })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setState({
          status: 'unavailable',
          normalizedVoucherCode,
          reason: error instanceof Error ? error.message : '暂时无法验证优惠券',
          discountType: null,
          discountValue: null,
        })
      })

    return () => {
      controller.abort()
    }
  }, [debouncedVoucherCode])

  return state
}
