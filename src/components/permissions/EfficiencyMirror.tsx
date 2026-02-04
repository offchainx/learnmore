import React from 'react';
import { Search, Zap, Clock, Target, ArrowRight, Brain, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EfficiencyMirrorProps {
  /**
   * Callback for upgrade action.
   */
  onUpgrade?: () => void;
  /**
   * Additional styles.
   */
  className?: string;
}

export const EfficiencyMirror: React.FC<EfficiencyMirrorProps> = ({ onUpgrade, className }) => {
  return (
    <Card className={cn("overflow-hidden border-2 transition-all duration-300 hover:shadow-lg hover:border-primary/20", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 relative">
        {/* Left Side: Manual (Muted/Gray) */}
        <div className="bg-muted/40 p-8 flex flex-col items-center text-center space-y-5 relative dark:bg-muted/10">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center ring-4 ring-background">
                <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-muted-foreground">Manual Practice</h3>
                <p className="text-sm text-muted-foreground/80">The traditional way</p>
            </div>
            <ul className="space-y-4 text-sm text-muted-foreground w-full">
                <li className="flex items-center justify-center gap-3 opacity-80">
                    <Clock className="h-4 w-4" /> 
                    <span>30 mins/day</span>
                </li>
                <li className="flex items-center justify-center gap-3 opacity-80">
                    <Search className="h-4 w-4" /> 
                    <span>Searching for questions</span>
                </li>
                <li className="flex items-center justify-center gap-3 opacity-80">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                    <span>Random Difficulty</span>
                </li>
            </ul>
        </div>

        {/* Divider with VS Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-center justify-center pointer-events-none">
             <div className="bg-background rounded-full p-1 shadow-sm">
                <Badge variant="outline" className="bg-background border-border px-3 py-1 text-xs font-black tracking-widest shadow-sm ring-1 ring-border">VS</Badge>
             </div>
        </div>
        
        {/* Mobile Divider */}
        <div className="flex md:hidden items-center justify-center py-6 relative bg-gradient-to-r from-muted/40 to-primary/5">
             <div className="absolute inset-0 flex items-center px-10">
                <div className="w-full border-t border-dashed border-border" />
             </div>
             <Badge variant="outline" className="bg-background relative z-10 text-xs font-bold shadow-sm">VS</Badge>
        </div>

        {/* Right Side: Smart Plus (Vibrant/Primary) */}
        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-8 flex flex-col items-center text-center space-y-5 relative overflow-hidden group cursor-default">
             {/* Dynamic background glow */}
             <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:opacity-70 transition-opacity" />
             <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 bg-blue-400/10 rounded-full blur-2xl opacity-50 pointer-events-none" />
             
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center z-10 ring-4 ring-background shadow-lg shadow-primary/10 transition-transform group-hover:scale-110 duration-300">
                <Zap className="h-7 w-7 text-primary fill-primary/20" />
            </div>
            <div className="z-10">
                <h3 className="text-lg font-bold text-foreground">Smart Plus</h3>
                <p className="text-sm text-primary font-bold tracking-wide uppercase text-[10px]">AI-Powered Efficiency</p>
            </div>
            <ul className="space-y-4 text-sm font-medium text-foreground w-full z-10">
                <li className="flex items-center justify-center gap-3">
                    <Clock className="h-4 w-4 text-primary" /> 
                    <span>10 mins/day</span>
                </li>
                 <li className="flex items-center justify-center gap-3">
                    <Brain className="h-4 w-4 text-primary" /> 
                    <span>Instant Generated Sets</span>
                </li>
                <li className="flex items-center justify-center gap-3">
                    <Target className="h-4 w-4 text-primary" /> 
                    <span>Targeted Weakness</span>
                </li>
            </ul>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-card/50 border-t p-5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm">
        <div className="text-center md:text-left flex items-center gap-3">
            <div className="hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-medium">
                Users save an average of <span className="text-primary font-bold">120 hours/year</span>.
            </p>
        </div>
        <Button onClick={onUpgrade} className="w-full md:w-auto shadow-md group font-semibold bg-primary hover:bg-primary/90 text-primary-foreground">
            Upgrade to Efficiency <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
};
