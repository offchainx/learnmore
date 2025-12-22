'use client';

import React, { useTransition } from 'react';
import { DailyTask } from '@prisma/client';
import { Target, ArrowRight, CheckCircle2 } from 'lucide-react';
import { claimTaskReward } from '@/actions/gamification';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/providers/app-provider';
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';

interface DailyMissionsProps {
  tasks: DailyTask[];
}

export const DailyMissions = ({ tasks }: DailyMissionsProps) => {
  const { t } = useApp();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleClaim = (taskId: string, reward: number) => {
    startTransition(async () => {
      const result = await claimTaskReward(taskId);
      if (result.success) {
        toast({
          title: "XP Claimed!",
          description: `You earned ${reward} XP.`,
        });
        router.refresh(); // Refresh to update XP and task status
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to claim reward",
          variant: "destructive",
        });
      }
    });
  };

  // Sort tasks: Unclaimed & Completed first, then In Progress, then Claimed
  const sortedTasks = [...tasks].sort((a, b) => {
    const aCompleted = a.currentCount >= a.targetCount;
    const bCompleted = b.currentCount >= b.targetCount;
    
    if (a.isClaimed && !b.isClaimed) return 1;
    if (!a.isClaimed && b.isClaimed) return -1;
    
    if (aCompleted && !bCompleted) return -1;
    if (!aCompleted && bCompleted) return 1;
    
    return 0;
  });

  return (
    <Card className="lg:col-span-2 p-0 overflow-hidden relative border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl h-full flex flex-col">
       {/* Abstract Background Effect */}
       <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>

       <div className="p-6 md:p-8 relative z-10 h-full flex flex-col">
          <div className="flex justify-between items-start mb-6">
             <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                   <Target className="w-6 h-6 text-blue-400" /> {t.dashboard?.todaysMission || "Today's Mission"}
                </h2>
                <p className="text-slate-400 text-sm mt-1">{t.dashboard?.missionSub || "Complete tasks to earn XP"}</p>
             </div>
             <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
                <span className="text-xs font-bold text-blue-200">Active</span>
             </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[380px] custom-scrollbar">
             {sortedTasks.map((task) => {
               const isCompleted = task.currentCount >= task.targetCount;
               const progress = Math.min((task.currentCount / task.targetCount) * 100, 100);
               
               let statusColor = "text-blue-400 bg-blue-400/10 border-blue-400/20";
               if (task.isClaimed) {
                   statusColor = "text-slate-400 bg-slate-400/10 border-slate-400/20";
               } else if (isCompleted) {
                   statusColor = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
               }

               return (
                <div key={task.id} className={`group flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-lg shadow-black/20 ${task.isClaimed ? 'bg-white/5 border-white/5 opacity-60' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/30'}`}>
                   <div className="flex items-center gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all ${task.isClaimed ? 'border-slate-600' : 'border-slate-600 group-hover:border-blue-400 group-hover:bg-blue-500/20'}`}>
                         <div className={`w-2 h-2 rounded-full bg-current ${task.isClaimed ? 'text-slate-500' : 'text-blue-400'}`}></div>
                      </div>
                      <div className="flex-1">
                         <div className={`font-bold text-base transition-colors ${task.isClaimed ? 'text-slate-400' : 'text-white group-hover:text-blue-200'}`}>{task.title}</div>
                         <div className="flex items-center gap-3 mt-1">
                             <div className={`text-[10px] inline-block px-1.5 py-0.5 rounded font-bold ${statusColor}`}>
                                {task.isClaimed ? 'Claimed' : isCompleted ? 'Completed' : 'In Progress'}
                             </div>
                             <div className="h-1.5 flex-1 max-w-[100px] bg-slate-700 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                             </div>
                             <span className="text-[10px] text-slate-400">{task.currentCount}/{task.targetCount}</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="text-right flex items-center gap-4 ml-4">
                      {!task.isClaimed && (
                          <div className="text-sm font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">+{task.xpReward} XP</div>
                      )}
                      
                      {task.isClaimed ? (
                           <div className="w-8 h-8 flex items-center justify-center text-emerald-500">
                               <CheckCircle2 className="w-6 h-6" />
                           </div>
                      ) : isCompleted ? (
                           <Button 
                             size="sm" 
                             className="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                             onClick={() => handleClaim(task.id, task.xpReward)}
                             disabled={isPending}
                           >
                             {isPending ? '...' : 'Claim'}
                           </Button>
                      ) : (
                           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all opacity-50">
                             <ArrowRight className="w-4 h-4" />
                           </div>
                      )}
                   </div>
                </div>
               );
             })}
          </div>
       </div>
    </Card>
  );
};
