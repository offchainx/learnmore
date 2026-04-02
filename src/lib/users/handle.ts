export const DEFAULT_RESERVED_HANDLES = [
  'admin',
  'administrator',
  'ads',
  'api',
  'apple',
  'auth',
  'billing',
  'blog',
  'ceo',
  'contact',
  'community',
  'courses',
  'dashboard',
  'dev',
  'docs',
  'elonmusk',
  'explore',
  'feed',
  'founder',
  'founders',
  'google',
  'helpdesk',
  'home',
  'human',
  'ig',
  'help',
  'instagram',
  'jobs',
  'legal',
  'learnmore',
  'mail',
  'meta',
  'mod',
  'login',
  'logout',
  'moderator',
  'notifications',
  'official',
  'owner',
  'payments',
  'practice',
  'press',
  'pricing',
  'privacy',
  'profile',
  'register',
  'root',
  'settings',
  'shop',
  'signin',
  'signup',
  'staff',
  'status',
  'root',
  'support',
  'team',
  'terms',
  'threads',
  'today',
  'upgrade',
  'user',
  'users',
  'verify',
  'system',
  'teacher',
  'teachers',
  'test',
  'x',
  'youtube',
  'vercel',
]

const RESERVED_HANDLES = new Set(DEFAULT_RESERVED_HANDLES)

const HANDLE_PATTERN = /^[a-z](?:[a-z._]{4,18}[a-z])?$/
const REPEATED_SEPARATOR_PATTERN = /[._]{2,}/
const CONTENT_HANDLE_PATTERN = /(^|[\s(>])@([a-z][a-z._]{4,18}[a-z])/gi

export function normalizeHandle(value: string): string {
  return value.trim().replace(/^@+/, '').toLowerCase()
}

export function validateHandle(value: string): string | null {
  const normalized = normalizeHandle(value)

  if (!normalized) {
    return '请输入账号标识'
  }

  if (normalized.length < 6 || normalized.length > 20) {
    return '账号标识长度需为 6-20 个字符'
  }

  if (/\d/.test(normalized)) {
    return '账号标识不能包含数字'
  }

  if (!HANDLE_PATTERN.test(normalized)) {
    return '账号标识仅支持小写字母、句点和下划线，且不能以符号开头或结尾'
  }

  if (REPEATED_SEPARATOR_PATTERN.test(normalized)) {
    return '账号标识不能包含连续符号'
  }

  if (RESERVED_HANDLES.has(normalized)) {
    return '该账号标识为保留字段，暂不可申请'
  }

  return null
}

export function isHandleReserved(value: string): boolean {
  return RESERVED_HANDLES.has(normalizeHandle(value))
}

export function uniqueHandles(handles: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  handles.forEach((value) => {
    const normalized = normalizeHandle(value)
    if (!normalized || seen.has(normalized)) return
    seen.add(normalized)
    result.push(normalized)
  })

  return result
}

export function extractMentionHandlesFromText(content: string): string[] {
  const matches: string[] = []
  for (const match of content.matchAll(CONTENT_HANDLE_PATTERN)) {
    if (match[2]) {
      matches.push(match[2])
    }
  }
  return uniqueHandles(matches)
}
