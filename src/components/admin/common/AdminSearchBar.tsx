'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface AdminSearchBarProps {
  paramKey?: string
  placeholder?: string
  helperText?: string
  className?: string
  inputClassName?: string
  clearable?: boolean
}

export function AdminSearchBar({
  paramKey = 'q',
  placeholder = '搜索...',
  helperText,
  className,
  inputClassName,
  clearable = true,
}: AdminSearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [value, setValue] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setValue(searchParams.get(paramKey) ?? '')
  }, [paramKey, searchParams])

  const applySearch = (rawValue: string) => {
    const nextValue = rawValue.trim()
    const params = new URLSearchParams(searchParams.toString())

    if (nextValue) {
      params.set(paramKey, nextValue)
    } else {
      params.delete(paramKey)
    }

    params.delete('page')
    params.delete('questionId')
    params.delete('reviewAction')
    params.delete('nextQuestionId')

    const query = params.toString()
    router.push(query ? `?${query}` : '?')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    applySearch(value)
  }

  const handleClear = () => {
    setValue('')
    applySearch('')
  }

  if (!mounted) {
    return (
      <div className={cn('space-y-1.5', className)} aria-hidden="true">
        <div className="h-10 w-full rounded-2xl border border-borderTone bg-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] dark:border-borderTone dark:bg-surface dark:shadow-none" />
        {helperText ? (
          <div className="h-4 w-64 rounded bg-surface-subtle dark:bg-surface-subtle" />
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="group relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-text-tertiary transition-colors group-focus-within:text-primary dark:text-text-tertiary dark:group-focus-within:text-primary" />
          </div>
          <Input
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            className={cn(
              'h-10 border-borderTone bg-surface pl-10 pr-11 text-text-primary placeholder:text-text-tertiary focus-visible:ring-primary/20 dark:border-borderTone dark:bg-surface dark:text-text-primary dark:placeholder:text-text-tertiary',
              inputClassName
            )}
          />
          {clearable && value ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full text-text-tertiary hover:bg-surface-subtle hover:text-text-primary dark:text-text-tertiary dark:hover:bg-surface-subtle dark:hover:text-text-primary"
              aria-label="清空搜索"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </form>
      {helperText ? (
        <p className="text-xs text-text-secondary dark:text-text-secondary">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
