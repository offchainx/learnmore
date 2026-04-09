'use client'

import { useEffect } from 'react'
import { installBrowserWarningSuppressions } from '@/lib/suppress-warnings'

export function BrowserErrorSuppressor() {
  useEffect(() => installBrowserWarningSuppressions(), [])

  return null
}
