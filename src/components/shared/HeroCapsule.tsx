import * as React from 'react'

import {
  pageHeroCapsuleClass,
  pageHeroCapsuleDotClass,
} from '@/components/shared/pageSurfaces'

interface HeroCapsuleProps {
  label: React.ReactNode
}

export function HeroCapsule({ label }: HeroCapsuleProps) {
  return (
    <span className={pageHeroCapsuleClass}>
      <span className={pageHeroCapsuleDotClass} />
      {label}
    </span>
  )
}
