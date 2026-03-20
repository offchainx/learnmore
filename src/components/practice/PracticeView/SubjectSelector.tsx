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
                ? 'scale-[1.01] border-blue-300 bg-[linear-gradient(180deg,#f8fbff_0%,#e8f1ff_100%)] text-blue-800 shadow-[0_10px_24px_rgba(59,130,246,0.10),inset_0_1px_0_rgba(255,255,255,0.75)] dark:border-transparent dark:bg-white dark:text-slate-950'
                : 'border-slate-200/80 bg-white/92 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-slate-300 hover:bg-white hover:text-slate-700 dark:border-slate-700/50 dark:bg-slate-800/90 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? 'text-blue-700 dark:text-slate-950' : 'text-slate-400 dark:text-slate-500'}`} />
            <span className="text-sm font-bold">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
