import { useEffect, useMemo, useState } from 'react'
import useDebounce from '@/lib/hooks/useDebounce'
import { normalizeHandle, validateHandle } from '@/lib/users/handle'

type HandleAvailabilityState = {
  status: 'idle' | 'checking' | 'available' | 'unavailable'
  normalizedHandle: string
  reason: string | null
}

export function useHandleAvailability(
  handle: string,
  initialHandle?: string | null,
): HandleAvailabilityState {
  const debouncedHandle = useDebounce(handle, 350)
  const initialNormalizedHandle = useMemo(
    () => normalizeHandle(initialHandle || ''),
    [initialHandle],
  )
  const [state, setState] = useState<HandleAvailabilityState>({
    status: 'idle',
    normalizedHandle: initialNormalizedHandle,
    reason: null,
  })

  useEffect(() => {
    const normalizedHandle = normalizeHandle(debouncedHandle)

    if (!normalizedHandle) {
      setState({
        status: 'idle',
        normalizedHandle: '',
        reason: null,
      })
      return
    }

    if (normalizedHandle === initialNormalizedHandle) {
      setState({
        status: 'idle',
        normalizedHandle,
        reason: null,
      })
      return
    }

    const validationError = validateHandle(normalizedHandle)
    if (validationError) {
      setState({
        status: 'unavailable',
        normalizedHandle,
        reason: validationError,
      })
      return
    }

    const controller = new AbortController()

    setState({
      status: 'checking',
      normalizedHandle,
      reason: null,
    })

    fetch(
      `/api/users/handle-availability?handle=${encodeURIComponent(normalizedHandle)}`,
      {
        method: 'GET',
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        const payload = await response.json()
        if (!response.ok || !payload.success) {
          throw new Error(payload.reason || '暂时无法检查账号标识')
        }

        setState({
          status: payload.available ? 'available' : 'unavailable',
          normalizedHandle: payload.normalizedHandle || normalizedHandle,
          reason: payload.reason || null,
        })
      })
      .catch((error: unknown) => {
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return
        }

        setState({
          status: 'unavailable',
          normalizedHandle,
          reason:
            error instanceof Error
              ? error.message
              : '暂时无法检查账号标识',
        })
      })

    return () => {
      controller.abort()
    }
  }, [debouncedHandle, initialNormalizedHandle])

  return state
}
