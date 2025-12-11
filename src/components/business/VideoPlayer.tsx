'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any

interface VideoPlayerProps {
  url: string
  light?: boolean | string
  playing?: boolean
  controls?: boolean
  width?: string | number
  height?: string | number
  className?: string
  onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void
  onEnded?: () => void
}

export function VideoPlayer({
  url,
  light = false,
  playing = false,
  controls = true,
  width = '100%',
  height = '100%',
  className,
  onProgress,
  onEnded
}: VideoPlayerProps) {
  const [hasMounted, setHasMounted] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Use setTimeout to avoid cascading renders
    const timer = setTimeout(() => {
      setHasMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-muted aspect-video rounded-lg ${className || ''}`}>
        <p className="text-muted-foreground">Video unavailable</p>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-muted aspect-video rounded-lg ${className || ''}`}>
        <p className="text-destructive">Error loading video</p>
      </div>
    )
  }

  if (!hasMounted) {
    return (
      <div className={`flex items-center justify-center bg-black aspect-video rounded-lg ${className || ''}`}>
        <p className="text-white">Loading player...</p>
      </div>
    )
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden aspect-video ${className || ''}`}>
      <ReactPlayer
        className="absolute top-0 left-0"
        url={url}
        width={width}
        height={height}
        controls={controls}
        light={light}
        playing={playing}
        onError={(e: unknown) => {
            console.error('Video player error:', e);
            setHasError(true);
        }}
        onProgress={onProgress}
        onEnded={onEnded}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
              onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
            }
          }
        }}
      />
    </div>
  )
}
