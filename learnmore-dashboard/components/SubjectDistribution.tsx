import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell, XAxis, Tooltip, YAxis } from 'recharts';
import { SUBJECT_DATA } from '../constants';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-gray-900/95 dark:bg-black/90 backdrop-blur border border-white/10 text-white text-xs p-3 rounded-lg shadow-xl">
        <p className="font-semibold mb-1 text-sm">{label}</p>
        <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400">Completion:</span>
            <span className="font-mono text-primary">{value}%</span>
        </div>
        <div className="mt-1 w-full bg-white/20 h-1 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${value}%` }}></div>
        </div>
      </div>
    );
  }
  return null;
};

export const SubjectDistribution = () => {
  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col h-[400px]">
      <div className="flex items-start justify-between mb-8">
        <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Curriculum Coverage</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Percentage of content completed per subject</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
           <div className="w-2 h-2 rounded-full bg-primary"></div>
           <span>Current</span>
           <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-white/10 ml-2"></div>
           <span>Target</span>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={SUBJECT_DATA} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} barSize={32}>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <XAxis 
              dataKey="subject" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} 
              dy={15}
            />
            <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 10 }}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
            />
            {/* Background Bars (Target) */}
            <Bar dataKey="fullMark" xAxisId={0} stackId="a" fill="rgba(156, 163, 175, 0.1)" radius={[6, 6, 6, 6]} isAnimationActive={false} />
            
            {/* Value Bars (Actual) */}
            <Bar dataKey="value" xAxisId={0} stackId="b" radius={[6, 6, 6, 6]}>
              {SUBJECT_DATA.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill="#3B82F6" 
                  className="transition-all duration-300 hover:opacity-90"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};