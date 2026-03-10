'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/actions/user/auth';
import { LessonType, UserRole } from '@prisma/client';
import { hasPermission } from '@/lib/permissions';

export interface CourseTreeData {
  id: string;
  title: string;
  isCompleted?: boolean;
  progress?: number;
  type?: 'CHAPTER' | LessonType;
  children?: CourseTreeData[];
}

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

const IMPORT_SUBJECT_PRESETS: Array<{
  key: string
  canonicalName: string
  aliases: string[]
  order: number
}> = [
  {
    key: 'chinese',
    canonicalName: '中文',
    aliases: ['中文', '华文', 'chinese', 'mandarin', 'bahasa cina'],
    order: 10,
  },
  {
    key: 'malay',
    canonicalName: '马来西亚文',
    aliases: ['马来西亚文', '马来文', 'malay', 'bahasa melayu', 'melayu'],
    order: 20,
  },
  {
    key: 'english',
    canonicalName: '英文',
    aliases: ['英文', '英语', 'english', 'bahasa inggeris'],
    order: 30,
  },
  {
    key: 'math',
    canonicalName: '数学',
    aliases: ['数学', 'math', 'mathematics', 'matematik'],
    order: 40,
  },
  {
    key: 'science',
    canonicalName: '科学',
    aliases: ['科学', 'science', 'sains'],
    order: 50,
  },
  {
    key: 'history',
    canonicalName: '历史',
    aliases: ['历史', 'history', 'sejarah'],
    order: 60,
  },
  {
    key: 'geography',
    canonicalName: '地理',
    aliases: ['地理', 'geography', 'geografi'],
    order: 70,
  },
  {
    key: 'other',
    canonicalName: '其他',
    aliases: ['其他', 'other', 'lain-lain'],
    order: 80,
  },
]

function normalizeSubjectKey(value: string): string {
  return value.toLowerCase().replace(/[\s\-_./()]/g, '')
}

export async function getImportSubjects() {
  try {
    const allSubjects = await prisma.subject.findMany({
      orderBy: { order: 'asc' },
    })

    const normalized = allSubjects.map((subject) => ({
      ...subject,
      normalizedName: normalizeSubjectKey(subject.name),
    }))

    const resolved: Array<{ id: string; key: string; name: string; order: number }> = []

    for (const preset of IMPORT_SUBJECT_PRESETS) {
      const found = normalized.find((subject) =>
        preset.aliases.some((alias) => subject.normalizedName.includes(normalizeSubjectKey(alias)))
      )

      if (found) {
        resolved.push({
          id: found.id,
          key: preset.key,
          name: found.name,
          order: preset.order,
        })
        continue
      }

      const created = await prisma.subject.create({
        data: {
          name: preset.canonicalName,
          order: preset.order,
        },
        select: {
          id: true,
          name: true,
          order: true,
        },
      })

      resolved.push({
        id: created.id,
        key: preset.key,
        name: created.name,
        order: created.order,
      })
    }

    return { success: true, data: resolved }
  } catch (error) {
    console.error('Error fetching import subjects:', error)
    return { success: false, error: 'Failed to fetch import subjects' }
  }
}

export async function getSubjectDetails(subjectId: string) {
  const user = await getCurrentUser();
  
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { name: true }
    });

    if (!subject) {
      return { success: false, error: 'Subject not found' };
    }

    // Fetch all chapters and lessons for the subject
    const chapters = await prisma.chapter.findMany({
      where: { subjectId },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, type: true },
        },
      },
    });

    let userProgressMap = new Map();
    if (user) {
      const userProgress = await prisma.userProgress.findMany({
        where: { userId: user.id },
        select: { lessonId: true, isCompleted: true, progress: true },
      });
      userProgressMap = new Map(userProgress.map(p => [p.lessonId, { isCompleted: p.isCompleted, progress: p.progress }]));
    }

    const chapterMap = new Map<string, CourseTreeData>();

    chapters.forEach(chapter => {
      chapterMap.set(chapter.id, {
        id: chapter.id,
        title: chapter.title,
        type: 'CHAPTER',
        children: [],
      });
    });

    chapters.forEach(chapter => {
      const chapterNode = chapterMap.get(chapter.id);
      if (chapterNode) {
        chapter.lessons.forEach(lesson => {
          chapterNode.children?.push({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            isCompleted: userProgressMap.get(lesson.id)?.isCompleted || false,
            progress: userProgressMap.get(lesson.id)?.progress || 0,
          });
        });

        if (chapter.parentId) {
          const parentChapterNode = chapterMap.get(chapter.parentId);
          if (parentChapterNode) {
            if (!parentChapterNode.children?.some(child => child.id === chapterNode.id)) {
              parentChapterNode.children?.push(chapterNode);
            }
          }
        }
      }
    });

    const courseTreeChapters = Array.from(chapterMap.values())
      .filter(chapterNode => {
        const originalChapter = chapters.find(c => c.id === chapterNode.id);
        return originalChapter && originalChapter.parentId === null;
      })
      .sort((a, b) => {
        const originalA = chapters.find(c => c.id === a.id);
        const originalB = chapters.find(c => c.id === b.id);
        return (originalA?.order || 0) - (originalB?.order || 0);
      });

    return { 
      success: true, 
      data: {
        name: subject.name,
        chapters: courseTreeChapters
      } 
    };
  } catch (error) {
    console.error('Error fetching subject details:', error);
    return { success: false, error: 'Failed to fetch subject details' };
  }
}

export async function getLessonData(lessonId: string) {
  const user = await getCurrentUser();

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            subject: true
          }
        },
        progress: user ? {
          where: { userId: user.id }
        } : false
      }
    });

    if (!lesson) {
      return { success: false, error: 'Lesson not found' };
    }

    let questions = null;
    if (lesson.type === 'QUIZ') {
      // Fetch questions belonging to this chapter
      questions = await prisma.question.findMany({
        where: { chapterId: lesson.chapterId },
        orderBy: { createdAt: 'asc' }
      });

      // Access Control: Limit questions for non-premium users
      const userRole = user?.role || UserRole.STUDENT;
      const canAccessFullBank = hasPermission(userRole, 'access:full_question_bank');

      if (!canAccessFullBank && questions.length > 5) {
        questions = questions.slice(0, 5);
      }
    }

    // Find the next lesson in the same chapter or next chapter
    const chapters = await prisma.chapter.findMany({
      where: { subjectId: lesson.chapter.subjectId },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: { id: true }
        }
      }
    });

    let nextLessonId = null;
    let foundCurrent = false;

    for (const chapter of chapters) {
      for (const l of chapter.lessons) {
        if (foundCurrent) {
          nextLessonId = l.id;
          break;
        }
        if (l.id === lessonId) {
          foundCurrent = true;
        }
      }
      if (nextLessonId) break;
    }

    return { 
      success: true, 
      data: {
        lesson,
        userProgress: lesson.progress?.[0] || null,
        nextLessonId,
        questions
      }
    };
  } catch (error) {
    console.error('Error fetching lesson data:', error);
    return { success: false, error: 'Failed to fetch lesson data' };
  }
}
