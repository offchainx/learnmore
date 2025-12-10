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
    if (subjects.length !== 6) {
      throw new Error(`Expected 6 subjects, but found ${subjects.length}`);
    }

    const chapters = await prisma.chapter.findMany();
    console.log(`Found ${chapters.length} chapters.`);
    // Each subject has 2 top-level chapters, one of which has 2 sub-chapters, one of which has 2 sub-sub-chapters.
    // (2 + 2 + 2) * 6 subjects = 6 * 8 = 48 chapters
    // For each subject: 2 (L1) + 2 (L2) + 2 (L3) + 1 (L2 for 2nd L1) + 1 (L3 for 2nd L2) = 8
    if (chapters.length !== 48) {
      throw new Error(`Expected 48 chapters, but found ${chapters.length}`);
    }

    const lessons = await prisma.lesson.findMany();
    console.log(`Found ${lessons.length} lessons.`);
    // Each chapter has 2 lessons (video + document)
    // 48 chapters * 2 lessons/chapter = 96 lessons
    if (lessons.length !== 96) {
      throw new Error(`Expected 96 lessons, but found ${lessons.length}`);
    }

    const questions = await prisma.question.findMany();
    console.log(`Found ${questions.length} questions.`);
    // Each chapter has 2 questions (single choice + multiple choice)
    // 48 chapters * 2 questions/chapter = 96 questions
    if (questions.length !== 96) {
      throw new Error(`Expected 96 questions, but found ${questions.length}`);
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
