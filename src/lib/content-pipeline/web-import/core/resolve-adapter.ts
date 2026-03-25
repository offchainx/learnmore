import type { ResolveWebImportAdapterResult, WebImportAdapter } from '../types'
import { WEB_IMPORT_ADAPTERS } from '../adapters'

export async function resolveWebImportAdapter(
  pageUrl: string,
  adapters: WebImportAdapter[] = WEB_IMPORT_ADAPTERS
): Promise<ResolveWebImportAdapterResult> {
  for (const adapter of adapters) {
    if (await adapter.detect(pageUrl)) {
      return {
        success: true,
        data: adapter,
      }
    }
  }

  return {
    success: false,
    error: `当前没有可处理该链接的网页导入适配器: ${pageUrl}`,
    code: 'UNSUPPORTED_WEB_IMPORT_URL',
  }
}
