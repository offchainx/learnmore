import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface QualityScoreBadgeProps {
  score: number | null
  className?: string
}

export function QualityScoreBadge({ score, className }: QualityScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-borderTone bg-surface-subtle text-text-tertiary dark:border-borderTone dark:bg-surface-subtle dark:text-text-tertiary',
          className
        )}
      >
        -
      </Badge>
    )
  }

  let color =
    'border-borderTone bg-surface-subtle text-text-secondary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary'
  
  if (score >= 90) {
    color =
      'border-borderTone bg-[hsl(var(--state-success-bg))] text-[hsl(var(--state-success-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-success-bg))] dark:text-[hsl(var(--state-success-fg))]'
  } else if (score >= 80) {
    color =
      'border-borderTone bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))] dark:text-[hsl(var(--state-info-fg))]'
  } else if (score >= 60) {
    color =
      'border-borderTone bg-[hsl(var(--state-warning-bg))] text-[hsl(var(--state-warning-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-warning-bg))] dark:text-[hsl(var(--state-warning-fg))]'
  } else {
    color =
      'border-borderTone bg-[hsl(var(--state-danger-bg))] text-[hsl(var(--state-danger-fg))] dark:border-borderTone dark:bg-[hsl(var(--state-danger-bg))] dark:text-[hsl(var(--state-danger-fg))]'
  }

  return (
    <Badge variant="outline" className={cn(color, className)}>
      {score.toFixed(1)}
    </Badge>
  )
}
