/**
 * 浏览器噪音过滤工具
 * 1. 忽略已知的 React 兼容警告
 * 2. 拦截浏览器扩展注入的运行时错误，避免它们触发 Next.js 红屏
 */

const EXTENSION_URL_PATTERN =
  /(?:chrome|moz|safari-web|ms-browser)-extension:\/\//i
const METAMASK_ERROR_PATTERN = /failed to connect to metamask/i

type BrowserErrorPayload = {
  message?: string
  filename?: string
  error?: unknown
  reason?: unknown
}

function toText(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value instanceof Error) {
    return [value.name, value.message, value.stack].filter(Boolean).join('\n')
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return [record.name, record.message, record.stack]
      .map(part => (typeof part === 'string' ? part : ''))
      .filter(Boolean)
      .join('\n')
  }
  return String(value)
}

export function shouldSuppressBrowserRuntimeError(
  payload: BrowserErrorPayload
): boolean {
  const haystack = [
    payload.message,
    payload.filename,
    toText(payload.error),
    toText(payload.reason),
  ]
    .filter(Boolean)
    .join('\n')

  return METAMASK_ERROR_PATTERN.test(haystack) || EXTENSION_URL_PATTERN.test(haystack)
}

export function installBrowserWarningSuppressions() {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const originalWarn = console.warn

  console.warn = (...args: unknown[]) => {
    const message = String(args[0] || '')

    // 忽略 React useFormState 重命名警告
    if (message.includes('useFormState has been renamed to React.useActionState')) {
      return
    }

    originalWarn.apply(console, args)
  }

  const handleError = (event: ErrorEvent) => {
    if (
      shouldSuppressBrowserRuntimeError({
        message: event.message,
        filename: event.filename,
        error: event.error,
      })
    ) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (shouldSuppressBrowserRuntimeError({ reason: event.reason })) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }

  window.addEventListener('error', handleError, true)
  window.addEventListener('unhandledrejection', handleUnhandledRejection, true)

  return () => {
    window.removeEventListener('error', handleError, true)
    window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
    console.warn = originalWarn
  }
}

export function getBrowserWarningSuppressorScript() {
  return `
    (function () {
      var extensionPattern = /(?:chrome|moz|safari-web|ms-browser)-extension:\\/\\//i;
      var metamaskPattern = /failed to connect to metamask/i;

      function toText(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (value instanceof Error) {
          return [value.name, value.message, value.stack].filter(Boolean).join('\\n');
        }
        if (typeof value === 'object') {
          var record = value;
          return [record.name, record.message, record.stack]
            .map(function (part) { return typeof part === 'string' ? part : ''; })
            .filter(Boolean)
            .join('\\n');
        }
        return String(value);
      }

      function shouldSuppress(payload) {
        var haystack = [
          payload.message,
          payload.filename,
          toText(payload.error),
          toText(payload.reason),
        ]
          .filter(Boolean)
          .join('\\n');

        return metamaskPattern.test(haystack) || extensionPattern.test(haystack);
      }

      function handleError(event) {
        if (
          shouldSuppress({
            message: event.message,
            filename: event.filename,
            error: event.error,
          })
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }

      function handleUnhandledRejection(event) {
        if (shouldSuppress({ reason: event.reason })) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }

      window.addEventListener('error', handleError, true);
      window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    })();
  `
}

export {}
