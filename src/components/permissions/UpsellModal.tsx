import React from 'react';
import { Check, X, Star, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UpsellModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier?: string;
  /**
   * Callback fired when user confirms an upgrade (simulation).
   */
  onConfirmUpgrade?: (tierId: string) => void;
}

interface TierFeature {
  name: string;
  included: boolean;
}

interface Tier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: TierFeature[];
  highlight?: boolean;
}

export const UpsellModal: React.FC<UpsellModalProps> = ({
  isOpen,
  onOpenChange,
  currentTier = "Standard",
  onConfirmUpgrade
}) => {
  const tiers: Tier[] = [
    {
      id: "Standard",
      name: "Standard",
      price: "Free",
      description: "Essential tools for casual learners.",
      features: [
        { name: "Basic Quizzes", included: true },
        { name: "Community Support", included: true },
        { name: "AI Analysis", included: false },
        { name: "Data Retention", included: false },
      ]
    },
    {
      id: "Smart Plus",
      name: "Smart Plus",
      price: "$12/mo",
      description: "Advanced analytics for serious students.",
      highlight: true,
      features: [
        { name: "Unlimited Questions", included: true },
        { name: "Priority Support", included: true },
        { name: "AI Analysis", included: true },
        { name: "Data Retention", included: true },
      ]
    },
    {
      id: "Premier",
      name: "Premier",
      price: "$29/mo",
      description: "The ultimate toolkit with 1-on-1 tutoring.",
      features: [
        { name: "All Smart Plus Features", included: true },
        { name: "1-on-1 Tutoring", included: true },
        { name: "Offline Mode", included: true },
        { name: "API Access", included: true },
      ]
    }
  ];

  const handleUpgradeClick = (tierId: string) => {
    if (onConfirmUpgrade) {
        onConfirmUpgrade(tierId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-muted/20">
        <div className="p-6 pb-2 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/5">
                <Zap className="h-6 w-6 text-primary fill-primary/20" />
            </div>
            <DialogHeader className="mb-2 text-center">
            <DialogTitle className="text-2xl md:text-3xl font-bold">Unlock Your Full Potential</DialogTitle>
            <DialogDescription className="text-base max-w-lg mx-auto">
                Upgrade to access AI-powered insights, unlimited history, and accelerate your learning journey.
            </DialogDescription>
            </DialogHeader>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 pt-0 overflow-y-auto max-h-[70vh] md:max-h-[auto]">
          {tiers.map((tier) => {
            const isCurrent = currentTier === tier.id;
            const isHighlight = tier.highlight;

            return (
              <div 
                key={tier.id} 
                className={cn(
                  "relative flex flex-col rounded-xl bg-card text-card-foreground shadow-sm transition-all duration-200",
                  isHighlight ? "border-2 border-primary shadow-lg scale-100 md:scale-105 z-10 ring-1 ring-primary/20" : "border border-border opacity-90 hover:opacity-100 hover:border-primary/30"
                )}
              >
                {isHighlight && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary hover:bg-primary px-3 py-1 shadow-md text-xs font-bold uppercase tracking-wider">
                      <Star className="w-3 h-3 mr-1 fill-current" /> Most Popular
                    </Badge>
                  </div>
                )}

                <div className="p-6 pb-4 flex-1">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    {tier.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">{tier.price}</span>
                    {tier.price !== "Free" && <span className="text-sm text-muted-foreground font-medium">/month</span>}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground mb-6 h-10">
                    {tier.description}
                  </p>

                  <div className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        {feature.included ? (
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <X className="h-3 w-3" />
                          </div>
                        )}
                        <span className={cn(feature.included ? "text-foreground font-medium" : "text-muted-foreground")}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 pt-0 mt-auto">
                  <Button 
                    className={cn("w-full transition-all", isHighlight && "shadow-md hover:shadow-lg")} 
                    variant={isCurrent ? "secondary" : isHighlight ? "default" : "outline"}
                    disabled={isCurrent}
                    onClick={() => handleUpgradeClick(tier.id)}
                  >
                    {isCurrent ? "Current Plan" : "Upgrade Plan"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
