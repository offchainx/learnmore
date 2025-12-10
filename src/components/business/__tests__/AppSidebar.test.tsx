import { render, screen } from '@testing-library/react'
import { AppSidebar } from '../AppSidebar'
import { beforeEach, describe, expect, it, vi, Mock } from 'vitest'
import { usePathname } from 'next/navigation'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
}));

describe('AppSidebar', () => {
  beforeEach(() => {
    // Mock usePathname to return a default value for tests
    (usePathname as Mock).mockReturnValue('/dashboard');
  });

  it('renders brand name', () => {
    render(<AppSidebar />)
    // There are two "LearnMore" texts (mobile sheet and desktop sidebar)
    // Using getAllByText covers both or either depending on visibility mock
    const brandTexts = screen.getAllByText('LearnMore')
    expect(brandTexts.length).toBeGreaterThan(0)
  })

  it('renders navigation items', () => {
    render(<AppSidebar />)
    const dashboardItems = screen.getAllByText('Dashboard')
    expect(dashboardItems.length).toBeGreaterThan(0)
    
    const coursesItems = screen.getAllByText('My Courses') 
    expect(coursesItems.length).toBeGreaterThan(0)
  })
})
