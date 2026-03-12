export type PracticeModeTheme = 'cyan' | 'rose' | 'amber' | 'indigo' | 'slate'

export const practiceThemeStyles: Record<
  PracticeModeTheme,
  {
    shell: string
    badge: string
    iconWrap: string
    icon: string
    panelLabel: string
    primaryButton: string
  }
> = {
  cyan: {
    shell:
      'bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,_#0f172a,_#111827_58%,_#0b1220)] text-white',
    badge: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
    iconWrap: 'bg-cyan-400/12 text-cyan-200 border-cyan-400/20',
    icon: 'text-cyan-300',
    panelLabel: 'text-cyan-300/80',
    primaryButton: 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
  },
  rose: {
    shell:
      'bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.16),_transparent_28%),linear-gradient(135deg,_#0f172a,_#111827_58%,_#120d12)] text-white',
    badge: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
    iconWrap: 'bg-rose-400/12 text-rose-200 border-rose-400/20',
    icon: 'text-rose-300',
    panelLabel: 'text-rose-300/80',
    primaryButton: 'bg-rose-400 text-slate-950 hover:bg-rose-300',
  },
  amber: {
    shell:
      'bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),linear-gradient(135deg,_#111827,_#16131b_58%,_#0b1220)] text-white',
    badge: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
    iconWrap: 'bg-amber-400/12 text-amber-100 border-amber-400/20',
    icon: 'text-amber-300',
    panelLabel: 'text-amber-200/80',
    primaryButton: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
  },
  indigo: {
    shell:
      'bg-[radial-gradient(circle_at_top_left,_rgba(129,140,248,0.18),_transparent_28%),linear-gradient(135deg,_#111827,_#141b33_58%,_#0b1220)] text-white',
    badge: 'border-indigo-400/20 bg-indigo-400/10 text-indigo-100',
    iconWrap: 'bg-indigo-400/12 text-indigo-100 border-indigo-400/20',
    icon: 'text-indigo-300',
    panelLabel: 'text-indigo-200/80',
    primaryButton: 'bg-indigo-400 text-slate-950 hover:bg-indigo-300',
  },
  slate: {
    shell:
      'bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.12),_transparent_28%),linear-gradient(135deg,_#0f172a,_#111827_58%,_#020617)] text-white',
    badge: 'border-slate-400/20 bg-slate-400/10 text-slate-200',
    iconWrap: 'bg-slate-400/12 text-slate-100 border-slate-400/20',
    icon: 'text-slate-300',
    panelLabel: 'text-slate-300/80',
    primaryButton: 'bg-white text-slate-950 hover:bg-slate-100',
  },
}
