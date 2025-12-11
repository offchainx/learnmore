import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Clock, Target, CheckCircle2 } from 'lucide-react';

interface ScoreCardProps {
  score: number;
  totalQuestions: number;
  correctCount: number;
  duration?: number; // in seconds
  className?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  totalQuestions,
  correctCount,
  duration,
  className
}) => {
  const percentage = Math.round(score);

  const formatTime = (seconds?: number) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`bg-primary/5 border-primary/20 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Quiz Completed!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="space-y-1">
            <div className="text-4xl font-bold text-primary">
              {percentage}%
            </div>
            <p className="text-sm text-muted-foreground">
              Final Score
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
             <div className="flex items-center gap-2 p-3 bg-background rounded-lg border shadow-sm">
                <Target className="h-4 w-4 text-blue-500" />
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Questions</span>
                    <span className="font-semibold">{totalQuestions}</span>
                </div>
             </div>

             <div className="flex items-center gap-2 p-3 bg-background rounded-lg border shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Correct</span>
                    <span className="font-semibold text-green-600">{correctCount}</span>
                </div>
             </div>

             {/* Duration could be shown if passed */}
             {duration !== undefined && (
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg border shadow-sm">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Time</span>
                        <span className="font-semibold">{formatTime(duration)}</span>
                    </div>
                </div>
             )}
          </div>
        </div>
        
        <p className="mt-4 text-muted-foreground">
            {percentage >= 80 ? "Excellent work! Keep it up!" : 
             percentage >= 60 ? "Good job! A little more practice." : 
             "Don't give up! Review the materials and try again."}
        </p>
      </CardContent>
    </Card>
  );
};
