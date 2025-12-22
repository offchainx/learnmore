'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/actions/auth';
import { LessonType } from '@prisma/client';

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
        nextLessonId
      }
    };
  } catch (error) {
    console.error('Error fetching lesson data:', error);
    return { success: false, error: 'Failed to fetch lesson data' };
  }
}
