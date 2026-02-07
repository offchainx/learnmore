'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronRight, CheckCircle } from 'lucide-react';

interface CourseNavigationProps {
  subjectId: string;
  nextLessonId: string | null;
  isCompleted: boolean;
}

export function CourseNavigation({ subjectId, nextLessonId, isCompleted }: CourseNavigationProps) {
  const router = useRouter();

  if (!nextLessonId) {
    return (
      <div className="flex justify-end pt-6 border-t">
        <div className="flex items-center text-emerald-500 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-full border border-emerald-500/20">
          <CheckCircle className="w-4 h-4 mr-2" />
          Course Completed!
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end pt-6 border-t">
      <Button 
        onClick={() => router.push(`/course/${subjectId}/${nextLessonId}`)}
        variant={isCompleted ? "outline" : "default"}
        size="lg"
        className="group"
      >
        {isCompleted ? 'Next Lesson' : 'Continue to Next Lesson'}
        <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
}
