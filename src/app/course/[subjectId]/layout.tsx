import { Header } from '@/components/business/Header';
import { CourseLayoutClient } from '@/components/business/CourseLayoutClient';
import { getSubjectDetails } from '@/actions/subject';
import { notFound } from 'next/navigation';

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params: Promise<{ subjectId: string }>,
}) {
  const { subjectId } = await params;
  const result = await getSubjectDetails(subjectId);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-hidden">
        <CourseLayoutClient 
          chapters={result.data.chapters} 
          title={result.data.name || "Course"}
        >
            {children}
        </CourseLayoutClient>
      </div>
    </div>
  );
}
