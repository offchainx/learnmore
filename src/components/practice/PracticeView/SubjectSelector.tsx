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
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
      {subjects.map((subject) => {
        const subjectKey = subject.key || resolveSubjectKeyFromName(subject.name) || 'other'
        const label = getSubjectLabel(subjectKey, lang, subject.name)
        const Icon = iconMap[subject.icon as string] || BookOpen
        const isActive = selectedSubjectId === subject.id

        return (
          <button
            key={subject.id}
            onClick={() => onSelect(subject.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border whitespace-nowrap ${
              isActive
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-md transform scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-black' : ''}`} />
            <span className="text-sm font-bold">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
