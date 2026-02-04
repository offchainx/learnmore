import React from 'react';
import { History, AlertTriangle, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MemoryDecayVisualProps {
  daysRemaining?: number;
  maxDays?: number;
  onUpgrade?: () => void;
  className?: string;
}

export const MemoryDecayVisual: React.FC<MemoryDecayVisualProps> = ({
  daysRemaining = 2,
  maxDays = 7,
  onUpgrade,
  className
}) => {
  const percentage = Math.min(100, Math.max(0, (daysRemaining / maxDays) * 100));
  const isCritical = daysRemaining <= 1;
  const isWarning = daysRemaining <= 3;

  let progressColor = "bg-green-500";
  if (isCritical) progressColor = "bg-destructive";
  else if (isWarning) progressColor = "bg-yellow-500";

  return (
    <Card className={cn("border shadow-sm transition-colors hover:border-primary/20", className)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                Data Retention
            </CardTitle>
            {isWarning && (
                <AlertTriangle className={cn(
                    "h-4 w-4 text-yellow-500",
                    isCritical && "text-destructive animate-pulse"
                )} />
            )}
        </div>
        <p className="text-xs text-muted-foreground font-medium">Starter Plan</p>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">History Limit</span>
                <span className={cn(
                    "font-bold transition-colors duration-300",
                    isCritical ? "text-destructive animate-pulse" : isWarning ? "text-yellow-600 dark:text-yellow-400" : "text-foreground"
                )}>
                    {daysRemaining} days left
                </span>
            </div>
            <Progress 
                value={percentage} 
                className="h-2 bg-secondary/50" 
                indicatorClassName={progressColor} 
            />
        </div>

        <p className="text-xs text-muted-foreground leading-tight">
            Your practice history is only saved for <span className="font-medium text-foreground">{maxDays} days</span>. 
        </p>

        <Button 
            variant="outline" 
            size="sm" 
            className="w-full h-8 text-xs font-medium border-primary/20 hover:border-primary/50 hover:bg-primary/5 hover:text-primary gap-2"
            onClick={onUpgrade}
        >
            <Save className="h-3 w-3" />
            Save My Data
        </Button>
      </CardContent>
    </Card>
  );
};
