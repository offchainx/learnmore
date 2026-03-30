
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/actions/user/auth"
import { getEffectiveTier } from "@/lib/permissions/engine"
import SmartDrillSession from "@/components/practice/modes/SmartDrillMode"

export const metadata: Metadata = {
  title: "Smart Drill | LearnMore",
  description: "Adaptive practice mode based on your error history",
}

interface PageProps {
  searchParams: Promise<{
    subjectId?: string
    preview?: string
    autostart?: string
  }>
}

export default async function SmartDrillPage({ searchParams }: PageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const resolvedSearchParams = await searchParams
  const subjectId = resolvedSearchParams.subjectId
  const enableMockPreview = resolvedSearchParams.preview === 'mock'
  const autoStart = resolvedSearchParams.autostart === '1'
  const effectiveTier = getEffectiveTier(user)

  if (!subjectId) {
    // 如果没有科目ID，重定向回练习中心首页 (假设路由)
    redirect("/dashboard/practice")
  }

  return (
    <SmartDrillSession
      userId={user.id}
      subjectId={subjectId}
      enableMockPreview={enableMockPreview}
      autoStart={autoStart}
      userTier={effectiveTier}
    />
  )
}
