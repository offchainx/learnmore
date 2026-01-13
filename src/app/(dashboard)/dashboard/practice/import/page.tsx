'use client'

import React from 'react'
import { SmartQuestionParser } from '@/components/practice/smart-parser/SmartQuestionParser'
import { ParsedQuestion } from '@/components/practice/smart-parser/types'
import { createQuestion } from '@/actions/practice/question'

export default function ImportQuestionPage() {
  const handleSave = async (data: ParsedQuestion) => {
    try {
      console.log('💾 [前端] 准备保存题目:', {
        hasContent: !!data.content,
        hasAnswer: !!data.answer,
        type: data.type,
      });

      const result = await createQuestion({
        content: data.content,
        type: data.type,
        options: data.options,
        answer: data.answer,
        explanation: data.explanation,
        difficulty: data.difficulty
      });

      console.log('✅ [前端] 保存成功:', result);
      // Success feedback will be handled by parent component
    } catch (error: any) {
      console.error('❌ [前端] 保存失败:', error);
      // Re-throw to let parent component handle the error
      throw new Error(error.message || 'Failed to save question');
    }
  }

  return (
    <div className="w-full">
      <SmartQuestionParser onSave={handleSave} />
    </div>
  )
}
