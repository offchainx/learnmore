import { render, screen } from '@testing-library/react'
import { AppSidebar } from '../AppSidebar'
import { describe, it, expect } from 'vitest'

describe('AppSidebar', () => {
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
    
    const coursesItems = screen.getAllByText('Courses')
    expect(coursesItems.length).toBeGreaterThan(0)
  })
})
