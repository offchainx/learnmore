import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DIFFICULTY_DATA } from '../constants';

export const DifficultyBreakdown = () => {
  return (
    <div className="glass-card rounded-2xl p-6 h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Difficulty Breakdown</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Distribution by question complexity</p>
        </div>
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <span className="material-icons-round text-xl">more_vert</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8">
        {/* Chart */}
        <div className="relative w-56 h-56 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DIFFICULTY_DATA}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                cornerRadius={6}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {DIFFICULTY_DATA.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    className="hover:opacity-90 transition-opacity cursor-pointer"
                    strokeWidth={0}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [value.toLocaleString(), 'Items']}
                contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                    backdropFilter: 'blur(4px)',
                    borderRadius: '0.75rem', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: '#fff',
                    padding: '8px 12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: '#fff', fontSize: '12px' }}
                cursor={false}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">12.5k</span>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col justify-center gap-4 w-full sm:w-auto">
          {DIFFICULTY_DATA.map((item) => (
            <div key={item.name} className="flex items-center gap-4 group cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div 
                className="w-3 h-3 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#151921]" 
                style={{ 
                  backgroundColor: item.color,
                  '--tw-ring-color': item.color 
                } as any}
              ></div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-8">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.percentage}%</p>
                </div>
                <div className="w-full bg-gray-100 dark:bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full rounded-full opacity-50" style={{ width: `${item.percentage}%`, backgroundColor: item.color }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};