
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/actions/auth"
import SmartDrillMode from "@/components/practice/modes/SmartDrillMode"

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
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Smart Drill</h1>
        <p className="text-muted-foreground">
          Personalized practice focusing on your weak spots.
        </p>
      </div>

      <SmartDrillMode
        userId={user.id}
        subjectId={subjectId}
      />
    </div>
  )
}
