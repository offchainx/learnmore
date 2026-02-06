import { Target, Zap, MessageCircle } from 'lucide-react'

// --- Mock Data: Context & Season ---
export const currentTierIndex = 2 // Gold
export const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Challenger']

export const seasonData = {
  name: "Season 4: Sniper Elite",
  theme: "Precision Matters",
  bonus: "2x XP for Error Book Kills",
  endsIn: "05d 12h 30m",
  color: "from-red-500/20 to-orange-500/20",
  border: "border-red-500/30",
  icon: Target
}

// --- Mock Data: Users ---
export const topThree = [
  { rank: 1, name: "Sarah J.", xp: 15400, avatar: "https://i.pravatar.cc/150?u=1", trend: "up" as const, change: 2, badge: "Grandmaster" },
  { rank: 2, name: "Mike T.", xp: 14200, avatar: "https://i.pravatar.cc/150?u=2", trend: "same" as const, change: 0, badge: "Elite" },
  { rank: 3, name: "Jessica L.", xp: 13800, avatar: "https://i.pravatar.cc/150?u=3", trend: "down" as const, change: 1, badge: "Elite" },
]

export const listData = [
  { rank: 4, name: "Tom R.", xp: 13200, avatar: "https://i.pravatar.cc/150?u=4", trend: "up" as const, status: 'promotion' as const },
  { rank: 5, name: "Emily W.", xp: 12950, avatar: "https://i.pravatar.cc/150?u=5", trend: "same" as const, status: 'promotion' as const },
  { rank: 6, name: "David K.", xp: 12800, avatar: "https://i.pravatar.cc/150?u=6", trend: "down" as const, status: 'safe' as const },
  { rank: 7, name: "Sophie M.", xp: 12750, avatar: "https://i.pravatar.cc/150?u=7", trend: "up" as const, status: 'safe' as const },
  { rank: 8, name: "Chris P.", xp: 12600, avatar: "https://i.pravatar.cc/150?u=8", trend: "same" as const, status: 'safe' as const },
  { rank: 9, name: "Anna B.", xp: 12550, avatar: "https://i.pravatar.cc/150?u=9", trend: "down" as const, status: 'safe' as const },
  { rank: 10, name: "Ryan G.", xp: 12500, avatar: "https://i.pravatar.cc/150?u=11", trend: "up" as const, status: 'safe' as const, isRival: true },
  { rank: 11, name: "Kevin L.", xp: 12480, avatar: "https://i.pravatar.cc/150?u=12", trend: "down" as const, status: 'safe' as const },
  { rank: 12, name: "Alex Student", xp: 12450, avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&auto=format&fit=crop", trend: "up" as const, status: 'safe' as const, isMe: true },
  { rank: 13, name: "Brian C.", xp: 12100, avatar: "https://i.pravatar.cc/150?u=13", trend: "same" as const, status: 'demotion' as const },
  { rank: 14, name: "Laura D.", xp: 11900, avatar: "https://i.pravatar.cc/150?u=14", trend: "down" as const, status: 'demotion' as const },
  { rank: 15, name: "Sam K.", xp: 11800, avatar: "https://i.pravatar.cc/150?u=15", trend: "down" as const, status: 'demotion' as const },
  { rank: 16, name: "Nina P.", xp: 11500, avatar: "https://i.pravatar.cc/150?u=16", trend: "up" as const, status: 'demotion' as const },
  { rank: 17, name: "Oscar Z.", xp: 11200, avatar: "https://i.pravatar.cc/150?u=17", trend: "down" as const, status: 'demotion' as const },
]

// --- Mock Data: HUD Widgets ---
export const quests = [
  { title: "Kill 3 Errors", xp: 120, progress: 1, total: 3, icon: Zap, color: "text-orange-400 bg-orange-400/10" },
  { title: "Upvote 3 Helpful Posts", xp: 30, progress: 0, total: 3, icon: MessageCircle, color: "text-blue-400 bg-blue-400/10" },
  { title: "Complete 1 Quiz", xp: 150, progress: 0, total: 1, icon: Target, color: "text-purple-400 bg-purple-400/10" },
]
