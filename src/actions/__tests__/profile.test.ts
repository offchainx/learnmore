import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getProfile, updateProfile } from '../profile';
import { UserRole } from '@prisma/client';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  role: UserRole.STUDENT,
  avatar: null,
  grade: 8,
  streak: 0,
  totalStudyTime: 0,
  xp: 0,
  lastStudyDate: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};
const mockProfile = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@example.com',
  grade: 8,
  avatar: null,
  badges: [],
  _count: { errorBook: 0, posts: 0, leaderboardEntries: 0 }
};

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    }
  };
});

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}));

vi.mock('@/actions/auth', () => ({
  getCurrentUser: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { getCurrentUser } from '@/actions/auth';

describe('Profile Server Actions', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('getProfile', () => {
    it('should return null if user is not authenticated', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);
      const result = await getProfile();
      expect(result).toBeNull();
    });

    it('should return profile data', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      mockPrisma.user.findUnique.mockResolvedValue(mockProfile);

      const result = await getProfile();
      expect(result).toEqual(mockProfile);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        include: expect.any(Object)
      });
    });
  });

  describe('updateProfile', () => {
    it('should return error if not authenticated', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);
      const formData = new FormData();
      formData.append('username', 'newname');
      
      const result = await updateProfile({}, formData);
      expect(result.error).toBe('Not authenticated');
    });

    it('should update profile successfully', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      mockPrisma.user.findUnique.mockResolvedValue(null); // No existing username conflict
      mockPrisma.user.update.mockResolvedValue({ ...mockProfile, username: 'newname' });

      const formData = new FormData();
      formData.append('username', 'newname');
      formData.append('grade', '9');

      const result = await updateProfile({}, formData);
      expect(result.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: expect.objectContaining({
          username: 'newname',
          grade: 9
        })
      });
    });

    it('should return error if username is taken', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      // findUnique returns a DIFFERENT user for the username check
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'other-user' });

      const formData = new FormData();
      formData.append('username', 'takenname');

      const result = await updateProfile({}, formData);
      expect(result.error).toBe('Username already taken');
    });
    
    it('should handle avatar update', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.update.mockResolvedValue({ ...mockProfile, avatar: 'http://url.com/img.png' });

      const formData = new FormData();
      formData.append('avatar', 'http://url.com/img.png');

      const result = await updateProfile({}, formData);
      expect(result.success).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: expect.objectContaining({
          avatar: 'http://url.com/img.png'
        })
      });
    });
  });
});
