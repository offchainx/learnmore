'use client'

import React, { useState, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import useDebounce from '@/lib/hooks/useDebounce';
import { updateUserLessonProgress } from '@/actions/progress'; // Import the server action

interface LessonVideoPlayerProps {
  lessonId: string;
  videoUrl: string;
}

export function LessonVideoPlayer({ lessonId, videoUrl }: LessonVideoPlayerProps) {
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const debouncedPlayedSeconds = useDebounce(playedSeconds, 5000); // Debounce by 5 seconds

  // Effect to report debounced progress
  useEffect(() => {
    if (debouncedPlayedSeconds > 0) {
      // Only report if playedSeconds has actually changed
      // This helps prevent unnecessary calls if video is paused for a long time
      updateUserLessonProgress(lessonId, debouncedPlayedSeconds)
        .then(response => {
          if (response.success) {
            // Progress updated successfully
          } else {
            console.error('Failed to update progress:', response.error);
          }
        })
        .catch(error => console.error('Error calling update progress action:', error));
    }
  }, [debouncedPlayedSeconds, lessonId]);

  const handleProgress = (state: { playedSeconds: number }) => {
    setPlayedSeconds(state.playedSeconds);
  };

  const handleEnded = () => {
    // Video ended. Marking as completed.
    // When video ends, ensure the last progress (100%) is reported
    // We can assume 100% completion or pass a large number to trigger the 90% logic in server action
    updateUserLessonProgress(lessonId, Number.MAX_SAFE_INTEGER) // Pass a large number to ensure >= 90%
        .then(response => {
            if (!response.success) {
                console.error('Failed to mark lesson as completed:', response.error);
            }
        })
        .catch(error => console.error('Error calling update progress action on ended:', error));
  };

  return (
    <VideoPlayer
      url={videoUrl}
      onProgress={handleProgress}
      onEnded={handleEnded}
    />
  );
}