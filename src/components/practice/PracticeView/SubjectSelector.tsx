import React from 'react';
import { Calculator, Atom, FlaskConical, Languages, Dna, Landmark, Globe, Laptop, BookOpen } from 'lucide-react';
import type { DbSubject } from './types';

const iconMap: Record<string, React.ElementType> = {
  'Calculator': Calculator,
  'Atom': Atom,
  'FlaskConical': FlaskConical,
  'Dna': Dna,
  'BookOpen': Languages,
  'Landmark': Landmark,
  'Globe': Globe,
  'Laptop': Laptop
};

interface PracticeSubjectBarProps {
  subjects: DbSubject[];
  selectedSubjectId: string;
  onSelect: (id: string) => void;
}

export const PracticeSubjectBar: React.FC<PracticeSubjectBarProps> = ({ subjects, selectedSubjectId, onSelect }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
      {subjects.map((sub) => {
        const Icon = iconMap[sub.icon as string] || BookOpen;
        const isActive = selectedSubjectId === sub.id;

        return (
          <button
            key={sub.id}
            onClick={() => onSelect(sub.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border whitespace-nowrap ${
              isActive
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-md transform scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-black' : ''}`} />
            <span className="text-sm font-bold">{sub.name.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
};
