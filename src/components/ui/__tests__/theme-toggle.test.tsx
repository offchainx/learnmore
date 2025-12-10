import { render, screen } from '@testing-library/react'
import { ThemeToggle } from '../theme-toggle'
import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'

// Mock next-themes
const setThemeMock = vi.fn()
vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: setThemeMock,
    theme: 'light',
  }),
}))

describe('ThemeToggle', () => {
  it('renders toggle button', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it('opens dropdown menu on click', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const button = screen.getByRole('button', { name: /toggle theme/i })
    
    await user.click(button)
    
    // Radix UI renders in a portal by default, but in JSDOM usually it's within the body.
    // Use findByText to wait for appearance (animations, state updates)
    expect(await screen.findByText('Light')).toBeInTheDocument()
    expect(await screen.findByText('Dark')).toBeInTheDocument()
    expect(await screen.findByText('System')).toBeInTheDocument()
  })
})
