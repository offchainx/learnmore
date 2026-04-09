import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  installBrowserWarningSuppressions,
  shouldSuppressBrowserRuntimeError,
} from '@/lib/suppress-warnings'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('suppress-warnings', () => {
  it('suppresses MetaMask connection failures', () => {
    expect(
      shouldSuppressBrowserRuntimeError({
        message: 'Failed to connect to MetaMask',
      })
    ).toBe(true)
  })

  it('suppresses browser extension stack traces', () => {
    expect(
      shouldSuppressBrowserRuntimeError({
        error: new Error(
          'Object.connect\nchrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/scripts/inpage.js'
        ),
      })
    ).toBe(true)
  })

  it('does not suppress ordinary application errors', () => {
    expect(
      shouldSuppressBrowserRuntimeError({
        message: 'Network request failed',
        filename: 'https://learnmorev10.vercel.app/_next/static/chunks/app/page.js',
      })
    ).toBe(false)
  })

  it('installs and cleans up browser listeners', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const cleanup = installBrowserWarningSuppressions()

    expect(addSpy).toHaveBeenCalledWith('error', expect.any(Function), true)
    expect(addSpy).toHaveBeenCalledWith(
      'unhandledrejection',
      expect.any(Function),
      true
    )

    console.warn('useFormState has been renamed to React.useActionState')
    expect(warnSpy).not.toHaveBeenCalled()

    console.warn('ordinary warning')
    expect(warnSpy).toHaveBeenCalledTimes(1)

    cleanup()

    expect(removeSpy).toHaveBeenCalledWith('error', expect.any(Function), true)
    expect(removeSpy).toHaveBeenCalledWith(
      'unhandledrejection',
      expect.any(Function),
      true
    )
  })
})
