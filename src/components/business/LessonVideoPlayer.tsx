'use client'

import React, { useState, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import useDebounce from '@/lib/hooks/useDebounce';
import { updateUserLessonProgress } from '@/actions/progress'; // Import the server action

interface LessonVideoPlayerProps {

  lessonId: string;

  videoUrl: string;

  initialPosition?: number;

}



export function LessonVideoPlayer({ lessonId, videoUrl, initialPosition = 0 }: LessonVideoPlayerProps) {

  const [playedSeconds, setPlayedSeconds] = useState(0);

  const debouncedPlayedSeconds = useDebounce(playedSeconds, 5000); // Debounce by 5 seconds



  // Effect to report debounced progress

  useEffect(() => {

    // Only report if playedSeconds has actually changed significantly from initialPosition

    // to avoid immediate save on load

    if (debouncedPlayedSeconds > 0 && Math.abs(debouncedPlayedSeconds - initialPosition) > 1) {

      updateUserLessonProgress(lessonId, debouncedPlayedSeconds)

        .then(response => {

          if (!response.success) {

            console.error('Failed to update progress:', response.error);

          }

        })

        .catch(error => console.error('Error calling update progress action:', error));

    }

  }, [debouncedPlayedSeconds, lessonId, initialPosition]);



  const handleProgress = (state: { playedSeconds: number }) => {

    setPlayedSeconds(state.playedSeconds);

  };



  const handleEnded = () => {

    // Video ended. Marking as completed.

    updateUserLessonProgress(lessonId, Number.MAX_SAFE_INTEGER)

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

      initialPosition={initialPosition}

      onProgress={handleProgress}

      onEnded={handleEnded}

    />

  );

}
