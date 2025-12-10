import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest'; // Removed beforeEach
import CourseTree, { CourseChapter } from '../CourseTree';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ChevronDown: ({ className, ...props }: { className?: string }): React.JSX.Element => <svg data-testid="chevron-down" className={className} {...props} />,
  CheckCircle: ({ className, ...props }: { className?: string }): React.JSX.Element => <svg data-testid="check-circle" className={className} {...props} />,
  Lock: ({ className, ...props }: { className?: string }): React.JSX.Element => <svg data-testid="lock" className={className} {...props} />,
  PlayCircle: ({ className, ...props }: { className?: string }): React.JSX.Element => <svg data-testid="play-circle" className={className} {...props} />,
  FileText: ({ className, ...props }: { className?: string }): React.JSX.Element => <svg data-testid="file-text" className={className} {...props} />,
}));

// ResizeObserver mock for Radix UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockChapters: CourseChapter[] = [
  {
    id: '1',
    title: 'Chapter 1: Introduction',
    isCompleted: true,
    isLocked: false,
    children: [
      {
        id: '1.1',
        title: 'Lesson 1.1: Setup',
        isCompleted: false,
        isLocked: false,
      },
      {
        id: '1.2',
        title: 'Lesson 1.2: Basics',
        isCompleted: false,
        isLocked: true,
      },
    ],
  },
  {
    id: '2',
    title: 'Chapter 2: Advanced Topics',
    isCompleted: false,
    isLocked: true,
  },
];

describe('CourseTree', () => {
  it('renders correctly with given chapters', () => {
    const onChapterSelect = vi.fn();
    render(
      <CourseTree
        chapters={mockChapters}
        selectedChapterId={null}
        onChapterSelect={onChapterSelect}
      />
    );

    expect(screen.getByText('Chapter 1: Introduction')).toBeInTheDocument();
    expect(screen.getByText('Chapter 2: Advanced Topics')).toBeInTheDocument();
  });

  it('displays correct icons for completed, locked, and selected chapters', () => {
    const onChapterSelect = vi.fn();
    render(
      <CourseTree
        chapters={mockChapters}
        selectedChapterId="1.1"
        onChapterSelect={onChapterSelect}
      />
    );

    // Chapter 1: Completed icon
    expect(screen.getAllByTestId('check-circle').length).toBeGreaterThan(0);

    // Chapter 2: Locked icon
    expect(screen.getAllByTestId('lock').length).toBeGreaterThan(0);
    
    // Note: Children of Chapter 1 are NOT rendered initially because it's collapsed.
    // So we won't see icons for 1.1 and 1.2 yet.
  });

  it('calls onChapterSelect when a chapter is clicked', () => {
    const onChapterSelect = vi.fn();
    render(
      <CourseTree
        chapters={mockChapters}
        selectedChapterId={null}
        onChapterSelect={onChapterSelect}
      />
    );

    // Click Chapter 1 text area (not the toggle)
    fireEvent.click(screen.getByText('Chapter 1: Introduction'));
    expect(onChapterSelect).toHaveBeenCalledWith('1');

    // Click Chapter 2
    fireEvent.click(screen.getByText('Chapter 2: Advanced Topics'));
    // Since Chapter 2 is locked, it should NOT call onChapterSelect?
    // Let's check logic: onClick={() => !chapter.isLocked && onChapterSelect(chapter.id)}
    expect(onChapterSelect).not.toHaveBeenCalledWith('2');
  });

  it('expands and collapses child chapters', async () => {
    const onChapterSelect = vi.fn();
    render(
      <CourseTree
        chapters={mockChapters}
        selectedChapterId={null}
        onChapterSelect={onChapterSelect}
      />
    );

    // Initially children are hidden
    expect(screen.queryByText('Lesson 1.1: Setup')).not.toBeInTheDocument();

    // Find the toggle button for Chapter 1
    // It's the button containing the ChevronDown icon.
    // Since we mocked ChevronDown with data-testid="chevron-down", we can find it.
    const chevron = screen.getAllByTestId('chevron-down')[0];
    const toggleButton = chevron.closest('button');
    
    expect(toggleButton).toBeInTheDocument();
    
    if (toggleButton) {
      fireEvent.click(toggleButton);
    }

    // Now children should be visible
    await waitFor(() => {
      expect(screen.getByText('Lesson 1.1: Setup')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Lesson 1.2: Basics')).toBeInTheDocument();

    // Verify icons inside children
    // Lesson 1.2 is locked
    expect(screen.getAllByTestId('lock').length).toBeGreaterThan(1); // One for Ch2, one for 1.2

    // Collapse again
    if (toggleButton) {
        fireEvent.click(toggleButton);
    }
    
    await waitFor(() => {
        expect(screen.queryByText('Lesson 1.1: Setup')).not.toBeInTheDocument();
    });
  });
});