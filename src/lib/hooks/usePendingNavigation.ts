'use client'

import { useEffect, useState, useTransition } from 'react'

type NavigationAction = () => void

export function usePendingNavigation() {
  const [isPending, startTransition] = useTransition()
  const [pendingTarget, setPendingTarget] = useState<string | null>(null)

  useEffect(() => {
    if (!isPending && pendingTarget !== null) {
      setPendingTarget(null)
    }
  }, [isPending, pendingTarget])

  const runNavigation = (target: string, action: NavigationAction) => {
    setPendingTarget(target)
    startTransition(() => {
      action()
    })
  }

  return {
    isPending,
    pendingTarget,
    runNavigation,
  }
}
