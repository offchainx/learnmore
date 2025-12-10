'use client';

import * as React from 'react';
import { ChevronDown, CheckCircle, Lock, PlayCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface CourseChapter {
  id: string;
  title: string;
  isCompleted?: boolean;
  isLocked?: boolean;
  children?: CourseChapter[];
}

export interface CourseTreeProps {
  chapters: CourseChapter[];
  selectedChapterId: string | null;
  onChapterSelect: (chapterId: string) => void;
  level?: number;
}

const CourseTree: React.FC<CourseTreeProps> = ({
  chapters,
  selectedChapterId,
  onChapterSelect,
  level = 0
}) => {
  return (
    <div className="space-y-1">
      {chapters.map((chapter) => (
        <CourseTreeItem
          key={chapter.id}
          chapter={chapter}
          level={level}
          selectedChapterId={selectedChapterId}
          onChapterSelect={onChapterSelect}
        />
      ))}
    </div>
  );
};

interface CourseTreeItemProps {
  chapter: CourseChapter;
  level: number;
  selectedChapterId: string | null;
  onChapterSelect: (chapterId: string) => void;
}

const CourseTreeItem: React.FC<CourseTreeItemProps> = ({
  chapter,
  level,
  selectedChapterId,
  onChapterSelect,
}) => {
  const hasChildren = chapter.children && chapter.children.length > 0;
  // State for collapsible
  // Initialize state based on whether selected chapter is a child of this chapter could be a nice enhancement
  const [isOpen, setIsOpen] = React.useState(false);

  // Determine icon
  const getIcon = () => {
    if (chapter.isLocked) return <Lock className="h-4 w-4 text-muted-foreground" />;
    if (chapter.isCompleted) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (selectedChapterId === chapter.id) return <PlayCircle className="h-4 w-4 text-primary" />;
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full"
    >
      <div
        className={cn(
          "flex items-center justify-between hover:bg-muted/50 rounded-md transition-colors",
          selectedChapterId === chapter.id && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${level * 12}px` }}
      >
        <div className="flex items-center flex-1 w-full overflow-hidden">
             {/* Expand/Collapse Trigger (only if children) */}
            {hasChildren ? (
                <CollapsibleTrigger asChild>
                    <button 
                      className="p-1 hover:bg-muted rounded-sm mr-1 shrink-0"
                      onClick={(e) => {
                        // Prevent triggering the parent onClick if nested (though trigger handles this)
                        e.stopPropagation();
                      }}
                    >
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 transition-transform duration-200",
                                isOpen ? "" : "-rotate-90"
                            )}
                        />
                        <span className="sr-only">Toggle</span>
                    </button>
                </CollapsibleTrigger>
            ) : (
                <span className="w-6 shrink-0" /> // Spacer
            )}

            {/* Chapter Click Area */}
            <div
                className={cn(
                  "flex-1 flex items-center gap-2 py-2 pr-2 cursor-pointer truncate",
                   chapter.isLocked ? "opacity-50 cursor-not-allowed" : ""
                )}
                onClick={() => !chapter.isLocked && onChapterSelect(chapter.id)}
            >
                {getIcon()}
                <span className="truncate text-sm font-medium">{chapter.title}</span>
            </div>
        </div>
      </div>

      {hasChildren && (
        <CollapsibleContent>
          <CourseTree
            chapters={chapter.children!}
            selectedChapterId={selectedChapterId}
            onChapterSelect={onChapterSelect}
            level={level + 1}
          />
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

export default CourseTree;