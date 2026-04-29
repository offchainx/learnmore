import { describe, expect, it } from 'vitest'

import { searchSchools } from '../schools'

describe('searchSchools', () => {
  it('supports Chinese character search', () => {
    const results = searchSchools('永')

    expect(results[0]?.name).toBe('永平中学')
    expect(results.map((school) => school.name)).toContain('永平中学')
  })

  it('supports Malay and romanized search', () => {
    const results = searchSchools('Yong')

    expect(results[0]?.name).toBe('永平中学')
    expect(results.map((school) => school.name)).toContain('永平中学')
  })

  it('supports city-based search for Malaysian Chinese independent schools', () => {
    const results = searchSchools('Kluang')

    expect(results.map((school) => school.name)).toContain('居銮中华中学')
  })

  it('returns an empty list for short latin queries', () => {
    expect(searchSchools('K')).toEqual([])
  })
})
