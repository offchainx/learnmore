
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/actions/user/auth"
import SmartDrillSession from "@/components/practice/modes/SmartDrillMode"

export const metadata: Metadata = {
  title: "Smart Drill | LearnMore",
  description: "Adaptive practice mode based on your error history",
}

interface PageProps {
  searchParams: Promise<{
    subjectId?: string
  }>
}

export default async function SmartDrillPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const resolvedSearchParams = await searchParams
  const subjectId = resolvedSearchParams.subjectId

  if (!subjectId) {
    // 如果没有科目ID，重定向回练习中心首页 (假设路由)
    redirect("/dashboard/practice")
  }

  return (
    <div className="container mx-auto max-w-6xl py-6">
      <div className="mb-8">
        <div className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">Practice Mode</div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Smart Drill</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          个性化短轮训练。先做一组高价值题，再决定继续强化、切回章节训练，还是进入模拟演练。
        </p>
      </div>

      <SmartDrillSession
        userId={user.id}
        subjectId={subjectId}
      />
    </div>
  )
}
