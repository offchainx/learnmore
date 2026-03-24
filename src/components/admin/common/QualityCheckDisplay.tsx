import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'
import type { QualityCheckResult, QualityIssue } from '@/lib/content-pipeline/types'
import { cn } from '@/lib/utils'

interface QualityCheckDisplayProps {
  result: QualityCheckResult
  className?: string
}

export function QualityCheckDisplay({ result, className }: QualityCheckDisplayProps) {
  const { score, issues } = result

  // 根据分数确定颜色
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-[hsl(var(--state-success-fg))]'
    if (score >= 70) return 'text-[hsl(var(--state-warning-fg))]'
    return 'text-[hsl(var(--state-danger-fg))]'
  }

  // 根据分数确定进度条颜色类名
  const getProgressColorClass = (score: number) => {
    if (score >= 90) return 'bg-[hsl(var(--state-success-fg))]'
    if (score >= 70) return 'bg-[hsl(var(--state-warning-fg))]'
    return 'bg-[hsl(var(--state-danger-fg))]'
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">质量评分</span>
          <span className={cn("text-lg font-bold", getScoreColor(score))}>
            {score}/100
          </span>
        </div>
        <Progress value={score} className="h-2" indicatorClassName={getProgressColorClass(score)} />
      </div>

      <div className="space-y-3 pt-2">
        {issues.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md border border-borderTone bg-[hsl(var(--state-success-bg))] p-3 text-sm text-[hsl(var(--state-success-fg))]">
            <CheckCircle className="h-4 w-4" />
            <span>完美！未发现质量问题。</span>
          </div>
        ) : (
          issues.map((issue, index) => (
            <IssueItem key={index} issue={issue} />
          ))
        )}
      </div>
    </div>
  )
}

function IssueItem({ issue }: { issue: QualityIssue }) {
  const icons = {
    ERROR: XCircle,
    WARNING: AlertCircle,
    INFO: Info
  }

  const styles = {
    ERROR:
      'border-borderTone bg-[hsl(var(--state-danger-bg))] text-[hsl(var(--state-danger-fg))]',
    WARNING:
      'border-borderTone bg-[hsl(var(--state-warning-bg))] text-[hsl(var(--state-warning-fg))]',
    INFO:
      'border-borderTone bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))]',
  }

  const Icon = icons[issue.type]

  return (
    <div className={cn(
      "flex items-start gap-2 p-3 rounded-md border text-sm",
      styles[issue.type]
    )}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="flex-1">
        <div className="font-medium text-xs uppercase tracking-wider opacity-80 mb-0.5">
          {issue.category}
        </div>
        <div>{issue.message}</div>
      </div>
    </div>
  )
}
