import { render, screen } from '@testing-library/react'
import { Header } from '../Header'
import { vi, describe, it, expect } from 'vitest'

// Mock usePathname
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard/courses'),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: vi.fn(),
    theme: 'light',
  }),
}))

describe('Header', () => {
  it('renders user avatar fallback', () => {
    render(<Header />)
    // The placeholder user is "Alex Student", fallback "A"
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('renders streak display', () => {
    render(<Header />)
    expect(screen.getByText('12 Day Streak')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<Header />)
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders language toggle', () => {
    render(<Header />)
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('renders notification icon', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });
})