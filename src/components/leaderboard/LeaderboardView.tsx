'use client'

import { useState } from 'react'
import { TierRoadmap } from './components/TierRoadmap'
import { SeasonBanner } from './components/SeasonBanner'
import { Podium } from './components/Podium'
import { LeaderboardList } from './components/LeaderboardList'
import { XPBreakdown } from './components/XPBreakdown'
import { DailyQuests } from './components/DailyQuests'
import { RivalWatch } from './components/RivalWatch'
import { tiers, currentTierIndex, seasonData, topThree, listData, quests } from './mock-data'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const LeaderboardView = ({ t: _t }: { t?: unknown }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global')

  return (
    <div className="animate-fade-in-up pb-12 relative max-w-7xl mx-auto">
      {/* 1. Header: The Journey & Context */}
      <div className="mb-8 space-y-6">
        {/* Tier Roadmap */}
        <TierRoadmap tiers={tiers} currentTierIndex={currentTierIndex} />

        {/* Season Banner */}
        <SeasonBanner seasonData={seasonData} />
      </div>

      {/* 2. Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: The Arena (Leaderboard) - 8 cols (approx 70%) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Podium */}
          <Podium topThree={topThree} />

          {/* Leaderboard List */}
          <LeaderboardList
            listData={listData}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Right Column: The HUD - 4 cols (approx 30%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Widget 1: My Performance (Donut) */}
          <XPBreakdown />

          {/* Widget 2: Daily Quests (Action Trigger) */}
          <DailyQuests quests={quests} />

          {/* Widget 3: Rival Watch */}
          <RivalWatch />
        </div>
      </div>
    </div>
  )
}
