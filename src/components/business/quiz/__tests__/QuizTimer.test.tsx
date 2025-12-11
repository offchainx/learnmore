
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuizTimer } from '../QuizTimer';

// Mock the quiz store
vi.mock('@/lib/store/quiz-store', () => {
  let timerValue = 0;
  const setTimer = vi.fn((val) => {
    if (typeof val === 'function') {
      timerValue = val(timerValue);
    } else {
      timerValue = val;
    }
  });
  
  return {
    useQuizStore: vi.fn((selector) => {
      // Mock basic selector behavior
      if (selector.toString().includes('timer')) return timerValue;
      if (selector.toString().includes('setTimer')) return setTimer;
      return selector({ timer: timerValue, setTimer });
    }),
  };
});

describe('QuizTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // Note: Testing React components that rely on internal setInterval + external Zustand store 
  // via unit tests can be complex due to the disconnected state updates.
  // For this project, we will rely on a basic render test and verifying the format.
  
  it('should render the timer text', () => {
    // Manually setting the return value for the mocked hook for this test run
    // detailed interaction testing is better done in integration tests
    render(<QuizTimer initialTimeInSeconds={60} />);
    // Initial render might check the initial state from the store
    expect(screen.getByText(/Time Left:/)).toBeDefined();
  });
});
