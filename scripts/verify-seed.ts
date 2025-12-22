/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying seeded data...');

  const counts = {
    users: await prisma.user.count(),
    userSettings: await prisma.userSettings.count(),
    subjects: await prisma.subject.count(),
    chapters: await prisma.chapter.count(),
    lessons: await prisma.lesson.count(),
    questions: await prisma.question.count(),
    dailyTasks: await prisma.dailyTask.count(),
    blogPosts: await prisma.blogPost.count(),
    contactSubmissions: await prisma.contactSubmission.count(),
    posts: await prisma.post.count(),
    leaderboardEntries: await prisma.leaderboardEntry.count(),
  };

  console.table(counts);

  if (counts.users < 1) throw new Error('No users found');
  if (counts.subjects < 1) throw new Error('No subjects found');
  if (counts.dailyTasks < 1) throw new Error('No daily tasks found');
  if (counts.blogPosts < 1) throw new Error('No blog posts found');
  
  console.log('Verification successful!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });