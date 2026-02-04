'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { UserDetail } from '@/types/admin-user'
import { getUserActivityData } from '@/actions/admin/user-details'
import { Loader2 } from 'lucide-react'

interface ActivityTabProps {
  user: UserDetail
}

const Heatmap: React.FC<{ data: number[][] }> = ({ data }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Learning Activity Heatmap</h3>
      <div className="flex gap-2 items-end overflow-x-auto pb-2">
        {/* Y Axis Labels */}
        <div className="flex flex-col gap-1 text-[10px] text-slate-500 pr-2 pb-[2px]">
          {['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((d, i) => (
            <div key={i} className="h-3 leading-3">{d}</div>
          ))}
        </div>
        
        {/* Grid */}
        <div className="flex gap-1">
          {data.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1">
              {week.map((intensity, dIndex) => {
                let color = 'bg-slate-800/50';
                if (intensity === 1) color = 'bg-emerald-900';
                if (intensity === 2) color = 'bg-emerald-600';
                if (intensity === 3) color = 'bg-emerald-400';
                return (
                  <div 
                    key={`${wIndex}-${dIndex}`} 
                    className={`w-3 h-3 rounded-sm ${color} hover:ring-1 hover:ring-white/50 transition-all`}
                    title={`Activity level: ${intensity}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-slate-500 justify-end">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-800/50" />
          <div className="w-3 h-3 rounded-sm bg-emerald-900" />
          <div className="w-3 h-3 rounded-sm bg-emerald-600" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export const ActivityTab: React.FC<ActivityTabProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stats: {
      totalQuestions: number;
      accuracy: number;
      mistakes: number;
      daysActive: number;
    };
    timeline: {
      type: string;
      color: string;
      time: string;
    }[];
    heatmap: number[][];
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await getUserActivityData(user.id);
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    }
    loadData();
  }, [user.id]);

  if (loading) {
     return (
       <div className="flex items-center justify-center h-[400px]">
         <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
       </div>
     );
  }

  if (!data) return <div className="p-8 text-center text-slate-500">无法加载数据</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Col (55% rough) */}
      <div className="space-y-6">
        {/* 2x2 Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Total Questions', val: data.stats.totalQuestions },
            { label: 'Accuracy', val: `${data.stats.accuracy}%` },
            { label: 'Mistakes Log', val: data.stats.mistakes },
            { label: 'Days Active', val: data.stats.daysActive }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col items-center justify-center text-center">
              <div className="text-2xl font-bold text-white mb-1">{stat.val}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Vertical Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-200 mb-6">Recent Activity Timeline</h3>
          <div className="space-y-6 pl-2">
            {data.timeline.length === 0 ? (
              <div className="text-slate-500 text-sm">暂无近期活动</div>
            ) : (
              data.timeline.map((evt, i) => (
                <div key={i} className="relative flex gap-4">
                   {i !== data.timeline.length - 1 && <div className="absolute left-[5px] top-4 bottom-[-34px] w-px bg-slate-800" />}
                   <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${evt.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                   <div className="flex-1 flex justify-between">
                      <span className="text-sm text-slate-200">{evt.type}</span>
                      <span className="text-xs text-slate-500">{evt.time}</span>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Col: Heatmap */}
      <div>
        <Heatmap data={data.heatmap} />
      </div>
    </div>
  )
}
