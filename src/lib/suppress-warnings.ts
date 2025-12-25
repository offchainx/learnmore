/**
 * 警告抑制工具
 * 用于过滤掉已知的、不影响功能的框架警告
 *
 * ⚠️ 仅在开发环境使用，生产环境会被 removeConsole 配置自动移除
 */

if (typeof window !== 'undefined') {
  const originalWarn = console.warn

  console.warn = (...args: unknown[]) => {
    const message = String(args[0] || '')

    // 忽略 React useFormState 重命名警告
    if (message.includes('useFormState has been renamed to React.useActionState')) {
      return
    }

    // 保留其他所有警告
    originalWarn.apply(console, args)
  }
}

export {}
