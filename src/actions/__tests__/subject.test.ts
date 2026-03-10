
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllSubjects } from '../courses/subject';

const mockSubjects = [
  { id: 's1', key: 'chinese', name: '中文', icon: null, order: 10 },
  { id: 's2', key: 'malay', name: '马来西亚文', icon: null, order: 20 },
  { id: 's3', key: 'english', name: '英文', icon: null, order: 30 },
  { id: 's4', key: 'math', name: '数学', icon: null, order: 40 },
  { id: 's5', key: 'science', name: '科学', icon: null, order: 50 },
  { id: 's6', key: 'history', name: '历史', icon: null, order: 60 },
  { id: 's7', key: 'geography', name: '地理', icon: null, order: 70 },
  { id: 's8', key: 'other', name: '其他', icon: null, order: 80 },
];

const { mockPrisma } = vi.hoisted(() => {
  const mp = {
    subject: {
      findMany: vi.fn(),
    },
  };
  return { mockPrisma: mp };
});

vi.mock('@/lib/prisma', () => ({
  default: mockPrisma,
}));

describe('Subject Server Actions', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should fetch all subjects successfully', async () => {
    mockPrisma.subject.findMany.mockResolvedValue(mockSubjects);

    const result = await getAllSubjects();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockSubjects);
    expect(mockPrisma.subject.findMany).toHaveBeenCalledWith({
      where: { key: { in: ['chinese', 'malay', 'english', 'math', 'science', 'history', 'geography', 'other'] } },
      select: {
        id: true,
        key: true,
        name: true,
        icon: true,
        order: true,
      },
      orderBy: { order: 'asc' },
    });
  });

  it('should return an error if fetching subjects fails', async () => {
    const errorMessage = 'DB error';
    mockPrisma.subject.findMany.mockRejectedValue(new Error(errorMessage));

    const result = await getAllSubjects();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to fetch subjects');
    expect(console.error).toHaveBeenCalledWith(
      'Error fetching subjects:', expect.any(Error)
    );
  });
});
