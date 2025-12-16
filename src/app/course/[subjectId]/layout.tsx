import { Header } from '@/components/business/Header';
import { CourseLayoutClient } from '@/components/business/CourseLayoutClient';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server'; // For auth
import { notFound } from 'next/navigation';
import { LessonType } from '@prisma/client'; // Import LessonType

// Define a type for the chapter/lesson structure that CourseTree expects
interface CourseTreeData {
  id: string;
  title: string;
  isCompleted?: boolean;
  isLocked?: boolean; // For future use
  type?: 'CHAPTER' | LessonType; // To differentiate and show icons
  children?: CourseTreeData[];
}

async function getAuthAndChapterData(subjectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { courseTreeChapters: [], userProgressMap: new Map() };
  }

  const userId = user.id;

  // Fetch all chapters and lessons for the subject
  // Use a single query to get all relevant data
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

  const userProgress = await prisma.userProgress.findMany({
    where: { userId },
    select: { lessonId: true, isCompleted: true, progress: true },
  });

  const userProgressMap = new Map(userProgress.map(p => [p.lessonId, { isCompleted: p.isCompleted, progress: p.progress }]));

  // Build a map of all chapters for easy lookup and to manage parent-child relationships
  const chapterMap = new Map<string, CourseTreeData>();

  // First pass: Initialize all chapters as CourseTreeData nodes
  chapters.forEach(chapter => {
    chapterMap.set(chapter.id, {
      id: chapter.id,
      title: chapter.title,
      type: 'CHAPTER',
      children: [],
    });
  });

  // Second pass: Populate children (lessons and sub-chapters)
  chapters.forEach(chapter => {
    const chapterNode = chapterMap.get(chapter.id);
    if (chapterNode) {
      // Add lessons to the current chapter
      chapter.lessons.forEach(lesson => {
        chapterNode.children?.push({
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          isCompleted: userProgressMap.get(lesson.id)?.isCompleted || false,
        });
      });

      // If this chapter has a parent, add it as a child to its parent
      if (chapter.parentId) {
        const parentChapterNode = chapterMap.get(chapter.parentId);
        if (parentChapterNode) {
          // Check if it's already added to avoid duplicates if `chapters` array order is not guaranteed
          if (!parentChapterNode.children?.some(child => child.id === chapterNode.id)) {
            parentChapterNode.children?.push(chapterNode);
          }
        }
      }
    }
  });

  // Filter for top-level chapters (those without a parentId)
  // And ensure they are sorted by their original order
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
  
  // Sort children within each chapter (lessons first, then sub-chapters, both by their order field)
  const sortChildren = (nodes: CourseTreeData[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => {
          // Lessons come before chapters
          if (a.type !== 'CHAPTER' && b.type === 'CHAPTER') return -1;
          if (a.type === 'CHAPTER' && b.type !== 'CHAPTER') return 1;

          // Then sort by order field if available (need to fetch original order)
          // For now, rely on insertion order or add 'order' to CourseTreeData
          return 0; // Keeping original order for now
        });
        sortChildren(node.children); // Recurse for sub-chapters
      }
    });
  };
  sortChildren(courseTreeChapters);


  return { courseTreeChapters, userProgressMap };
}

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params: Promise<{ subjectId: string }>,
}) {
  const { subjectId } = await params;
  const { courseTreeChapters } = await getAuthAndChapterData(subjectId);

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select: { name: true },
  });

  if (!subject) {
    notFound(); // If subject not found, render Next.js not found page
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-hidden">
        <CourseLayoutClient chapters={courseTreeChapters} title={subject?.name || "Course"}>
            {children}
        </CourseLayoutClient>
      </div>
    </div>
  );
}
