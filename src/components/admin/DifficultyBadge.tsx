import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DifficultyBadgeProps {
  difficulty: number
  className?: string
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  let color = "bg-gray-500"
  let label = "未知"

  if (difficulty >= 1 && difficulty <= 2) {
    color = "bg-green-500 hover:bg-green-600"
    label = "简单"
  } else if (difficulty === 3) {
    color = "bg-blue-500 hover:bg-blue-600"
    label = "中等"
  } else if (difficulty >= 4 && difficulty <= 5) {
    color = "bg-orange-500 hover:bg-orange-600"
    label = "困难"
  }

  return (
    <Badge className={cn(color, "text-white", className)}>
      L{difficulty} {label}
    </Badge>
  )
}
