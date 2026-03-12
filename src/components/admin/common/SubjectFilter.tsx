'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface Subject {
  id: string
  name: string
  slug: string
}

interface SubjectFilterProps {
  subjects: Subject[]
  triggerClassName?: string
  contentClassName?: string
}

export function SubjectFilter({
  subjects,
  triggerClassName,
  contentClassName,
}: SubjectFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const currentSubjectId = searchParams.get('subjectId') || 'all'

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set('subjectId', value)
    } else {
      params.delete('subjectId')
    }
    // Reset page when filter changes
    params.delete('page')

    router.push(`?${params.toString()}`)
  }

  if (!mounted) {
    return (
      <div
        className={cn(
          'h-10 w-[180px] rounded-md border border-input bg-background',
          triggerClassName
        )}
        aria-hidden="true"
      />
    )
  }

  return (
    <Select value={currentSubjectId} onValueChange={handleValueChange}>
      <SelectTrigger className={cn('w-[180px]', triggerClassName)}>
        <SelectValue placeholder="筛选科目" />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        <SelectItem value="all">所有科目</SelectItem>
        {subjects.map((subject) => (
          <SelectItem key={subject.id} value={subject.id}>
            {subject.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
