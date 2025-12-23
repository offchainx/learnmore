import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSignedVideoUrl } from '../storage'
import { UserRole } from '@prisma/client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockUser: any = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  role: UserRole.STUDENT,
  avatar: null,
  grade: 8,
  streak: 0,
  totalStudyTime: 0,
  xp: 0,
  aiTokenBalance: 0,
  lastStudyDate: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  dailyGoalMinutes: 30,
  studyReminderTime: null,
  targetSubject: null,
  curriculum: null,
  difficultyCalibration: null,
  parentEmail: null,
}

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      lesson: {
        findUnique: vi.fn(),
      },
    }
  }
})

const { mockSupabase } = vi.hoisted(() => {
  return {
    mockSupabase: {
      storage: {
        from: vi.fn().mockReturnThis(),
        createSignedUrl: vi.fn(),
      }
    }
  }
})

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}))

vi.mock('@/actions/auth', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

import { getCurrentUser } from '@/actions/auth'

describe('getSignedVideoUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return error if user not authenticated', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const result = await getSignedVideoUrl('lesson-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Unauthorized')
  })

  it('should return error if lesson not found', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    mockPrisma.lesson.findUnique.mockResolvedValue(null)

    const result = await getSignedVideoUrl('lesson-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Video not found')
  })

  it('should return error if videoUrl not set', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    mockPrisma.lesson.findUnique.mockResolvedValue({ videoUrl: null })

    const result = await getSignedVideoUrl('lesson-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Video not found')
  })

  it('should return external URL directly if starts with http', async () => {
    const externalUrl = 'https://example.com/video.mp4'
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    mockPrisma.lesson.findUnique.mockResolvedValue({ videoUrl: externalUrl })

    const result = await getSignedVideoUrl('lesson-1')

    expect(result.success).toBe(true)
    expect(result.url).toBe(externalUrl)
    expect(mockSupabase.storage.from).not.toHaveBeenCalled()
  })

  it('should create signed URL for Supabase storage path', async () => {
    const storagePath = 'lessons/test-video.mp4'
    const signedUrl = 'https://supabase.co/storage/v1/signed/test-signed-url'

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    mockPrisma.lesson.findUnique.mockResolvedValue({ videoUrl: storagePath })
    mockSupabase.storage.from.mockReturnValue({
      createSignedUrl: vi.fn().mockResolvedValue({
        data: { signedUrl },
        error: null
      })
    })

    const result = await getSignedVideoUrl('lesson-1')

    expect(result.success).toBe(true)
    expect(result.url).toBe(signedUrl)
    expect(mockSupabase.storage.from).toHaveBeenCalledWith('videos')
  })

  it('should return error if Supabase signing fails', async () => {
    const storagePath = 'lessons/test-video.mp4'
    const errorMessage = 'File not found in storage'

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
    mockPrisma.lesson.findUnique.mockResolvedValue({ videoUrl: storagePath })
    mockSupabase.storage.from.mockReturnValue({
      createSignedUrl: vi.fn().mockResolvedValue({
        data: null,
        error: { message: errorMessage }
      })
    })

    const result = await getSignedVideoUrl('lesson-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe(errorMessage)
  })

  it('should handle unexpected errors gracefully', async () => {
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Database connection failed'))

    const result = await getSignedVideoUrl('lesson-1')

    expect(result.success).toBe(false)
    expect(result.error).toBe('Database connection failed')
  })
})
