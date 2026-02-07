import { AdminClientWrapper } from "@/components/admin/AdminClientWrapper"
import { getProfile } from "@/actions/user/profile"
import { redirect } from "next/navigation"
import { Header } from "@/components/admin/content-statistics/Header"
import { DashboardStats } from "@/components/admin/content-statistics/DashboardStats"
import { SubjectDistribution } from "@/components/admin/content-statistics/SubjectDistribution"
import { DifficultyBreakdown } from "@/components/admin/content-statistics/DifficultyBreakdown"
import { ReviewersList } from "@/components/admin/content-statistics/ReviewersList"

export default async function StatisticsPage() {
  const profile = await getProfile()
  if (!profile) {
    redirect('/login')
  }

  return (
    <AdminClientWrapper userRole={profile.role}>
      <div className="relative min-h-full bg-background-light dark:bg-background-dark overflow-hidden rounded-xl">
         {/* Background ambient glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen dark:mix-blend-lighten z-0"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen dark:mix-blend-lighten z-0"></div>
        
        <div className="relative z-10 flex flex-col h-full">
          <Header />
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 space-y-6 lg:space-y-8">
            <DashboardStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SubjectDistribution />
              <DifficultyBreakdown />
            </div>
            
            <ReviewersList />
          </div>
        </div>
      </div>
    </AdminClientWrapper>
  )
}