'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { GoalsForm } from "@/components/business/settings/GoalsForm"

interface GoalsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialTime?: string | null
}

export function GoalsDialog({ open, onOpenChange, onSuccess, initialTime }: GoalsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Your Learning Goals</DialogTitle>
          <DialogDescription>
            Commit to a schedule and focus area to maximize your growth.
          </DialogDescription>
        </DialogHeader>
        <GoalsForm 
          onSuccess={() => {
            onSuccess()
            onOpenChange(false)
          }} 
          initialTime={initialTime}
        />
      </DialogContent>
    </Dialog>
  )
}
