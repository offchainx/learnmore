'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  {
    value: 'sourceFileCreatedAt:desc',
    label: '导入日期（最新优先）',
  },
  {
    value: 'sourceFileCreatedAt:asc',
    label: '导入日期（最早优先）',
  },
  {
    value: 'reviewedAt:desc',
    label: '审核日期（最新优先）',
  },
  {
    value: 'reviewedAt:asc',
    label: '审核日期（最早优先）',
  },
  {
    value: 'createdAt:desc',
    label: '创建时间（最新优先）',
  },
  {
    value: 'createdAt:asc',
    label: '创建时间（最早优先）',
  },
] as const

interface ReviewSortControlProps {
  triggerClassName?: string
  contentClassName?: string
}

export function ReviewSortControl({
  triggerClassName,
  contentClassName,
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
          'h-10 w-[220px] rounded-md border border-input bg-background',
          triggerClassName
        )}
        aria-hidden="true"
      />
    )
  }

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger className={cn('w-[220px]', triggerClassName)}>
        <SelectValue placeholder="排序方式" />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
