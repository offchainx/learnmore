
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllSubjects } from '../subject';

const mockSubjects = [
  { id: 's1', name: 'Math', icon: null, order: 1 },
  { id: 's2', name: 'Physics', icon: null, order: 2 },
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
