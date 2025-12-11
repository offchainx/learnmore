import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { VideoPlayer } from '../VideoPlayer'

// Mock react-player with dynamic import
vi.mock('react-player', () => ({
  default: vi.fn(({ url, onError, onProgress, onEnded }) => {
    return (
      <div data-testid="mock-react-player" data-url={url}>
        <button onClick={() => onError?.(new Error('Test error'))}>Error</button>
        <button onClick={() => onProgress?.({ played: 0.5, playedSeconds: 50, loaded: 0.8, loadedSeconds: 80 })}>
          Progress
        </button>
        <button onClick={() => onEnded?.()}>Ended</button>
      </div>
    )
  })
}))

describe('VideoPlayer', () => {
  it('should render error message when url is not provided', () => {
    render(<VideoPlayer url="" />)
    expect(screen.getByText('Video unavailable')).toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    render(<VideoPlayer url="https://example.com/video.mp4" />)

    // Check for loading message (before hasMounted is true)
    expect(screen.getByText('Loading player...')).toBeInTheDocument()
  })

  it('should render player after mount', async () => {
    render(<VideoPlayer url="https://example.com/video.mp4" />)

    // Wait for component to mount (setTimeout in useEffect)
    await waitFor(() => {
      expect(screen.getByTestId('mock-react-player')).toBeInTheDocument()
    })
  })

  it('should show error message when player encounters error', async () => {
    render(<VideoPlayer url="https://example.com/video.mp4" />)

    // Wait for mount
    await waitFor(() => {
      expect(screen.getByTestId('mock-react-player')).toBeInTheDocument()
    })

    const errorButton = screen.getByText('Error')
    errorButton.click()

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Error loading video')).toBeInTheDocument()
    })
  })

  it('should pass url to ReactPlayer', async () => {
    const testUrl = 'https://example.com/test-video.mp4'
    render(<VideoPlayer url={testUrl} />)

    await waitFor(() => {
      const player = screen.getByTestId('mock-react-player')
      expect(player).toHaveAttribute('data-url', testUrl)
    })
  })

  it('should call onProgress callback', async () => {
    const onProgress = vi.fn()
    render(<VideoPlayer url="https://example.com/video.mp4" onProgress={onProgress} />)

    await waitFor(() => {
      expect(screen.getByTestId('mock-react-player')).toBeInTheDocument()
    })

    const progressButton = screen.getByText('Progress')
    progressButton.click()

    expect(onProgress).toHaveBeenCalledWith({
      played: 0.5,
      playedSeconds: 50,
      loaded: 0.8,
      loadedSeconds: 80
    })
  })

  it('should call onEnded callback', async () => {
    const onEnded = vi.fn()
    render(<VideoPlayer url="https://example.com/video.mp4" onEnded={onEnded} />)

    await waitFor(() => {
      expect(screen.getByTestId('mock-react-player')).toBeInTheDocument()
    })

    const endedButton = screen.getByText('Ended')
    endedButton.click()

    expect(onEnded).toHaveBeenCalled()
  })

  it('should accept custom className', () => {
    const { container } = render(
      <VideoPlayer url="https://example.com/video.mp4" className="custom-class" />
    )

    const videoContainer = container.querySelector('.custom-class')
    expect(videoContainer).toBeInTheDocument()
  })

  it('should render with default dimensions', () => {
    render(<VideoPlayer url="https://example.com/video.mp4" />)

    // Check for aspect-video class (default behavior)
    const container = document.querySelector('.aspect-video')
    expect(container).toBeInTheDocument()
  })
})
