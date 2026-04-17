'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  NativeSelect,
  NativeSelectOption,
  NativeSelectOptGroup,
} from '@/components/ui/native-select'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  {
    value: 'sourceFileCreatedAt:desc',
    label: '⬇ 最新优先',
  },
  {
    value: 'sourceFileCreatedAt:asc',
    label: '⬆ 最早优先',
  },
  {
    value: 'reviewedAt:desc',
    label: '⬇ 最新优先',
  },
  {
    value: 'reviewedAt:asc',
    label: '⬆ 最早优先',
  },
] as const

interface ReviewSortControlProps {
  triggerClassName?: string
}

export function ReviewSortControl({
  triggerClassName,
}: ReviewSortControlProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentValue = useMemo(() => {
    const field = searchParams.get('sortField') || 'sourceFileCreatedAt'
    const order = searchParams.get('sortOrder') || 'desc'
    return `${field}:${order}`
  }, [searchParams])

  const handleValueChange = (value: string) => {
    const [field, order] = value.split(':')
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortField', field)
    params.set('sortOrder', order)
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
      aria-label="排序方式"
    >
      <NativeSelectOptGroup label="导入日期">
        <NativeSelectOption value="sourceFileCreatedAt:desc">
          {SORT_OPTIONS[0].label}
        </NativeSelectOption>
        <NativeSelectOption value="sourceFileCreatedAt:asc">
          {SORT_OPTIONS[1].label}
        </NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="审核日期">
        <NativeSelectOption value="reviewedAt:desc">
          {SORT_OPTIONS[2].label}
        </NativeSelectOption>
        <NativeSelectOption value="reviewedAt:asc">
          {SORT_OPTIONS[3].label}
        </NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  )
}
