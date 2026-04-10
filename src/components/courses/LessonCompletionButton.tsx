'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { updateUserLessonProgress } from '@/actions/courses/progress'

interface LessonCompletionButtonProps {
  lessonId: string
  duration?: number | null
  label?: string
}

export function LessonCompletionButton({
  lessonId,
  duration,
  label = '标记为已完成',
}: LessonCompletionButtonProps) {
  const [isPending, startTransition] = React.useTransition()

  const handleComplete = () => {
    startTransition(async () => {
      const result = await updateUserLessonProgress(lessonId, duration && duration > 0 ? duration : 1)
      if (!result.success) {
        console.error('Failed to complete lesson:', result.error)
      }
    })
  }

  return (
    <Button onClick={handleComplete} disabled={isPending} variant="outline">
      {isPending ? '保存中…' : label}
    </Button>
  )
}

