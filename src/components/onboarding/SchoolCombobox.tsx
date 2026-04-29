'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { Search } from 'lucide-react'

import { searchSchools } from '@/lib/schools'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

type SchoolComboboxProps = {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SchoolCombobox({
  id = 'school',
  name = 'school',
  value,
  onChange,
  placeholder = '输入学校名称',
  className,
}: SchoolComboboxProps) {
  const [isFocused, setIsFocused] = useState(false)
  const deferredValue = useDeferredValue(value)

  const suggestions = useMemo(
    () => searchSchools(deferredValue, 8),
    [deferredValue]
  )

  const trimmedValue = deferredValue.trim()
  const shouldShowSuggestions =
    isFocused &&
    (trimmedValue.length >= 2 || /[\u3400-\u9fff]/.test(trimmedValue))

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className="text-sm font-medium text-slate-900">
        学校
      </label>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setIsFocused(false), 120)
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="h-12 rounded-[12px] border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:bg-white focus-visible:ring-slate-300"
        />
      </div>

      <p className="text-xs leading-5 text-slate-500">
        支持中文、马来文和英文别名搜索，中文单字也可以直接触发候选。
      </p>

      {shouldShowSuggestions ? (
        <div className="rounded-[16px] border border-slate-200 bg-slate-50/90 p-2">
          {suggestions.length > 0 ? (
            <div className="max-h-52 space-y-1 overflow-auto">
              {suggestions.map((school) => {
                const isSelected = school.name === value
                const subtitle = [school.city, school.state]
                  .filter(Boolean)
                  .join(' · ')

                return (
                  <button
                    key={school.name}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onChange(school.name)}
                    className={cn(
                      'flex w-full items-start justify-between gap-3 rounded-[12px] px-3 py-2 text-left text-sm transition-colors',
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-white hover:text-slate-950'
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {school.name}
                      </span>
                      <span
                        className={cn(
                          'mt-0.5 block truncate text-xs',
                          isSelected ? 'text-white/70' : 'text-slate-500'
                        )}
                      >
                        {subtitle}
                      </span>
                    </span>
                    {isSelected ? (
                      <span className="text-xs uppercase tracking-[0.18em] text-white/70">
                        Selected
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-2 px-3 py-3">
              <p className="text-sm text-slate-600">
                没有找到匹配项，当前输入可以直接作为学校名称使用。
              </p>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onChange(value)}
                className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                使用当前输入
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
