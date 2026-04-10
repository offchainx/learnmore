import { describe, expect, it } from 'vitest'

import { normalizeNotificationLink } from '../links'

describe('normalizeNotificationLink', () => {
  it('maps legacy notification settings route to canonical notifications tab', () => {
    expect(normalizeNotificationLink('/dashboard/settings/notifications')).toBe(
      '/dashboard/settings?tab=notifications'
    )
  })

  it('maps legacy billing settings route to subscription tab', () => {
    expect(normalizeNotificationLink('/dashboard/settings/billing')).toBe(
      '/dashboard/settings?tab=subscription'
    )
    expect(normalizeNotificationLink('/dashboard/settings?tab=billing')).toBe(
      '/dashboard/settings?tab=subscription'
    )
  })

  it('maps legacy feedback settings route to help page', () => {
    expect(normalizeNotificationLink('/dashboard/settings?tab=feedback')).toBe(
      '/help'
    )
  })

  it('returns nullish and valid links unchanged', () => {
    expect(normalizeNotificationLink(null)).toBeNull()
    expect(normalizeNotificationLink('/dashboard/community/post-1')).toBe(
      '/dashboard/community/post-1'
    )
  })
})
