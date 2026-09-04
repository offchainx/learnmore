'use client'

import React from 'react'
import { Pagination, type PaginationProps } from 'antd'
import { cn } from '@/lib/utils'

export type PaginationAntProps = PaginationProps

export function PaginationAnt(props: PaginationAntProps) {
  const { className, responsive = true, ...rest } = props
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setHydrated(true)
  }, [])

  return (
    <Pagination
      {...rest}
      className={cn('pagination-ant', className)}
      responsive={hydrated && responsive}
    />
  )
}

export default PaginationAnt
