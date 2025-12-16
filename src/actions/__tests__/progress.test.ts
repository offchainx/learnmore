/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateUserLessonProgress } from '../progress';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// Mock prisma and supabase
vi.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    lesson: {
      findUnique: vi.fn(),
    },
    userProgress: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  __esModule: true,
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

const mockCreateClient = createClient as vi.Mock;
const mockPrisma = prisma as unknown as {
  lesson: { findUnique: vi.Mock };
  userProgress: { upsert: vi.Mock };
};

describe('updateUserLessonProgress Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return unauthorized if no user is found', async () => {
    mockCreateClient.mockReturnValue({
      auth: { getUser: vi.fn(() => ({ data: { user: null }, error: null })) },
    });

    const result = await updateUserLessonProgress('lesson-id', 10);
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });

  it('should return an error if lesson is not found', async () => {
    mockCreateClient.mockReturnValue({
      auth: { getUser: vi.fn(() => ({ data: { user: { id: 'user-id' } }, error: null })) },
    });
    mockPrisma.lesson.findUnique.mockResolvedValue(null);

    const result = await updateUserLessonProgress('lesson-id', 10);
    expect(result).toEqual({ success: false, error: 'Lesson not found or duration not set' });
  });

  it('should return an error if lesson duration is null', async () => {
    mockCreateClient.mockReturnValue({
      auth: { getUser: vi.fn(() => ({ data: { user: { id: 'user-id' } }, error: null })) },
    });
    mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-id', duration: null });

    const result = await updateUserLessonProgress('lesson-id', 10);
    expect(result).toEqual({ success: false, error: 'Lesson not found or duration not set' });
  });

  it('should successfully update progress', async () => {
    mockCreateClient.mockReturnValue({
      auth: { getUser: vi.fn(() => ({ data: { user: { id: 'user-id' } }, error: null })) },
    });
    mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-id', duration: 100 });
    mockPrisma.userProgress.upsert.mockResolvedValue({
      progress: 50,
      isCompleted: false,
    });

    const result = await updateUserLessonProgress('lesson-id', 50);
    expect(result).toEqual({ success: true, progress: 50, isCompleted: false });
    expect(mockPrisma.userProgress.upsert).toHaveBeenCalledWith({
      where: { userId_lessonId: { userId: 'user-id', lessonId: 'lesson-id' } },
      update: { progress: 50, lastPosition: 50, updatedAt: expect.any(Date), isCompleted: false },
      create: { userId: 'user-id', lessonId: 'lesson-id', progress: 50, lastPosition: 50, isCompleted: false },
      select: { progress: true, isCompleted: true },
    });
  });

  it('should mark lesson as completed if progress is >= 90%', async () => {
    mockCreateClient.mockReturnValue({
      auth: { getUser: vi.fn(() => ({ data: { user: { id: 'user-id' } }, error: null })) },
    });
    mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-id', duration: 100 });
    mockPrisma.userProgress.upsert.mockResolvedValue({
      progress: 95,
      isCompleted: true,
    });

    const result = await updateUserLessonProgress('lesson-id', 95);
    expect(result).toEqual({ success: true, progress: 95, isCompleted: true });
    expect(mockPrisma.userProgress.upsert).toHaveBeenCalledWith({
      where: { userId_lessonId: { userId: 'user-id', lessonId: 'lesson-id' } },
      update: { progress: 95, lastPosition: 95, updatedAt: expect.any(Date), isCompleted: true },
      create: { userId: 'user-id', lessonId: 'lesson-id', progress: 95, lastPosition: 95, isCompleted: true },
      select: { progress: true, isCompleted: true },
    });
  });

  it('should handle max safe integer for completion', async () => {
    mockCreateClient.mockReturnValue({
      auth: { getUser: vi.fn(() => ({ data: { user: { id: 'user-id' } }, error: null })) },
    });
    mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-id', duration: 100 });
    mockPrisma.userProgress.upsert.mockResolvedValue({
      progress: 100,
      isCompleted: true,
    });

    const result = await updateUserLessonProgress('lesson-id', Number.MAX_SAFE_INTEGER);
    expect(result).toEqual({ success: true, progress: 100, isCompleted: true });
    expect(mockPrisma.userProgress.upsert).toHaveBeenCalledWith({
      where: { userId_lessonId: { userId: 'user-id', lessonId: 'lesson-id' } },
      update: { progress: 100, lastPosition: Number.MAX_SAFE_INTEGER, updatedAt: expect.any(Date), isCompleted: true },
      create: { userId: 'user-id', lessonId: 'lesson-id', progress: 100, lastPosition: Number.MAX_SAFE_INTEGER, isCompleted: true },
      select: { progress: true, isCompleted: true },
    });
  });
});
