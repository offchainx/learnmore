import { act, renderHook } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { useVoucherCodeAvailability } from '../useVoucherCodeAvailability'

describe('useVoucherCodeAvailability', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('空输入时应保持 idle', () => {
    const { result } = renderHook(() => useVoucherCodeAvailability(''))

    expect(result.current.status).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('格式不正确时应立即提示无效且不请求接口', async () => {
    const { result } = renderHook(() => useVoucherCodeAvailability('ab'))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(351)
    })

    expect(result.current.status).toBe('unavailable')
    expect(result.current.reason).toBe('优惠券码格式不正确')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('不存在的优惠券码应提示无效', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        available: false,
        normalizedVoucherCode: 'LM10OFF',
        reason: '优惠券不存在或已失效',
      }),
    })

    const { result } = renderHook(() => useVoucherCodeAvailability('LM10OFF'))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(351)
      await Promise.resolve()
    })

    expect(result.current.status).toBe('unavailable')
    expect(result.current.reason).toBe('优惠券不存在或已失效')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/voucher-code-availability?voucherCode=LM10OFF',
      expect.objectContaining({
        method: 'GET',
      }),
    )
  })
})
