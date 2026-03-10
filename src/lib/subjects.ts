export type UiLang = 'zh' | 'en' | 'ms'

export const SUBJECT_KEYS = [
  'chinese',
  'malay',
  'english',
  'math',
  'science',
  'history',
  'geography',
  'other',
] as const

export type SubjectKey = (typeof SUBJECT_KEYS)[number]

export interface SubjectDefinition {
  key: SubjectKey
  canonicalName: string
  order: number
  icon: string
  aliases: string[]
  labels: Record<UiLang, string>
}

export const SUBJECT_DEFINITIONS: SubjectDefinition[] = [
  {
    key: 'chinese',
    canonicalName: '中文',
    order: 10,
    icon: 'BookOpen',
    aliases: ['中文', '华文', 'chinese', 'mandarin', 'bahasa cina'],
    labels: { zh: '中文', en: 'Chinese', ms: 'Bahasa Cina' },
  },
  {
    key: 'malay',
    canonicalName: '马来西亚文',
    order: 20,
    icon: 'Languages',
    aliases: ['马来西亚文', '马来文', 'malay', 'bahasa melayu', 'melayu'],
    labels: { zh: '马来西亚文', en: 'Malay', ms: 'Bahasa Melayu' },
  },
  {
    key: 'english',
    canonicalName: '英文',
    order: 30,
    icon: 'Languages',
    aliases: ['英文', '英语', 'english', 'bahasa inggeris'],
    labels: { zh: '英文', en: 'English', ms: 'Bahasa Inggeris' },
  },
  {
    key: 'math',
    canonicalName: '数学',
    order: 40,
    icon: 'Calculator',
    aliases: ['数学', 'math', 'mathematics', 'matematik'],
    labels: { zh: '数学', en: 'Mathematics', ms: 'Matematik' },
  },
  {
    key: 'science',
    canonicalName: '科学',
    order: 50,
    icon: 'Atom',
    aliases: ['科学', 'science', 'sains', 'physics', 'chemistry', 'biology'],
    labels: { zh: '科学', en: 'Science', ms: 'Sains' },
  },
  {
    key: 'history',
    canonicalName: '历史',
    order: 60,
    icon: 'Landmark',
    aliases: ['历史', 'history', 'sejarah'],
    labels: { zh: '历史', en: 'History', ms: 'Sejarah' },
  },
  {
    key: 'geography',
    canonicalName: '地理',
    order: 70,
    icon: 'Globe',
    aliases: ['地理', 'geography', 'geografi'],
    labels: { zh: '地理', en: 'Geography', ms: 'Geografi' },
  },
  {
    key: 'other',
    canonicalName: '其他',
    order: 80,
    icon: 'Shapes',
    aliases: ['其他', 'other', 'lain-lain', 'general', 'misc', 'computer science'],
    labels: { zh: '其他', en: 'Other', ms: 'Lain-lain' },
  },
]

const SUBJECT_DEFINITION_MAP = new Map<SubjectKey, SubjectDefinition>(
  SUBJECT_DEFINITIONS.map((subject) => [subject.key, subject]),
)

export function normalizeSubjectText(value: string): string {
  return value.toLowerCase().replace(/[\s\-_./()]/g, '')
}

export function resolveSubjectKeyFromName(name: string | null | undefined): SubjectKey | null {
  if (!name) return null
  const normalized = normalizeSubjectText(name)
  for (const subject of SUBJECT_DEFINITIONS) {
    if (subject.aliases.some((alias) => normalizeSubjectText(alias) === normalized || normalized.includes(normalizeSubjectText(alias)))) {
      return subject.key
    }
  }
  return null
}

export function getSubjectDefinition(key: string | null | undefined): SubjectDefinition | null {
  if (!key) return null
  return SUBJECT_DEFINITION_MAP.get(key as SubjectKey) ?? null
}

export function getSubjectLabel(key: string | null | undefined, lang: UiLang, fallback = 'Unknown'): string {
  const subject = getSubjectDefinition(key)
  if (!subject) return fallback
  return subject.labels[lang]
}
