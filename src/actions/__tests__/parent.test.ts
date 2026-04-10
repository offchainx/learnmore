import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    inviteCode: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}))

vi.mock('@/actions/user/auth', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

import { getCurrentUser } from '@/actions/user/auth'
import { generateInviteCode } from '../user/parent'

describe('generateInviteCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return existing active invite code for idempotent retries', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 'student-1',
      role: 'STUDENT',
    } as any)
    mockPrisma.inviteCode.findFirst.mockResolvedValue({
      code: 'ABC123',
    })

    const result = await generateInviteCode()

    expect(result).toEqual({ success: true, code: 'ABC123' })
    expect(mockPrisma.inviteCode.create).not.toHaveBeenCalled()
  })

  it('should create a new invite code when no active code exists', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: 'student-1',
      role: 'STUDENT',
    } as any)
    mockPrisma.inviteCode.findFirst.mockResolvedValue(null)
    mockPrisma.inviteCode.create.mockResolvedValue({
      code: 'ZXCV12',
    })

    const result = await generateInviteCode()

    expect(result).toEqual({ success: true, code: 'ZXCV12' })
    expect(mockPrisma.inviteCode.create).toHaveBeenCalledTimes(1)
  })
})
