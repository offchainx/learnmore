import { render, screen } from '@testing-library/react'
import { UserNav } from '../UserNav'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

// Mock the logout action
vi.mock('@/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

const mockUser = {
  username: 'Test User',
  email: 'test@example.com',
  avatar: null,
}

describe('UserNav', () => {
  it('renders user avatar fallback', () => {
    render(<UserNav user={mockUser} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('shows user details in dropdown', async () => {
    const user = userEvent.setup()
    render(<UserNav user={mockUser} showDetails={true} />)
    
    const trigger = screen.getByRole('button')
    await user.click(trigger)
    
    expect(await screen.findByText('Test User', { selector: 'p.font-medium' })).toBeInTheDocument()
    expect(await screen.findByText('test@example.com')).toBeInTheDocument()
    expect(await screen.findByText('Log out')).toBeInTheDocument()
  })
})
