'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { updateAIConfig } from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import type { UserSettings } from '@prisma/client'
import { useState } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving...' : 'Save AI Configuration'}
    </Button>
  )
}

interface AiConfigFormProps {
  settings: UserSettings | null
}

export function AiConfigForm({ settings }: AiConfigFormProps) {
  const [state, formAction] = useFormState(updateAIConfig, {})
  const [difficulty, setDifficulty] = useState(settings?.difficultyCalibration || 50)

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
        <CardDescription>
          Customize how the AI tutor interacts with you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="aiPersonality">AI Personality</Label>
            <Select name="aiPersonality" defaultValue={settings?.aiPersonality || 'ENCOURAGING'}>
              <SelectTrigger>
                <SelectValue placeholder="Select a personality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENCOURAGING">Encouraging (Default)</SelectItem>
                <SelectItem value="SOCRATIC">Socratic (Questions over answers)</SelectItem>
                <SelectItem value="STRICT">Strict (High standards)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Determines the tone and style of AI responses.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label htmlFor="difficultyCalibration">Difficulty Calibration</Label>
              <span className="text-sm text-muted-foreground">{difficulty}/100</span>
            </div>
            <input type="hidden" name="difficultyCalibration" value={difficulty} />
            <Slider 
              defaultValue={[difficulty]} 
              max={100} 
              step={1} 
              onValueChange={(val) => setDifficulty(val[0])}
            />
             <p className="text-sm text-muted-foreground">
              Adjusts the complexity of generated questions and explanations.
            </p>
          </div>

          {state.error && (
            <div className="text-sm text-red-500">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="text-sm text-green-500">
              AI settings updated successfully!
            </div>
          )}

          <div className="pt-4">
             <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
