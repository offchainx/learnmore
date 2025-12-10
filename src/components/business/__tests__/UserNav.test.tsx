import { render, screen } from '@testing-library/react'
import { UserNav } from '../UserNav'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

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
    render(<UserNav user={mockUser} />)
    
    // The trigger is a button wrapping the Avatar
    const trigger = screen.getByRole('button')
    await user.click(trigger)
    
    expect(await screen.findByText('Test User')).toBeInTheDocument()
    expect(await screen.findByText('test@example.com')).toBeInTheDocument()
    expect(await screen.findByText('退出登录')).toBeInTheDocument()
  })
})
