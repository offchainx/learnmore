import { act, renderHook } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { useReferralCodeAvailability } from '../useReferralCodeAvailability'

describe('useReferralCodeAvailability', () => {
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
    const { result } = renderHook(() => useReferralCodeAvailability(''))

    expect(result.current.status).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('格式不正确时应立即提示无效且不请求接口', async () => {
    const { result } = renderHook(() => useReferralCodeAvailability('test'))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(351)
    })

    expect(result.current.status).toBe('unavailable')
    expect(result.current.reason).toBe('推荐码格式不正确')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('不存在的推荐码应提示无效', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        available: false,
        normalizedReferralCode: 'ABCDEFGH',
        reason: '推荐码不存在，请确认后重试',
      }),
    })

    const { result } = renderHook(() => useReferralCodeAvailability('ABCDEFGH'))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(351)
      await Promise.resolve()
    })

    expect(result.current.status).toBe('unavailable')
    expect(result.current.reason).toBe('推荐码不存在，请确认后重试')

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/referral-code-availability?referralCode=ABCDEFGH',
      expect.objectContaining({
        method: 'GET',
      }),
    )
  })
})
