import { getProfile } from '@/actions/profile'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/business/settings/profile-form'
import { AiConfigForm } from '@/components/business/settings/ai-config-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function SettingsPage() {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }

  // We can still fetch settings if needed for the AI config specifically, 
  // although profile now includes settings. 
  // For safety and type matching, let's keep using getUserSettings for the isolated form if preferred,
  // or just use profile.settings.
  // The AiConfigForm expects "UserSettings | null".
  // Let's stick to passing profile.settings to AiConfigForm (but we need to verify the type match).
  // profile.settings might be null if not created, so it matches.

  return (
    <div className="container py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile & Preferences</TabsTrigger>
          <TabsTrigger value="ai-config">AI Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <ProfileForm user={profile} />
        </TabsContent>
        
        <TabsContent value="ai-config">
          <AiConfigForm settings={profile.settings} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
