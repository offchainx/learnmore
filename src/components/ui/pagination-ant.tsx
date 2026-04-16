'use client'

import React from 'react'
import { ConfigProvider, Pagination, type PaginationProps } from 'antd'
import { cn } from '@/lib/utils'

export type PaginationAntProps = PaginationProps

export function PaginationAnt(props: PaginationAntProps) {
  const { className, ...rest } = props

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'hsl(var(--primary))',
          colorBgContainer: 'hsl(var(--surface-default))',
          colorBorder: 'hsl(var(--border-default))',
          colorText: 'hsl(var(--text-primary))',
          colorTextDisabled: 'hsl(var(--text-disabled))',
          colorFillSecondary: 'hsl(var(--surface-subtle))',
          borderRadius: 14,
          controlHeightSM: 30,
        },
      }}
    >
      <Pagination
        {...rest}
        className={cn('pagination-ant', className)}
        responsive
      />
    </ConfigProvider>
  )
}

export default PaginationAnt
