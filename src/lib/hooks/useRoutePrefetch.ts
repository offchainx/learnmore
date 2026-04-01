'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type UseRoutePrefetchOptions = {
  routes: Array<string | null | undefined>
  enabled?: boolean
}

export function useRoutePrefetch({
  routes,
  enabled = true,
}: UseRoutePrefetchOptions) {
  const router = useRouter()
  const routesKey = routes
    .filter((route): route is string => typeof route === 'string' && route.length > 0)
    .join('|')

  useEffect(() => {
    if (!enabled) return

    const uniqueRoutes = Array.from(
      new Set(
        routes.filter((route): route is string => typeof route === 'string' && route.length > 0)
      )
    )

    uniqueRoutes.forEach((route) => {
      try {
        router.prefetch(route)
      } catch {
        // Prefetch is best-effort; navigation still works if it fails.
      }
    })
  }, [enabled, router, routesKey])
}

export function useRoutePrefetcher() {
  const router = useRouter()

  return useCallback(
    (route: string | null | undefined) => {
      if (!route) return

      try {
        router.prefetch(route)
      } catch {
        // Prefetch is best-effort; navigation still works if it fails.
      }
    },
    [router]
  )
}
