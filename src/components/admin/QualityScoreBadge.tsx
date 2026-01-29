import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface QualityScoreBadgeProps {
  score: number | null
  className?: string
}

export function QualityScoreBadge({ score, className }: QualityScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <Badge variant="outline" className={cn("text-gray-500 border-gray-200", className)}>
        -
      </Badge>
    )
  }

  let color = "text-gray-700 border-gray-200"
  
  if (score >= 90) {
    color = "text-green-700 border-green-200 bg-green-50"
  } else if (score >= 80) {
    color = "text-blue-700 border-blue-200 bg-blue-50"
  } else if (score >= 60) {
    color = "text-yellow-700 border-yellow-200 bg-yellow-50"
  } else {
    color = "text-red-700 border-red-200 bg-red-50"
  }

  return (
    <Badge variant="outline" className={cn(color, className)}>
      {score.toFixed(1)}
    </Badge>
  )
}
