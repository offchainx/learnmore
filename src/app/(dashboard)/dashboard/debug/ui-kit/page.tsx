'use client';

import React, { useState } from 'react';
import { FeatureLock } from '@/components/permissions/FeatureLock';
import { UpsellModal } from '@/components/permissions/UpsellModal';
import { PreviewHook } from '@/components/permissions/PreviewHook';
import { MemoryDecayVisual } from '@/components/permissions/MemoryDecayVisual';
import { EfficiencyMirror } from '@/components/permissions/EfficiencyMirror';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UIKitDebugPage() {
  const [isLocked, setIsLocked] = useState(true);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(2);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Permission UI Kit Debugger</h1>
          <p className="text-muted-foreground mt-2">
            Verification environment for Task B components.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setIsLocked(!isLocked)}>
            Toggle Lock: {isLocked ? 'LOCKED' : 'UNLOCKED'}
          </Button>
          <Button onClick={() => setIsUpsellOpen(true)}>
            Open Upsell Modal
          </Button>
        </div>
      </div>

      <Tabs defaultValue="feature-lock" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="feature-lock">FeatureLock</TabsTrigger>
          <TabsTrigger value="preview-hook">PreviewHook</TabsTrigger>
          <TabsTrigger value="memory-decay">MemoryDecay</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="upsell">Upsell Logic</TabsTrigger>
        </TabsList>

        {/* 1. FeatureLock Test */}
        <TabsContent value="feature-lock" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Locked State</CardTitle>
              </CardHeader>
              <CardContent>
                <FeatureLock
                  isLocked={true}
                  onUpgrade={() => setIsUpsellOpen(true)}
                >
                  <div className="p-6 bg-secondary/20 rounded border border-dashed border-secondary h-64 flex items-center justify-center">
                    <p className="text-lg font-medium">This is premium content (Chart/Analysis)</p>
                  </div>
                </FeatureLock>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interactive State (Toggle above)</CardTitle>
              </CardHeader>
              <CardContent>
                <FeatureLock
                  isLocked={isLocked}
                  title="Unlock Advanced Metrics"
                  description="See how you compare to top 10% of students."
                  onUpgrade={() => setIsUpsellOpen(true)}
                >
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 h-64 flex flex-col items-center justify-center gap-4">
                    <div className="text-4xl font-bold text-blue-600">98%</div>
                    <p className="text-blue-700 dark:text-blue-300">Accuracy Score</p>
                    <Button variant="outline" size="sm">Download Report</Button>
                  </div>
                </FeatureLock>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. PreviewHook Test */}
        <TabsContent value="preview-hook" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview Hook (In-Context)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-red-500">Question 5: Incorrect</span>
                  <span className="text-muted-foreground">Calculus</span>
                </div>
                <p className="text-sm">Your answer: 5x | Correct answer: 5x^2</p>
                
                {/* The Component */}
                <PreviewHook onClick={() => setIsUpsellOpen(true)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Memory Decay Test */}
        <TabsContent value="memory-decay" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Controls</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setDaysRemaining(7)}>7 Days (Safe)</Button>
                <Button size="sm" variant="outline" onClick={() => setDaysRemaining(3)}>3 Days (Warn)</Button>
                <Button size="sm" variant="outline" onClick={() => setDaysRemaining(1)}>1 Day (Critical)</Button>
              </div>
            </div>
            
            <div className="md:col-span-2">
               {/* The Component */}
               <MemoryDecayVisual 
                  daysRemaining={daysRemaining} 
                  maxDays={7}
                  onUpgrade={() => setIsUpsellOpen(true)}
                  className="max-w-xs"
               />
            </div>
          </div>
        </TabsContent>

        {/* 4. Efficiency Mirror Test */}
        <TabsContent value="efficiency" className="mt-6">
           <div className="max-w-3xl mx-auto">
              <EfficiencyMirror onUpgrade={() => setIsUpsellOpen(true)} />
           </div>
        </TabsContent>

        {/* 5. Upsell Logic */}
        <TabsContent value="upsell" className="mt-6">
           <Card>
             <CardHeader>
               <CardTitle>Upsell Modal Trigger</CardTitle>
             </CardHeader>
             <CardContent>
               <Button size="lg" onClick={() => setIsUpsellOpen(true)}>
                 Launch Full Upsell Experience
               </Button>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      {/* The Global Modal */}
      <UpsellModal 
        isOpen={isUpsellOpen} 
        onOpenChange={setIsUpsellOpen}
        currentTier="Standard"
        onConfirmUpgrade={(tier) => alert(`Upgrading to ${tier}... (Mock)`)}
      />
    </div>
  );
}
