import React from 'react'
import {
  Atom,
  BookOpen,
  Calculator,
  Dna,
  FlaskConical,
  Globe,
  Landmark,
  Languages,
  Laptop,
  Shapes,
} from 'lucide-react'
import type { DbSubject } from './types'
import { useApp } from '@/providers'
import { getSubjectLabel, resolveSubjectKeyFromName } from '@/lib/subjects'

const iconMap: Record<string, React.ElementType> = {
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  BookOpen: Languages,
  Landmark,
  Globe,
  Laptop,
  Shapes,
}

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

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
      {subjects.map((subject) => {
        const subjectKey = subject.key || resolveSubjectKeyFromName(subject.name) || 'other'
        const label = getSubjectLabel(subjectKey, lang, subject.name)
        const Icon = iconMap[subject.icon as string] || BookOpen
        const isActive = selectedSubjectId === subject.id

        return (
          <button
            key={subject.id}
            onClick={() => onSelect(subject.id)}
            className={`flex min-h-[42px] items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 transition-all duration-300 ${
              isActive
                ? 'scale-[1.01] border-borderTone bg-surface-selected text-primary shadow-[0_10px_24px_rgba(59,130,246,0.10),inset_0_1px_0_rgba(255,255,255,0.75)] dark:border-borderTone dark:bg-surface-selected dark:text-primary'
                : 'border-borderTone bg-surface text-text-secondary shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-[hsl(var(--border-strong))] hover:bg-surface-subtle hover:text-text-primary dark:border-borderTone dark:bg-surface-subtle dark:text-text-secondary dark:hover:bg-surface-selected dark:hover:text-text-primary'
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? 'text-primary dark:text-primary' : 'text-text-tertiary dark:text-text-tertiary'}`} />
            <span className="text-sm font-bold">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
