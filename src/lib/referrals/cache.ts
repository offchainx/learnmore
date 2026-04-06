import { revalidatePath } from 'next/cache'

export function invalidateReferralReadViews(input?: {
  userId?: string | null
  relatedUserId?: string | null
}) {
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
  revalidatePath('/admin/referrals')
  revalidatePath('/admin/users')

  if (input?.userId) {
    revalidatePath(`/admin/users/${input.userId}`)
  }

  if (input?.relatedUserId) {
    revalidatePath(`/admin/users/${input.relatedUserId}`)
  }
}
