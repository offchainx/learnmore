import React, { useMemo } from 'react'
import type { DbSubject } from './types'
import { useApp } from '@/providers'
import {
  getSubjectIconComponent,
  getSubjectLabel,
  resolveSubjectKeyFromName,
} from '@/lib/subjects'
import {
  SubjectSelectorSection,
  type SubjectSelectorItem,
} from '@/components/shared/SubjectSelectorSection'

interface PracticeSubjectBarProps {
  subjects: DbSubject[]
  selectedSubjectId: string
  onSelect: (id: string) => void
}

export const PracticeSubjectBar: React.FC<PracticeSubjectBarProps> = ({
  subjects,
  selectedSubjectId,
  onSelect,
}) => {
  const { lang } = useApp()
  const subjectItems = useMemo<SubjectSelectorItem[]>(
    () =>
      subjects.map((subject) => {
        const subjectKey =
          subject.key || resolveSubjectKeyFromName(subject.name) || 'other'
        const label = getSubjectLabel(subjectKey, lang, subject.name)
        const Icon = getSubjectIconComponent(subjectKey)

        return {
          id: subject.id,
          label,
          icon: Icon,
        }
      }),
    [lang, subjects]
  )

  return (
    <SubjectSelectorSection
      items={subjectItems}
      selectedId={selectedSubjectId}
      onSelect={onSelect}
      layoutAnchorId="practice-subject-selector"
    />
  )
}
