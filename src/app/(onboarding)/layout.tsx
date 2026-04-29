import type { ReactNode } from 'react'

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-6 font-sans text-slate-900 sm:px-6 desktop:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:42px_42px] opacity-60" />
        <div className="absolute left-[-12%] top-[-10%] size-[28rem] rounded-full bg-emerald-400/10 blur-3xl" />
        <div
          className="absolute bottom-[-18%] right-[-10%] size-[24rem] rounded-full bg-slate-400/10 blur-3xl"
        />
      </div>

      <div className="relative z-10 flex w-full min-w-0 items-center justify-center">
        {children}
      </div>
    </div>
  )
}
