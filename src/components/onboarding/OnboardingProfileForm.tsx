'use client'

import { useActionState, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

import {
  completeOnboardingProfile,
  type OnboardingProfileFormState,
} from '@/actions/user/onboarding'
import { AvatarUpload } from '@/components/business/settings/AvatarUpload'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { OnboardingDashboardPreview } from './OnboardingDashboardPreview'
import { OnboardingProgress } from './OnboardingProgress'
import { SchoolCombobox } from './SchoolCombobox'

type OnboardingProfileFormProps = {
  displayName?: string | null
  school?: string | null
  grade?: number | null
  avatar?: string | null
  usernameFallback?: string | null
}

const initialState: OnboardingProfileFormState = {}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="h-12 w-full rounded-[12px] !bg-[#111111] !text-white shadow-none hover:!bg-[#1b1b1b]"
      isLoading={pending}
      loadingText="保存中..."
    >
      完成资料
    </Button>
  )
}

export function OnboardingProfileForm({
  displayName: initialDisplayName = '',
  school: initialSchool = '',
  grade: initialGrade = null,
  avatar: initialAvatar = null,
  usernameFallback = 'User',
}: OnboardingProfileFormProps) {
  const [state, formAction] = useActionState(
    completeOnboardingProfile,
    initialState
  )
  const [displayName, setDisplayName] = useState(initialDisplayName || '')
  const [school, setSchool] = useState(initialSchool || '')
  const [grade, setGrade] = useState(initialGrade?.toString() || '')
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar)

  useEffect(() => {
    setDisplayName(initialDisplayName || '')
  }, [initialDisplayName])

  useEffect(() => {
    setSchool(initialSchool || '')
  }, [initialSchool])

  useEffect(() => {
    setGrade(initialGrade?.toString() || '')
  }, [initialGrade])

  useEffect(() => {
    setAvatarUrl(initialAvatar)
  }, [initialAvatar])

  const previewGrade = grade || '-'
  const previewName = displayName.trim() || usernameFallback || 'User'

  return (
    <div className="w-full max-w-6xl">
      <div className="mb-5">
        <OnboardingProgress current={2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white text-slate-900 shadow-[0_24px_80px_-34px_rgba(15,23,42,0.18)]">
          <CardHeader className="space-y-3 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
              <div className="flex size-8 items-center justify-center rounded-[10px] border border-slate-200 bg-slate-50">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-slate-700">
                  2
                </span>
              </div>
              LearnMore
            </div>
            <div className="space-y-2">
              <CardTitle className="text-balance text-3xl font-semibold tracking-tight text-slate-950">
                完成你的学习档案
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-500">
                填完后就会进入 dashboard。我们只需要姓名、学校、年级和头像。
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-6 sm:px-8">
            <form action={formAction} className="space-y-6">
              <input type="hidden" name="avatar" value={avatarUrl || ''} />

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="displayName"
                    className="text-sm font-medium text-slate-900"
                  >
                    姓名
                  </Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="你的姓名"
                    autoComplete="name"
                    className="h-12 rounded-[12px] border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:bg-white focus-visible:ring-slate-300"
                  />
                  <p className="text-xs leading-5 text-slate-500">
                    会显示在 dashboard、进度卡片和提醒里。
                  </p>
                </div>

                <SchoolCombobox value={school} onChange={setSchool} />

                <div className="space-y-2">
                  <Label
                    htmlFor="grade"
                    className="text-sm font-medium text-slate-900"
                  >
                    年级
                  </Label>
                  <Select value={grade} onValueChange={setGrade} name="grade">
                    <SelectTrigger
                      id="grade"
                      className="h-12 rounded-[12px] border-slate-200 bg-white text-slate-900"
                    >
                      <SelectValue placeholder="选择年级" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Grade 7</SelectItem>
                      <SelectItem value="8">Grade 8</SelectItem>
                      <SelectItem value="9">Grade 9</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs leading-5 text-slate-500">
                    我们用年级来分组推荐内容和学习视图。
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-200/70 pt-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900">
                    头像
                  </Label>
                  <p className="text-xs leading-5 text-slate-500">
                    可选。现在上传，或者先跳过，之后再在设置里补。
                  </p>
                  <AvatarUpload
                    currentAvatar={avatarUrl}
                    username={previewName}
                    onUpload={setAvatarUrl}
                  />
                </div>
              </div>

              {state.error ? (
                <div className="rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {state.error}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  保存后会直接进入 dashboard。
                </p>
                <SubmitButton />
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="min-h-[520px]">
          <OnboardingDashboardPreview
            displayName={previewName}
            school={school}
            grade={previewGrade}
            avatar={avatarUrl}
          />
        </div>
      </div>
    </div>
  )
}
