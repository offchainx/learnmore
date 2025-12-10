import { render, screen } from '@testing-library/react'
import { Header } from '../Header'
import { vi, describe, it, expect } from 'vitest'

// Mock usePathname
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/courses',
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: vi.fn(),
    theme: 'light',
  }),
}))

describe('Header', () => {
  it('renders breadcrumbs correctly', () => {
    render(<Header />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    // "Courses" is the current page, so it might be rendered inside BreadcrumbPage
    expect(screen.getByText('Courses')).toBeInTheDocument()
  })

  it('renders user avatar fallback', () => {
    render(<Header />)
    // The placeholder user is "John Doe", fallback "J" (or JD depending on implementation)
    // Looking at UserNav.tsx: displayName[0].toUpperCase()
    // "John Doe"[0] -> "J"
    expect(screen.getByText('J')).toBeInTheDocument()
  })
})
