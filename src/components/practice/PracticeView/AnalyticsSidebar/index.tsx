import React from 'react'
import KnowledgeHive from '@/components/practice/analytics/KnowledgeHive'
import ExamForecast from '@/components/practice/analytics/ExamForecast'
import { WeaknessCard } from '@/components/practice/analytics/WeaknessCard'
import { pageSectionGapCompactClass } from '@/components/shared/pageSpacing'
import type {
  ChapterWithStats,
  ExamForecast as ExamForecastType,
  HiveNode,
} from '@/lib/practice/types'

interface PracticeCoachPanelProps {
  selectedSubjectId: string
  currentSubjectTitle: string
  chapters: ChapterWithStats[]
  knowledgeHive: HiveNode[]
  examForecast: ExamForecastType | null
  isLoading: boolean
  errorMessage: string | null
}

export const PracticeCoachPanel: React.FC<PracticeCoachPanelProps> = ({
  currentSubjectTitle,
  chapters,
  knowledgeHive,
  examForecast,
  isLoading,
  errorMessage,
}) => {
  return (
    <div className={`${pageSectionGapCompactClass} xl:sticky xl:top-2.5`}>
      <KnowledgeHive
        subjectName={currentSubjectTitle || undefined}
        nodes={knowledgeHive}
        loading={isLoading}
        error={errorMessage}
      />
      <ExamForecast
        forecast={examForecast}
        loading={isLoading}
        error={errorMessage}
      />
      <WeaknessCard chapters={chapters} />
    </div>
  )
}
