import { SCHOOL_CANDIDATES, type SchoolCandidate } from '@/data/schools'

function normalizeValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
}

function shouldSearchWithShortQuery(query: string) {
  return /[\u3400-\u9fff]/.test(query)
}

function buildSearchText(candidate: SchoolCandidate) {
  return [candidate.name, candidate.city, candidate.state, ...candidate.aliases]
    .join(' ')
    .trim()
}

function scoreText(source: string, query: string, baseScore: number) {
  if (!source) {
    return 0
  }

  if (source === query) {
    return baseScore + 90
  }

  if (source.startsWith(query)) {
    return baseScore + 60
  }

  if (source.includes(query)) {
    return baseScore + 30
  }

  return 0
}

export function searchSchools(query: string, limit = 8): SchoolCandidate[] {
  const normalizedQuery = normalizeValue(query)

  if (!normalizedQuery) {
    return []
  }

  if (!shouldSearchWithShortQuery(query) && normalizedQuery.length < 2) {
    return []
  }

  const scored = SCHOOL_CANDIDATES.map((candidate) => {
    const normalizedName = normalizeValue(candidate.name)
    const normalizedCity = normalizeValue(candidate.city)
    const normalizedState = normalizeValue(candidate.state)
    const normalizedAliases = candidate.aliases.map(normalizeValue)
    const normalizedSearchText = normalizeValue(buildSearchText(candidate))

    const scoreCandidates = [
      scoreText(normalizedName, normalizedQuery, 300),
      scoreText(normalizedCity, normalizedQuery, 240),
      scoreText(normalizedState, normalizedQuery, 120),
      ...normalizedAliases.map((alias) =>
        scoreText(alias, normalizedQuery, 180)
      ),
      scoreText(normalizedSearchText, normalizedQuery, 90),
    ]

    return {
      candidate,
      score: Math.max(...scoreCandidates),
    }
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score
      }

      return a.candidate.name.localeCompare(b.candidate.name, 'zh-Hans-CN')
    })

  return scored.slice(0, limit).map((item) => item.candidate)
}
