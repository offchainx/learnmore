'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { cn } from '@/lib/utils'

type ReviewTabValue = 'all' | 'pending' | 'manual' | 'published' | 'archived' | 'deleted'

const REVIEW_STATUS_OPTIONS: Array<{
  value: ReviewTabValue
  label: string
}> = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待审核' },
  { value: 'manual', label: '待复核' },
  { value: 'published', label: '已发布' },
  { value: 'archived', label: '已归档' },
  { value: 'deleted', label: '已删除' },
]

interface ReviewStatusFilterProps {
  triggerClassName?: string
}

export function ReviewStatusFilter({
  triggerClassName,
}: ReviewStatusFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const currentValue = (searchParams.get('tab') || 'all') as ReviewTabValue

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set('tab', value)
    } else {
      params.delete('tab')
    }
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  if (!mounted) {
    return (
      <div
        className={cn(
          'h-10 w-full rounded-xl border border-borderTone bg-surface',
          triggerClassName
        )}
        aria-hidden="true"
      />
    )
  }

  return (
    <NativeSelect
      value={currentValue}
      onChange={(event) => handleValueChange(event.target.value)}
      className={triggerClassName}
      aria-label="切换审核状态"
    >
      {REVIEW_STATUS_OPTIONS.map((option) => (
        <NativeSelectOption key={option.value} value={option.value}>
          {option.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  )
}
