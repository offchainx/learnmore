import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DifficultyBadgeProps {
  difficulty: number
  className?: string
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  let color =
    'border-borderTone bg-surface-subtle text-text-secondary hover:bg-surface-subtle dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary'
  let label = "未知"

  if (difficulty >= 1 && difficulty <= 2) {
    color =
      'border-borderTone bg-[hsl(var(--state-success-bg))] text-[hsl(var(--state-success-fg))] hover:bg-[hsl(var(--state-success-bg))] dark:border-borderTone dark:bg-[hsl(var(--state-success-bg))] dark:text-[hsl(var(--state-success-fg))]'
    label = "简单"
  } else if (difficulty === 3) {
    color =
      'border-borderTone bg-[hsl(var(--state-info-bg))] text-[hsl(var(--state-info-fg))] hover:bg-[hsl(var(--state-info-bg))] dark:border-borderTone dark:bg-[hsl(var(--state-info-bg))] dark:text-[hsl(var(--state-info-fg))]'
    label = "中等"
  } else if (difficulty >= 4 && difficulty <= 5) {
    color =
      'border-borderTone bg-[hsl(var(--state-warning-bg))] text-[hsl(var(--state-warning-fg))] hover:bg-[hsl(var(--state-warning-bg))] dark:border-borderTone dark:bg-[hsl(var(--state-warning-bg))] dark:text-[hsl(var(--state-warning-fg))]'
    label = "困难"
  }

  return (
    <Badge className={cn(color, className)}>
      L{difficulty} {label}
    </Badge>
  )
}
