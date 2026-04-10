import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockPrisma, mockSendEmail } = vi.hoisted(() => ({
  mockPrisma: {
    subscriber: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  mockSendEmail: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}))

vi.mock('@/lib/email', () => ({
  sendEmail: mockSendEmail,
}))

import { subscribeToNewsletter } from '../marketing/campaign'

describe('subscribeToNewsletter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should normalize email and create a new subscriber', async () => {
    mockPrisma.subscriber.findUnique.mockResolvedValue(null)
    mockPrisma.subscriber.create.mockResolvedValue({
      id: 'subscriber-1',
    })
    mockSendEmail.mockResolvedValue({
      success: true,
      data: { id: 'email-1' },
    })

    const formData = new FormData()
    formData.append('email', 'Test@Example.com')

    const result = await subscribeToNewsletter(null, formData)

    expect(result).toEqual({
      success: true,
      code: 'SUBSCRIBED',
      message: 'Successfully subscribed! Please check your email.',
    })
    expect(mockPrisma.subscriber.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      select: { id: true },
    })
    expect(mockPrisma.subscriber.create).toHaveBeenCalledWith({
      data: { email: 'test@example.com' },
    })
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
      })
    )
  })

  it('should return a success state when the email is already subscribed', async () => {
    mockPrisma.subscriber.findUnique.mockResolvedValue({
      id: 'subscriber-1',
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')

    const result = await subscribeToNewsletter(null, formData)

    expect(result).toEqual({
      success: true,
      code: 'ALREADY_SUBSCRIBED',
      message: 'You are already subscribed.',
    })
    expect(mockPrisma.subscriber.create).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('should treat a concurrent unique constraint as already subscribed', async () => {
    mockPrisma.subscriber.findUnique.mockResolvedValue(null)
    mockPrisma.subscriber.create.mockRejectedValue({
      code: 'P2002',
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')

    const result = await subscribeToNewsletter(null, formData)

    expect(result).toEqual({
      success: true,
      code: 'ALREADY_SUBSCRIBED',
      message: 'You are already subscribed.',
    })
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('should keep the subscription when the welcome email fails', async () => {
    mockPrisma.subscriber.findUnique.mockResolvedValue(null)
    mockPrisma.subscriber.create.mockResolvedValue({
      id: 'subscriber-1',
    })
    mockSendEmail.mockResolvedValue({
      success: false,
      error: 'Missing API key',
    })

    const formData = new FormData()
    formData.append('email', 'test@example.com')

    const result = await subscribeToNewsletter(null, formData)

    expect(result).toEqual({
      success: true,
      code: 'SUBSCRIBED_WITH_EMAIL_WARNING',
      message:
        'Successfully subscribed, but the welcome email could not be sent right now.',
    })
  })

  it('should reject invalid email input', async () => {
    const formData = new FormData()
    formData.append('email', 'invalid-email')

    const result = await subscribeToNewsletter(null, formData)

    expect(result).toEqual({
      success: false,
      code: 'INVALID_EMAIL',
      message: 'Invalid email address',
    })
    expect(mockPrisma.subscriber.create).not.toHaveBeenCalled()
    expect(mockSendEmail).not.toHaveBeenCalled()
  })
})
