/* eslint-disable no-console */
import { PrismaClient, LessonType, QuestionType, AiPersonality, UserRole, DailyTaskType, ContactStatus, LeaderboardPeriod } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get random int
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedDatabase() {
  console.log(`Start seeding ...`);

  // 0. Clean up existing data to avoid duplicates (e.g. mixed English/Chinese subjects)
  console.log('Cleaning up database...');
  await prisma.dailyTask.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.userAttempt.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.leaderboardEntry.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.contactSubmission.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.question.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany(); // Cascade deletes are safer, but explicit is clear
  console.log('Database cleaned.');

  // 1. Subjects & Content
  const subjectsToCreate = [
    { name: 'Mathematics', icon: 'Calculator', order: 1 },
    { name: 'Physics', icon: 'Atom', order: 2 },
    { name: 'Chemistry', icon: 'FlaskConical', order: 3 },
    { name: 'Biology', icon: 'Dna', order: 4 },
    { name: 'English', icon: 'BookOpen', order: 5 },
    { name: 'History', icon: 'Landmark', order: 6 },
    { name: 'Geography', icon: 'Globe', order: 7 },
    { name: 'Computer Science', icon: 'Laptop', order: 8 },
  ];

  const createdSubjects = [];

  for (const subjectData of subjectsToCreate) {
    const subject = await prisma.subject.create({
      data: subjectData,
    });
    createdSubjects.push(subject);
    console.log(`Created subject: ${subject.name}`);

    // Create Chapters
    const chapterTitles = ['Introduction', 'Advanced Concepts', 'Practical Applications'];
    for (let i = 0; i < chapterTitles.length; i++) {
      const title = `${subject.name} - ${chapterTitles[i]}`;
      const chapter = await prisma.chapter.create({
        data: {
          subjectId: subject.id,
          title: title,
          order: i + 1,
          lessons: {
            create: [
              {
                title: `${title} - Video Lecture`,
                type: LessonType.VIDEO,
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
                duration: 600,
                xpReward: 20,
                order: 1,
              },
              {
                title: `${title} - Study Notes`,
                type: LessonType.DOCUMENT,
                content: '# Key Concepts\n\nThis is a summary of the chapter.',
                xpReward: 10,
                order: 2,
              },
              {
                title: `${title} - Quiz`,
                type: LessonType.QUIZ,
                xpReward: 50,
                order: 3,
              },
            ],
          },
        },
      });

      // Create Questions for the chapter
      await prisma.question.createMany({
        data: [
          {
            chapterId: chapter.id,
            type: QuestionType.SINGLE_CHOICE,
            difficulty: 3,
            content: `What is the main focus of ${title}?`,
            options: { A: 'Theory', B: 'Practice', C: 'History', D: 'None' },
            answer: 'A',
            explanation: 'It focuses on the theoretical foundations.',
          },
          {
            chapterId: chapter.id,
            type: QuestionType.MULTIPLE_CHOICE,
            difficulty: 4,
            content: `Which concepts are covered in ${title}?`,
            options: { A: 'Concept X', B: 'Concept Y', C: 'Concept Z', D: 'All of above' },
            answer: ['A', 'B'],
            explanation: 'Both X and Y are covered.',
          },
        ],
      });
    }
  }

  // 2. Users & Settings
  // Demo User
  const demoUserEmail = 'demo@learnmore.com';
  const demoUser = await prisma.user.create({
    data: {
      email: demoUserEmail,
      username: 'DemoStudent',
      role: UserRole.STUDENT,
      grade: 10,
      streak: 5,
      totalStudyTime: 12500,
      xp: 3450,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      settings: {
        create: {
          theme: 'dark',
          language: 'en',
          aiPersonality: AiPersonality.SOCRATIC,
          difficultyCalibration: 65,
          curriculumSystem: 'IGCSE',
        },
      },
    },
  });
  console.log(`Created user: ${demoUser.username}`);

  // Create some other users for community/leaderboard
  const otherUsersData = [
    { email: 'alice@example.com', username: 'AliceWonder', xp: 4500 },
    { email: 'bob@example.com', username: 'BobBuilder', xp: 3200 },
    { email: 'charlie@example.com', username: 'CharlieBrown', xp: 2800 },
    { email: 'diana@example.com', username: 'DianaPrince', xp: 5100 },
  ];

  const otherUsers = [];
  for (const u of otherUsersData) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        username: u.username,
        role: UserRole.STUDENT,
        grade: getRandomInt(7, 12),
        xp: u.xp,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`,
        // Fix: Ensure UserSettings are created for ALL users
        settings: {
          create: {
            theme: 'dark',
            language: 'en',
            aiPersonality: AiPersonality.ENCOURAGING,
            difficultyCalibration: 50,
            curriculumSystem: 'IGCSE',
          },
        },
      },
    });
    otherUsers.push(user);
  }

  // 3. Daily Tasks
  await prisma.dailyTask.createMany({
    data: [
      {
        userId: demoUser.id,
        type: DailyTaskType.LOGIN,
        title: 'Daily Login',
        targetCount: 1,
        currentCount: 1,
        xpReward: 10,
        isClaimed: true,
      },
      {
        userId: demoUser.id,
        type: DailyTaskType.COMPLETE_LESSON,
        title: 'Complete 2 Lessons',
        targetCount: 2,
        currentCount: 1,
        xpReward: 50,
        isClaimed: false,
      },
      {
        userId: demoUser.id,
        type: DailyTaskType.QUIZ_SCORE,
        title: 'Score 80% in a Quiz',
        targetCount: 1,
        currentCount: 0,
        xpReward: 30,
        isClaimed: false,
      },
    ],
  });
  console.log('Seeded daily tasks');

  // 4. Blog Posts
  await prisma.blogPost.createMany({
    data: [
      {
        slug: 'effective-study-habits-2025',
        title: '10 Effective Study Habits for 2025',
        excerpt: 'Boost your productivity with these proven techniques.',
        content: '## Introduction\n\nStudying effectively is not just about time...', // Corrected newline escape
        author: 'Dr. Sarah Smith',
        category: 'Learning Tips',
        tags: ['productivity', 'study-tips'],
        isPublished: true,
        coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80',
      },
      {
        slug: 'mastering-calculus',
        title: 'Mastering Calculus: A Beginner\'s Guide', // Corrected apostrophe escape
        excerpt: 'Calculus made easy with our step-by-step approach.',
        content: '## What is Calculus?\n\nCalculus is the mathematical study of continuous change...', // Corrected newline escape
        author: 'Prof. Alan Turing',
        category: 'Mathematics',
        tags: ['math', 'calculus'],
        isPublished: true,
        coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80',
      },
      {
        slug: 'ai-in-education',
        title: 'How AI is Transforming Education',
        excerpt: 'Explore the future of personalized learning.',
        content: '## Personalized Learning\n\nAI algorithms can adapt to your learning pace...', // Corrected newline escape
        author: 'Tech Weekly',
        category: 'Technology',
        tags: ['ai', 'edtech'],
        isPublished: true,
        coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80',
      },
    ],
  });
  console.log('Seeded blog posts');

  // 5. Contact Submissions
  await prisma.contactSubmission.createMany({
    data: [
      {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Inquiry about pricing',
        message: 'Hi, I would like to know more about the premium plan.',
        status: ContactStatus.NEW,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'Bug report',
        message: 'I found a bug in the quiz section.',
        status: ContactStatus.READ,
      },
    ],
  });
  console.log('Seeded contact submissions');

  // 6. Community Posts
  const communitySubject = createdSubjects.find(s => s.name === 'Mathematics');
  await prisma.post.createMany({
    data: [
      {
        authorId: demoUser.id,
        title: 'How to solve quadratic equations?',
        content: 'I am struggling with the formula. Can someone explain?',
        category: 'Question',
        tags: ['algebra', 'math'],
        subjectId: communitySubject?.id,
        likeCount: 5,
        isSolved: false
      },
      {
        authorId: otherUsers[0].id,
        title: 'My study notes for Physics',
        content: 'Here are my notes for the latest chapter...', // Corrected newline escape
        category: 'Note',
        tags: ['physics', 'notes'],
        likeCount: 12,
        isSolved: true
      },
    ],
  });
  console.log('Seeded community posts');

  // 7. Leaderboard
  // Seed current week leaderboard
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0, 0, 0, 0);

  const leaderboardData = [demoUser, ...otherUsers].map((u, index) => ({
    userId: u.id,
    score: u.xp,
    rank: index + 1, // Rough rank
    period: LeaderboardPeriod.WEEKLY,
    weekStart: startOfWeek,
  }));

  for (const entry of leaderboardData) {
    await prisma.leaderboardEntry.create({
      data: entry,
    });
  }
  console.log('Seeded leaderboard');

  console.log(`Seeding finished.`);
}

seedDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
