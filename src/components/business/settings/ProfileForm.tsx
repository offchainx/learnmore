'use client'

import { useActionState, useEffect, useState } from 'react'
import { updateProfile, ProfileFormState } from '@/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AvatarUpload } from './AvatarUpload'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

interface ProfileFormProps {
  user: {
    id: string
    username: string | null
    email: string
    grade: number | null
    avatar: string | null
  }
}

const initialState: ProfileFormState = {}

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar)
  const { toast } = useToast()

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } else if (state.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      })
    }
  }, [state, toast])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Update your personal information and public profile.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          <input type="hidden" name="avatar" value={avatarUrl || ''} />
          
          <AvatarUpload 
            currentAvatar={avatarUrl} 
            username={user.username || user.email}
            onUpload={setAvatarUrl}
          />

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="Enter your username"
              defaultValue={user.username || ''}
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Select name="grade" defaultValue={user.grade?.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="Select your grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Grade 7</SelectItem>
                <SelectItem value="8">Grade 8</SelectItem>
                <SelectItem value="9">Grade 9</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
