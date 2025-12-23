'use client'

import { useEffect } from 'react'
import { initPolyfills, needsPolyfills } from '@/lib/polyfills'

export function PolyfillsLoader() {
  useEffect(() => {
    if (needsPolyfills()) {
      initPolyfills().catch((err) => {
        console.error('[Polyfills] Failed to load polyfills:', err)
      })
    }
  }, [])

  return null // 此组件不渲染任何UI
}
