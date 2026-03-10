'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/actions/user/auth';
import { LessonType, UserRole } from '@prisma/client';
import { hasPermission } from '@/lib/permissions';
import { SUBJECT_DEFINITIONS, SUBJECT_KEYS, resolveSubjectKeyFromName } from '@/lib/subjects';

export interface CourseTreeData {
  id: string;
  title: string;
  isCompleted?: boolean;
  progress?: number;
  type?: 'CHAPTER' | LessonType;
  children?: CourseTreeData[];
}

const SUBJECT_SELECT = {
  id: true,
  key: true,
  name: true,
  icon: true,
  order: true,
} as const

type SubjectRecord = {
  id: string
  key: string
  name: string
  icon: string | null
  order: number
}

async function fetchCoreSubjects(): Promise<SubjectRecord[]> {
  return prisma.subject.findMany({
    where: { key: { in: [...SUBJECT_KEYS] } },
    select: SUBJECT_SELECT,
    orderBy: { order: 'asc' },
  })
}

async function ensureCoreSubjects(): Promise<SubjectRecord[]> {
  const allSubjects = await prisma.subject.findMany({
    select: SUBJECT_SELECT,
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  })

  const usedIds = new Set<string>()
  const byKey = new Map<string, SubjectRecord>()
  for (const subject of allSubjects) {
    if (subject.key && SUBJECT_KEYS.includes(subject.key as (typeof SUBJECT_KEYS)[number])) {
      byKey.set(subject.key, subject)
      usedIds.add(subject.id)
    }
  }

  for (const definition of SUBJECT_DEFINITIONS) {
    if (byKey.has(definition.key)) {
      const current = byKey.get(definition.key)!
      const shouldUpdate =
        current.order !== definition.order ||
        !current.icon

      if (shouldUpdate) {
        const updated = await prisma.subject.update({
          where: { id: current.id },
          data: {
            order: definition.order,
            icon: current.icon || definition.icon,
          },
          select: SUBJECT_SELECT,
        })
        byKey.set(definition.key, updated)
      }
      continue
    }

    const matchedLegacy = allSubjects.find((subject) => {
      if (usedIds.has(subject.id)) return false
      return resolveSubjectKeyFromName(subject.name) === definition.key
    })

    if (matchedLegacy) {
      const updated = await prisma.subject.update({
        where: { id: matchedLegacy.id },
        data: {
          key: definition.key,
          order: definition.order,
          icon: matchedLegacy.icon || definition.icon,
        },
        select: SUBJECT_SELECT,
      })
      usedIds.add(updated.id)
      byKey.set(definition.key, updated)
      continue
    }

    const created = await prisma.subject.create({
      data: {
        key: definition.key,
        name: definition.canonicalName,
        icon: definition.icon,
        order: definition.order,
      },
      select: SUBJECT_SELECT,
    })
    usedIds.add(created.id)
    byKey.set(definition.key, created)
  }

  return SUBJECT_DEFINITIONS
    .map((definition) => byKey.get(definition.key))
    .filter((subject): subject is SubjectRecord => Boolean(subject))
}

export async function getAllSubjects() {
  try {
    let subjects = await fetchCoreSubjects()
    if (subjects.length !== SUBJECT_KEYS.length) {
      subjects = await ensureCoreSubjects()
    }
    return { success: true, data: subjects }
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return { success: false, error: 'Failed to fetch subjects' }
  }
}

export async function getImportSubjects() {
  try {
    let subjects = await fetchCoreSubjects()
    if (subjects.length !== SUBJECT_KEYS.length) {
      subjects = await ensureCoreSubjects()
    }
    return {
      success: true,
      data: subjects.map((subject) => ({
        id: subject.id,
        key: subject.key,
        name: subject.name,
        order: subject.order,
      })),
    }
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
