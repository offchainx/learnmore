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
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import type { User, UserSettings } from '@prisma/client'

interface ProfileFormProps {
  user: User & { settings: UserSettings | null }
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
        <CardTitle>Profile & Preferences</CardTitle>
        <CardDescription>
          Manage your personal information and application preferences.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-8">
          
          {/* Section: Public Profile */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Public Profile</h3>
            <input type="hidden" name="avatar" value={avatarUrl || ''} />
            
            <AvatarUpload 
              currentAvatar={avatarUrl} 
              username={user.username || user.email || 'User'}
              onUpload={setAvatarUrl}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
             <h3 className="text-lg font-medium">App Preferences</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select name="language" defaultValue={user.settings?.language || 'en'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">中文 (Chinese)</SelectItem>
                    <SelectItem value="ms">Bahasa Melayu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select name="theme" defaultValue={user.settings?.theme || 'system'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
             </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notificationDaily" className="flex flex-col space-y-1">
                  <span>Daily Reminders</span>
                  <span className="font-normal text-xs text-muted-foreground">Receive daily reminders to maintain your streak.</span>
                </Label>
                <Switch 
                    id="notificationDaily" 
                    name="notificationDaily" 
                    defaultChecked={user.settings?.notificationDaily ?? true} 
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="notificationWeekly" className="flex flex-col space-y-1">
                  <span>Weekly Report</span>
                  <span className="font-normal text-xs text-muted-foreground">Receive a summary of your weekly progress.</span>
                </Label>
                <Switch 
                    id="notificationWeekly" 
                    name="notificationWeekly" 
                    defaultChecked={user.settings?.notificationWeekly ?? true} 
                />
              </div>
            </div>
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
