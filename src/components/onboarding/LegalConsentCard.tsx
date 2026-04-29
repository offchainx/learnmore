'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

import {
  acceptLegalConsent,
  type LegalConsentFormState,
} from '@/actions/user/onboarding'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const initialState: LegalConsentFormState = {}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="h-12 w-full rounded-[12px] !bg-[#111111] !text-white shadow-none hover:!bg-[#1b1b1b]"
      isLoading={pending}
      loadingText="保存中..."
    >
      继续
    </Button>
  )
}

export function LegalConsentCard() {
  const [state, formAction] = useActionState(acceptLegalConsent, initialState)

  return (
    <Card className="overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-[0_24px_80px_-46px_rgba(15,23,42,0.22)]">
      <CardHeader className="space-y-4 border-b border-slate-200/70 p-6 sm:p-8">
        <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
          <div className="flex size-10 items-center justify-center rounded-[12px] border border-slate-200 bg-slate-50 text-slate-700">
            <ShieldCheck className="size-5" />
          </div>
          <div className="space-y-1">
            <p>步骤 1/2</p>
            <CardTitle className="text-left text-2xl font-semibold tracking-tight text-slate-950">
              确认使用条款
            </CardTitle>
          </div>
        </div>
        <CardDescription className="max-w-[32rem] text-sm leading-6 text-slate-500">
          这是账号级确认。完成后，我们会继续收集学校与年级信息，用于内容推荐和提醒。
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-6 pb-6 sm:px-8">
        <form action={formAction} className="space-y-5">
          <label className="flex items-start gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-4">
            <Checkbox
              name="legalConsent"
              value="true"
              required
              className="mt-0.5 border-slate-300 bg-white data-[state=checked]:border-slate-900 data-[state=checked]:bg-slate-900"
            />
            <div className="space-y-1">
              <Label className="cursor-pointer text-sm font-medium text-slate-900">
                我同意 Terms of Service 和 Privacy Policy
              </Label>
              <p className="text-sm leading-6 text-slate-500">
                你可以随时查看完整条款。继续后，我们会把 onboarding
                状态保存到你的账号。{' '}
                <Link
                  href="/terms"
                  className="font-medium text-slate-900 underline underline-offset-4"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="font-medium text-slate-900 underline underline-offset-4"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </label>

          {state.error ? (
            <div className="rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {state.error}
            </div>
          ) : null}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
