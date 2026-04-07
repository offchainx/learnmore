import { beforeEach, describe, expect, it, vi } from 'vitest'
import { invalidateReferralReadViews } from '../cache'

const mockRevalidatePath = vi.hoisted(() => vi.fn())

vi.mock('next/cache', () => ({
  revalidatePath: mockRevalidatePath,
}))

describe('invalidateReferralReadViews', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invalidates the referral read views used by dashboard and admin consoles', () => {
    invalidateReferralReadViews({
      userId: 'user-1',
      relatedUserId: 'user-2',
    })

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/settings')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/referrals')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/users')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/users/user-1')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/users/user-2')
  })

  it('still invalidates shared read views when no user ids are provided', () => {
    invalidateReferralReadViews()

    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard/settings')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/referrals')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/users')
  })
})
