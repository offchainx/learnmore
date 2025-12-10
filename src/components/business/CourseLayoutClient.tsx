'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import CourseTree, { CourseChapter } from '@/components/business/CourseTree';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

interface SidebarContentProps {
  title?: string;
  chapters: CourseChapter[];
  selectedChapterId: string;
  onChapterSelect: (chapterId: string) => void;
}

const SidebarContent = ({ title, chapters, selectedChapterId, onChapterSelect }: SidebarContentProps) => (
  <div className="flex h-full flex-col bg-muted/10 h-full">
    {title && (
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 bg-background">
        <span className="font-semibold">{title}</span>
      </div>
    )}
    <ScrollArea className="flex-1 bg-background/50">
      <div className="p-4">
        <CourseTree
          chapters={chapters}
          selectedChapterId={selectedChapterId}
          onChapterSelect={onChapterSelect}
        />
      </div>
    </ScrollArea>
  </div>
);

interface CourseSidebarProps {
  chapters: CourseChapter[];
  title?: string;
  children: React.ReactNode;
}

export function CourseLayoutClient({ chapters, title, children }: CourseSidebarProps) {
  const router = useRouter();
  const params = useParams();
  const subjectId = params?.subjectId as string;
  const lessonId = params?.lessonId as string;

  const [isOpen, setIsOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Check for mobile breakpoint
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChapterSelect = (chapterId: string) => {
    router.push(`/course/${subjectId}/${chapterId}`);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Mobile Header Trigger */}
        <div className="lg:hidden fixed left-4 top-20 z-40 mt-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 shadow-sm bg-background">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[300px]">
                    <SidebarContent 
                      title={title} 
                      chapters={chapters} 
                      selectedChapterId={lessonId} 
                      onChapterSelect={handleChapterSelect} 
                    />
                </SheetContent>
            </Sheet>
        </div>
        <main className="flex-1 p-4 lg:p-6">
            {children}
        </main>
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-5rem)] w-full rounded-lg border">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="hidden lg:block">
        <SidebarContent 
            title={title} 
            chapters={chapters} 
            selectedChapterId={lessonId} 
            onChapterSelect={handleChapterSelect} 
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80}>
        <main className="h-full overflow-auto p-6">
            {children}
        </main>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}