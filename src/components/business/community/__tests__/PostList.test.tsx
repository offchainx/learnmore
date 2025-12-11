import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PostList } from '../PostList'
import type { PostWithAuthor } from '@/actions/community'

// Mock post data
const mockPosts: PostWithAuthor[] = [
  {
    id: 'post-1',
    authorId: 'user-1',
    title: 'First Post',
    content: 'This is the first post content',
    subjectId: 'subject-1',
    likeCount: 5,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    author: {
      id: 'user-1',
      username: 'UserOne',
      avatar: null,
      role: 'STUDENT',
    },
    _count: {
      comments: 2,
    },
    subject: {
      id: 'subject-1',
      name: 'Math',
      icon: null,
    },
  },
  {
    id: 'post-2',
    authorId: 'user-2',
    title: 'Second Post',
    content: 'This is the second post content',
    subjectId: null,
    likeCount: 0,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    author: {
      id: 'user-2',
      username: 'UserTwo',
      avatar: null,
      role: 'TEACHER',
    },
    _count: {
      comments: 0,
    },
    subject: null,
  },
]

const mockMetadata = {
  page: 1,
  totalPages: 2,
  hasNextPage: true,
  hasPrevPage: false,
}

describe('PostList', () => {
  it('renders empty state when no posts', () => {
    render(
      <PostList
        posts={[]}
        metadata={{ ...mockMetadata, totalPages: 0, hasNextPage: false }}
        baseUrl="/test"
      />
    )
    expect(screen.getByText('No posts found')).toBeInTheDocument()
    expect(screen.getByText('Be the first to start a conversation in this topic!')).toBeInTheDocument()
  })

  it('renders posts correctly', () => {
    render(
      <PostList
        posts={mockPosts}
        metadata={mockMetadata}
        baseUrl="/test"
      />
    )
    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(screen.getByText('Second Post')).toBeInTheDocument()
    expect(screen.getByText('UserOne')).toBeInTheDocument()
    expect(screen.getByText('Math')).toBeInTheDocument()
    
    // Check likes
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders pagination controls correctly', () => {
    render(
      <PostList
        posts={mockPosts}
        metadata={mockMetadata}
        baseUrl="/test"
      />
    )
    
    // Check page info
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    
    // Check Next button is enabled (link exists)
    const nextLink = screen.getByText('Next').closest('a')
    expect(nextLink).toHaveAttribute('href', '/test?page=2')
    
    // Check Previous button is disabled (no link or disabled styling)
    // In our implementation, we render a span if disabled, or a link if enabled.
    // "Previous" text should be present.
    const prevButton = screen.getByText('Previous')
    expect(prevButton.closest('a')).toBeNull() // Should not be a link
  })
})
