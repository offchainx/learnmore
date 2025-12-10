'use client';

import * as React from 'react';
import CourseTree, { CourseChapter } from '@/components/business/CourseTree';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock Data
const mockChapters: CourseChapter[] = [
  {
    id: 'c1',
    title: '第一章：函数与极限',
    isCompleted: true,
    isLocked: false,
    children: [
      {
        id: 'c1-1',
        title: '1.1 映射与函数',
        isCompleted: true,
        isLocked: false,
      },
      {
        id: 'c1-2',
        title: '1.2 数列的极限',
        isCompleted: true,
        isLocked: false,
      },
      {
        id: 'c1-3',
        title: '1.3 函数的极限',
        isCompleted: false,
        isLocked: false,
        children: [
            { id: 'c1-3-1', title: '1.3.1 自变量趋于有限值', isCompleted: false, isLocked: false },
            { id: 'c1-3-2', title: '1.3.2 自变量趋于无穷大', isCompleted: false, isLocked: false },
        ]
      },
    ],
  },
  {
    id: 'c2',
    title: '第二章：导数与微分',
    isCompleted: false,
    isLocked: false,
    children: [
      {
        id: 'c2-1',
        title: '2.1 导数概念',
        isCompleted: false,
        isLocked: false,
      },
      {
        id: 'c2-2',
        title: '2.2 求导法则',
        isCompleted: false,
        isLocked: true, // Locked
      },
    ],
  },
  {
    id: 'c3',
    title: '第三章：积分 (Locked)',
    isCompleted: false,
    isLocked: true,
    children: [
        { id: 'c3-1', title: '3.1 不定积分', isLocked: true },
        { id: 'c3-2', title: '3.2 定积分', isLocked: true },
    ]
  },
];

export default function CourseTreeDemoPage() {
  const [selectedChapterId, setSelectedChapterId] = React.useState<string | null>('c1-3-1');

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Tree Demo</h1>
          <p className="text-muted-foreground">
            Story-006 Component Verification
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Directory</CardTitle>
            <CardDescription>
              Interactive component with recursive rendering.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md p-2 bg-background">
                <CourseTree
                chapters={mockChapters}
                selectedChapterId={selectedChapterId}
                onChapterSelect={setSelectedChapterId}
                />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>State Inspector</CardTitle>
            <CardDescription>
              Current selection state.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-1">Selected Chapter ID:</h4>
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                  {selectedChapterId || 'None'}
                </code>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Try the following:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Expand "第一章：函数与极限"</li>
                  <li>Click on "1.3.2 自变量趋于无穷大"</li>
                  <li>Notice the highlight change</li>
                  <li>Try to click "第二章" – "2.2 求导法则" (Locked)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
