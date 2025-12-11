"use client";

import React, { useEffect, useRef } from 'react';
import { useQuizStore } from '@/lib/store/quiz-store';
import { cn } from '@/lib/utils';

interface QuizTimerProps {
  initialTimeInSeconds: number; // The total time for the quiz in seconds
  onTimeUp?: () => void;
}

export function QuizTimer({ initialTimeInSeconds, onTimeUp }: QuizTimerProps) {
  const timer = useQuizStore((state) => state.timer);
  const setTimer = useQuizStore((state) => state.setTimer);
  const decrementTimer = useQuizStore((state) => state.decrementTimer);
  
  // Use a ref to track if we've already triggered onTimeUp to avoid double calls
  // or calling it on initial mount if timer starts at 0 (though unlikely for a quiz).
  const isFinishedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer
  useEffect(() => {
    // Only set timer if it's 0 (uninitialized) and we have a valid initial time
    if (timer === 0 && initialTimeInSeconds > 0) {
      setTimer(initialTimeInSeconds);
      isFinishedRef.current = false;
    }
  }, [initialTimeInSeconds, timer, setTimer]);

  // Handle countdown
  useEffect(() => {
    // Clear any existing interval
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      // Access latest timer value directly from store to avoid closure staleness
      // while keeping the effect dependency list clean.
      const currentTimer = useQuizStore.getState().timer;

      if (currentTimer <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        
        if (!isFinishedRef.current && onTimeUp) {
          isFinishedRef.current = true;
          onTimeUp();
        }
        return;
      }

      decrementTimer();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [decrementTimer, onTimeUp]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        "font-mono text-lg font-semibold tabular-nums",
        timer <= 60 && "text-orange-500", // Warn when 1 minute left
        timer <= 10 && "text-red-500 animate-pulse" // Critical when 10 seconds left
      )}
    >
      Time Left: {formatTime(timer)}
    </div>
  );
}