import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CourseLayoutClient } from '../CourseLayoutClient'
import { CourseChapter } from '../CourseTree'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useParams: () => ({
    subjectId: 'subject-1',
    lessonId: 'lesson-1',
  }),
}))

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

const mockChapters: CourseChapter[] = [
  {
    id: 'c1',
    title: 'Chapter 1',
    children: [
      { id: 'l1', title: 'Lesson 1', isCompleted: false },
    ],
  },
]

describe('CourseLayoutClient', () => {
  beforeEach(() => {
    // Reset window width to desktop
    window.innerWidth = 1024
    fireEvent(window, new Event('resize'))
  })

  it('renders sidebar title', () => {
    render(
        <CourseLayoutClient chapters={mockChapters} title="Test Course">
            <div>Child Content</div>
        </CourseLayoutClient>
    )
    expect(screen.getByText('Test Course')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
        <CourseLayoutClient chapters={mockChapters} title="Test Course">
            <div>Child Content</div>
        </CourseLayoutClient>
    )
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })
  
  it('renders resizable panels structure in desktop mode', () => {
     render(
        <CourseLayoutClient chapters={mockChapters} title="Test Course">
            <div>Child Content</div>
        </CourseLayoutClient>
    )
    // Check for panel group presence by class or structure logic
    // react-resizable-panels usually renders divs with specific styles
    // Here we can check if the sidebar content is visible directly (not in a Sheet)
    expect(screen.getByText('Test Course')).toBeVisible()
    // Ensure Sheet trigger is hidden
    const sheetTrigger = screen.queryByRole('button', { name: /toggle navigation menu/i })
    expect(sheetTrigger).toBeNull()
  })
})
