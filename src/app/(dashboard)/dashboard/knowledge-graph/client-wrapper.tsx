'use client'

import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { KnowledgeGraphView } from '@/components/dashboard/views/KnowledgeGraphView'
import { User } from '@prisma/client'

interface KnowledgeGraphClientWrapperProps {
  user: User
}

export function KnowledgeGraphClientWrapper({ user }: KnowledgeGraphClientWrapperProps) {
  const router = useRouter()

  const handleNavigate = (view: string) => {
    // Map view names to routes
    const routes: Record<string, string> = {
      'dashboard': '/dashboard',
      'courses': '/dashboard/courses',
      'questionBank': '/dashboard/practice',
      'leaderboard': '/dashboard/leaderboard',
      'community': '/dashboard/community',
      'settings': '/dashboard/settings',
      'achievements': '/dashboard/achievements',
      'knowledgeGraph': '/dashboard/knowledge-graph',
      'admin': '/admin/content',
      'parent': '/dashboard'
    }

    const route = routes[view] || '/dashboard'
    router.push(route)
  }

  return (
    <DashboardLayout
      currentView="knowledgeGraph"
      onNavigate={handleNavigate}
      userRole={user.role}
      subscriptionTier={user.subscriptionTier}
      subscriptionEnd={user.subscriptionEnd}
    >
      <KnowledgeGraphView />
    </DashboardLayout>
  )
}