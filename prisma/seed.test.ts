// prisma/seed.test.ts
import { PrismaClient } from '@prisma/client';
import { seedDatabase } from './seed.ts';

const prisma = new PrismaClient();

async function runSeedTest() {
  console.log('--- Running Prisma Seed Data Test ---');
  try {
    // Clear existing data for repeatable tests
    await prisma.$transaction([
      prisma.question.deleteMany(),
      prisma.lesson.deleteMany(),
      prisma.chapter.deleteMany(),
      prisma.subject.deleteMany(),
    ]);
    console.log('Cleared existing seed data.');

    // 1. Run the seed script
    await seedDatabase();

    // 2. Verify data
    const subjects = await prisma.subject.findMany();
    console.log(`Found ${subjects.length} subjects.`);
    if (subjects.length !== 8) {
      throw new Error(`Expected 8 subjects, but found ${subjects.length}`);
    }

    const chapters = await prisma.chapter.findMany();
    console.log(`Found ${chapters.length} chapters.`);
    // 每个学科创建 3 个章节
    if (chapters.length !== 24) {
      throw new Error(`Expected 24 chapters, but found ${chapters.length}`);
    }

    const lessons = await prisma.lesson.findMany();
    console.log(`Found ${lessons.length} lessons.`);
    // 每个章节创建 3 节课
    if (lessons.length !== 72) {
      throw new Error(`Expected 72 lessons, but found ${lessons.length}`);
    }

    const questions = await prisma.question.findMany();
    console.log(`Found ${questions.length} questions.`);
    // 每个章节创建 2 道题
    if (questions.length !== 48) {
      throw new Error(`Expected 48 questions, but found ${questions.length}`);
    }

    console.log('--- Prisma Seed Data Test PASSED ---');
    return true;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Prisma Seed Data Test FAILED:', errorMessage);
    return false;
  } finally {
    await prisma.$disconnect();
    console.log('--- Prisma Seed Data Test Finished ---');
  }
}

if (import.meta.url === new URL(import.meta.url).href) {
  // Only run if this file is executed directly (e.g., node prisma/seed.test.ts)
  runSeedTest();
}
