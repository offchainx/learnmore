const SETTINGS_NOTIFICATIONS_PATH = '/dashboard/settings?tab=notifications'
const SETTINGS_SUBSCRIPTION_PATH = '/dashboard/settings?tab=subscription'
const HELP_PATH = '/help'

export function normalizeNotificationLink(link?: string | null): string | null {
  if (!link) {
    return null
  }

  if (link === '/dashboard/settings/notifications') {
    return SETTINGS_NOTIFICATIONS_PATH
  }

  if (
    link === '/dashboard/settings/billing' ||
    link === '/dashboard/settings/subscription' ||
    link === '/dashboard/settings?tab=billing'
  ) {
    return SETTINGS_SUBSCRIPTION_PATH
  }

  if (
    link === '/dashboard/settings/feedback' ||
    link === '/dashboard/settings?tab=feedback'
  ) {
    return HELP_PATH
  }

  return link
}
