'use client'

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ProfileForm } from "@/components/business/settings/profile-form"
import type { User, UserSettings } from "@prisma/client"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User & { settings: UserSettings | null }
  onSuccess: () => void
}

export function ProfileDialog({ open, onOpenChange, user, onSuccess }: ProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
        {/* ProfileForm contains its own Card, so we remove padding/border from DialogContent */}
        <ProfileForm user={user} onSuccess={() => {
          onSuccess()
          onOpenChange(false)
        }} />
      </DialogContent>
    </Dialog>
  )
}
