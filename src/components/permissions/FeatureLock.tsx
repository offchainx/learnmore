import React from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureLockProps {
  /**
   * Whether the content is currently locked.
   */
  isLocked: boolean;
  /**
   * The content to be blurred/locked.
   */
  children: React.ReactNode;
  /**
   * Title displayed on the lock overlay.
   * @default "Unlock Premium Feature"
   */
  title?: string;
  /**
   * Description displayed on the lock overlay.
   * @default "Upgrade to Smart Plus to access deep AI analysis."
   */
  description?: string;
  /**
   * Label for the action button.
   * @default "Upgrade Now"
   */
  actionLabel?: string;
  /**
   * Callback for when the upgrade button is clicked.
   */
  onUpgrade?: () => void;
  /**
   * Additional container classes.
   */
  className?: string;
}

export const FeatureLock: React.FC<FeatureLockProps> = ({
  isLocked,
  children,
  title = "Unlock Premium Feature",
  description = "Upgrade to Smart Plus to access deep AI analysis.",
  actionLabel = "Upgrade Now",
  onUpgrade,
  className,
}) => {
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* 
         The content wrapper. 
         We apply blur and disable pointer events when locked. 
         select-none prevents users from selecting text through the blur.
      */}
      <div
        className={cn(
          "transition-all duration-500 ease-in-out",
          isLocked ? "blur-sm pointer-events-none select-none opacity-80" : ""
        )}
        aria-hidden={isLocked}
      >
        {children}
      </div>

      {/* The Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            {/* 
              Glassmorphism Lock Card 
              bg-background/80 + backdrop-blur-md creates the glass effect.
              border-white/20 adds a subtle highlight for that 'glass edge' look.
            */}
          <Card className="w-full max-w-sm border-white/20 bg-background/80 shadow-xl backdrop-blur-md dark:border-gray-800 animate-in fade-in zoom-in-95 duration-300">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-center">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-2 pb-6">
              <Button onClick={onUpgrade} size="lg" className="w-full font-semibold shadow-lg">
                {actionLabel}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
