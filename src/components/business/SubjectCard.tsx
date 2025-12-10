import React from 'react';
import { Card } from '@/components/ui/card'; // Using our Shadcn Card
import { BookOpen } from 'lucide-react'; // Placeholder, actual icon passed as prop

interface SubjectCardProps {
  name: string;
  icon: React.ElementType; // Use React.ElementType for Lucide icons
  color: string;
  bgGradient: string;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ name, icon: Icon, color, bgGradient }) => (
  <Card className="border-none bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-[#161616] hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden h-32 flex flex-col justify-between p-5 shadow-sm hover:shadow-lg dark:shadow-black/50 border border-slate-200 dark:border-transparent">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${bgGradient} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`} />
    <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center ${color} ring-1 ring-slate-200 dark:ring-white/5 group-hover:ring-slate-300 dark:group-hover:ring-white/10 transition-all`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">{name}</h3>
      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        85% Complete {/* Placeholder text */}
      </p>
    </div>
  </Card>
);

export default SubjectCard;
