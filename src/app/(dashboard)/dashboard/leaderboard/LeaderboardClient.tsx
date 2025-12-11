'use client'

import { LeaderboardEntryWithUser } from '@/actions/leaderboard'
import { LeaderboardPeriod } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trophy, Medal, Crown } from 'lucide-react'

interface LeaderboardClientProps {
  initialEntries: LeaderboardEntryWithUser[]
  userRank: { rank: number; score: number } | null
  currentPeriod: LeaderboardPeriod
}

export function LeaderboardClient({ initialEntries, userRank, currentPeriod }: LeaderboardClientProps) {
  const router = useRouter()
  
  const handleTabChange = (value: string) => {
    router.push(`/dashboard/leaderboard?period=${value}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
      </div>

      <Tabs defaultValue={currentPeriod} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="WEEKLY">Weekly</TabsTrigger>
          <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
          <TabsTrigger value="ALL_TIME">All Time</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Main Leaderboard List */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Learners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {initialEntries.map((entry) => (
                  <div
                    key={entry.user.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 font-bold text-muted-foreground">
                        {entry.rank <= 3 ? (
                          <RankIcon rank={entry.rank} />
                        ) : (
                          <span>#{entry.rank}</span>
                        )}
                      </div>
                      <Avatar>
                        <AvatarImage src={entry.user.avatar || undefined} />
                        <AvatarFallback>{entry.user.username?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{entry.user.username || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground">Level {Math.floor(entry.score / 100) + 1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-primary">{entry.score}</span>
                      <span className="text-xs text-muted-foreground ml-1">XP</span>
                    </div>
                  </div>
                ))}
                
                {initialEntries.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    No data for this period yet. Be the first!
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* User Stats Side Panel */}
        <div className="md:col-span-4 space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Your Ranking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                 <div className="relative inline-block">
                    <Avatar className="h-20 w-20 mx-auto border-4 border-background shadow-xl">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">You</AvatarFallback>
                    </Avatar>
                    {userRank && userRank.rank <= 3 && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                        <Crown className="h-4 w-4 text-white" />
                      </div>
                    )}
                 </div>
                 
                 {userRank ? (
                   <div className="grid grid-cols-2 gap-4 pt-4">
                     <div className="text-center p-3 bg-background rounded-lg shadow-sm">
                       <p className="text-sm text-muted-foreground">Rank</p>
                       <p className="text-2xl font-bold">#{userRank.rank}</p>
                     </div>
                     <div className="text-center p-3 bg-background rounded-lg shadow-sm">
                       <p className="text-sm text-muted-foreground">Score</p>
                       <p className="text-2xl font-bold text-primary">{userRank.score}</p>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-4 text-muted-foreground">
                     You haven&apos;t participated in this period yet.
                   </div>
                 )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent>
               <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                 <li>Complete quizzes to earn XP.</li>
                 <li>Maintain a daily streak for bonuses.</li>
                 <li>Review your error book to master topics.</li>
               </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-500" />
  if (rank === 2) return <Medal className="h-6 w-6 text-gray-400 fill-gray-400" />
  if (rank === 3) return <Medal className="h-6 w-6 text-amber-700 fill-amber-700" />
  return null
}
