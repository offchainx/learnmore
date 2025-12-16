import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDebounce from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // Mock timers
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('should debounce the value', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'first', delay: 500 },
    });

    expect(result.current).toBe('first');

    // Update value
    rerender({ value: 'second', delay: 500 });
    expect(result.current).toBe('first'); // Should still be the old value

    act(() => {
      vi.advanceTimersByTime(499); // Advance almost to the delay
    });
    expect(result.current).toBe('first'); // Still old value

    act(() => {
      vi.advanceTimersByTime(1); // Advance past the delay
    });
    expect(result.current).toBe('second'); // Should now be the new value
  });

  it('should update the debounced value when delay is 0', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 0 },
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 0 });
    act(() => {
      vi.advanceTimersByTime(0); // Immediately advance
    });
    expect(result.current).toBe('updated');
  });

  it('should not update if value is the same', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'stable', delay: 500 },
    });

    expect(result.current).toBe('stable');

    rerender({ value: 'stable', delay: 500 }); // Rerender with the same value

    act(() => {
      vi.advanceTimersByTime(500); // Advance past the delay
    });
    expect(result.current).toBe('stable'); // Should still be stable
  });

  it('should cancel previous debounced calls on re-render', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'one', delay: 500 },
    });

    expect(result.current).toBe('one');

    rerender({ value: 'two', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200); // Partially advance for 'two'
    });
    rerender({ value: 'three', delay: 500 }); // Rerender again, should cancel 'two'

    act(() => {
      vi.advanceTimersByTime(500); // Advance for 'three'
    });
    expect(result.current).toBe('three'); // Should be 'three', not 'two'
  });
});
