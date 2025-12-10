import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log(`Start seeding ...`);

  const subjectsToCreate = [
    { name: '数学', icon: '/icons/math.svg', order: 1 },
    { name: '物理', icon: '/icons/physics.svg', order: 2 },
    { name: '化学', icon: '/icons/chemistry.svg', order: 3 },
    { name: '生物', icon: '/icons/biology.svg', order: 4 },
    { name: '语文', icon: '/icons/chinese.svg', order: 5 },
    { name: '英语', icon: '/icons/english.svg', order: 6 },
  ];

  for (const subjectData of subjectsToCreate) {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let subject = await tx.subject.findUnique({
        where: { name: subjectData.name },
      });

      if (!subject) {
        subject = await tx.subject.create({
          data: subjectData,
        });
        console.log(`Created subject: ${subjectData.name}`);
      } else {
        console.log(`Subject already exists: ${subjectData.name}`);
      }

      console.log(`Start seeding chapters for subject: ${subject.name}`);

      // Level 1 Chapters
      const chapter1_1 = await createChapter(tx, subject.id, null, `${subject.name} 第一章`, 1);
      const chapter1_2 = await createChapter(tx, subject.id, null, `${subject.name} 第二章`, 2);

      // Level 2 Chapters for chapter1_1
      const chapter2_1 = await createChapter(tx, subject.id, chapter1_1.id, `${subject.name} 第一章第一节`, 1);
      const chapter2_2 = await createChapter(tx, subject.id, chapter1_1.id, `${subject.name} 第二章第二节`, 2);

      // Level 3 Chapters for chapter2_1
      await createChapter(tx, subject.id, chapter2_1.id, `${subject.name} 第一章第一节1.1`, 1);
      await createChapter(tx, subject.id, chapter2_1.id, `${subject.name} 第一章第一节1.2`, 2);

      // Level 2 Chapters for chapter1_2
      const chapter2_3 = await createChapter(tx, subject.id, chapter1_2.id, `${subject.name} 第二章第一节`, 1);
      await createChapter(tx, subject.id, chapter2_3.id, `${subject.name} 第二章第一节2.1`, 1);

      console.log(`Seeding chapters finished for subject: ${subject.name}`);
      console.log(`Start seeding lessons and questions for subject: ${subject.name}`);

      const allChaptersInSubject = await tx.chapter.findMany({ where: { subjectId: subject.id } });

      for (const chapter of allChaptersInSubject) {
        // Create Lessons
        await createLesson(tx, chapter.id, `${chapter.title} - 视频讲解`, 'VIDEO', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', null, 300, 1); // Placeholder video
        await createLesson(tx, chapter.id, `${chapter.title} - 知识点文档`, 'DOCUMENT', null, '## 核心概念\n这是本节课的核心知识点文档内容。', null, 2);

        // Create Questions
        await createQuestion(
          tx,
          chapter.id,
          'SINGLE_CHOICE',
          4,
          `本节课的重点是什么？ (来自 ${chapter.title})`,
          { A: '选项A', B: '选项B', C: '选项C', D: '选项D' } as any,
          'A' as any,
          '根据视频内容，A是正确答案。'
        );
        await createQuestion(
          tx,
          chapter.id,
          'MULTIPLE_CHOICE',
          3,
          `以下哪些是正确的？ (来自 ${chapter.title})`,
          { A: '选项A', B: '选项B', C: '选项C', D: '选项D' } as any,
          ['A', 'C'] as any,
          'A和C都是正确的。'
        );
      }
      console.log(`Seeding lessons and questions finished for subject: ${subject.name}`);
    });
  }
  console.log(`Seeding finished.`);
}

async function createChapter(
  tx: Prisma.TransactionClient,
  subjectId: string,
  parentId: string | null,
  title: string,
  order: number
) {
  let chapter = await tx.chapter.findFirst({
    where: { subjectId, parentId, title },
  });

  if (!chapter) {
    chapter = await tx.chapter.create({
      data: {
        subjectId,
        parentId,
        title,
        order,
      },
    });
    // console.log(`Created chapter: ${title}`); // Commented for less verbose output during test
  } else {
    // console.log(`Chapter already exists: ${title}`); // Commented for less verbose output during test
  }
  return chapter;
}

async function createLesson(
  tx: Prisma.TransactionClient,
  chapterId: string,
  title: string,
  type: 'VIDEO' | 'DOCUMENT' | 'EXERCISE',
  videoUrl: string | null,
  content: string | null,
  duration: number | null,
  order: number
) {
  let lesson = await tx.lesson.findFirst({
    where: { chapterId, title },
  });

  if (!lesson) {
    lesson = await tx.lesson.create({
      data: {
        chapterId,
        title,
        type,
        videoUrl,
        content,
        duration,
        order,
      },
    });
    // console.log(`Created lesson: ${title}`); // Commented for less verbose output during test
  } else {
    // console.log(`Lesson already exists: ${title}`); // Commented for less verbose output during test
  }
  return lesson;
}

async function createQuestion(
  tx: Prisma.TransactionClient,
  chapterId: string,
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'ESSAY',
  difficulty: number,
  content: string,
  options: object | null,
  answer: object | string,
  explanation: string | null
) {
  let question = await tx.question.findFirst({
    where: { chapterId, content },
  });

  if (!question) {
    question = await tx.question.create({
      data: {
        chapterId,
        type,
        difficulty,
        content,
        options: options as any,
        answer: answer as any,
        explanation,
      },
    });
    // console.log(`Created question: ${content.substring(0, 20)}...`); // Commented for less verbose output during test
  } else {
    // console.log(`Question already exists: ${content.substring(0, 20)}...`); // Commented for less verbose output during test
  }
  return question;
}
