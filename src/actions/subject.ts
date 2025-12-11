'use server';

import prisma from '@/lib/prisma';

export async function getAllSubjects() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { order: 'asc' },
    });
    return { success: true, data: subjects };
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return { success: false, error: 'Failed to fetch subjects' };
  }
}
