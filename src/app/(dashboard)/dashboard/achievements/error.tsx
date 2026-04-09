'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, House, RefreshCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PageEmptyState } from '@/components/shared/PageEmptyState'
import {
  pageSectionGapClass,
} from '@/components/shared/pageSpacing'
import { pageShellFrameClass } from '@/components/shared/pageSurfaces'

export default function AchievementsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[dashboard/achievements] route error', error)
  }, [error])

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className={`${pageShellFrameClass} ${pageSectionGapClass} sm:p-2.5`}>
        <div className="flex min-h-[52vh] items-center justify-center">
          <PageEmptyState
            icon={AlertCircle}
            title="成就页暂时无法加载"
            description="可能是数据请求失败、网络波动或缓存刷新异常。你可以重试，或者先返回仪表盘继续使用其它功能。"
            actions={
              <>
                <Button onClick={reset} variant="primary" className="min-w-28">
                  <RefreshCcw className="h-4 w-4" />
                  重试
                </Button>
                <Button asChild variant="outline" className="min-w-28">
                  <Link href="/dashboard">
                    <House className="h-4 w-4" />
                    返回仪表盘
                  </Link>
                </Button>
              </>
            }
            className="w-full max-w-[720px]"
            iconContainerClassName="bg-surface"
          />
        </div>
      </div>
    </div>
  )
}
