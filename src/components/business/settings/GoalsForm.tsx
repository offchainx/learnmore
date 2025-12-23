'use client'

import { useActionState, useEffect } from 'react'
import { updateGoals, SettingsFormState } from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// Card components available if needed for styling
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Clock, Target } from 'lucide-react'

interface GoalsFormProps {
  onSuccess?: () => void
  initialTime?: string | null
}

const initialState: SettingsFormState = {}

export function GoalsForm({ onSuccess, initialTime }: GoalsFormProps) {
  const [state, formAction, isPending] = useActionState(updateGoals, initialState)
  const { toast } = useToast()

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Goals Set!",
        description: "Your learning schedule is ready.",
      })
      if (onSuccess) {
        onSuccess()
      }
    } else if (state.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      })
    }
  }, [state, toast, onSuccess])

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="studyReminderTime" className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            Daily Study Time
          </Label>
          <Select name="studyReminderTime" defaultValue={initialTime || "20:00"}>
            <SelectTrigger>
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="18:00">6:00 PM (After School)</SelectItem>
              <SelectItem value="19:00">7:00 PM (Before Dinner)</SelectItem>
              <SelectItem value="20:00">8:00 PM (Evening)</SelectItem>
              <SelectItem value="21:00">9:00 PM (Late Night)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">We&apos;ll send you a gentle reminder.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetSubject" className="flex items-center gap-2">
            <Target className="w-4 h-4 text-red-500" />
            Focus Subject
          </Label>
          <Select name="targetSubject" defaultValue="Math">
            <SelectTrigger>
              <SelectValue placeholder="Select your weakest subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Physics">Physics</SelectItem>
              <SelectItem value="Chemistry">Chemistry</SelectItem>
              <SelectItem value="Biology">Biology</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="History">History</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">We&apos;ll prioritize content for this subject.</p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Set Goals & Earn XP"}
      </Button>
    </form>
  )
}
