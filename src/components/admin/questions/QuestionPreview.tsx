'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import 'katex/dist/katex.min.css'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { QuestionWithRelations } from '@/lib/content-pipeline/types'
import { cn } from '@/lib/utils'

interface QuestionPreviewProps {
  question: QuestionWithRelations
  className?: string
}

export function QuestionPreview({ question, className }: QuestionPreviewProps) {
  const { content, type, options, answer, explanation } = question

  return (
    <div className={cn("space-y-6", className)}>
      {/* 题目内容 */}
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <div className="text-lg font-medium">
          <MarkdownRenderer content={content} />
        </div>
      </div>

      {/* 选项 (如果是选择题) */}
      {(type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE') && options && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground">选项</h4>
          <div className="grid gap-2">
            {Object.entries(options as Record<string, string>).map(([key, value]) => (
              <div 
                key={key} 
                className={cn(
                  "flex items-start gap-3 p-3 rounded-md border",
                  // 高亮正确答案 (简单判断：如果 answer 包含 key)
                  isCorrectOption(key, answer) ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : "bg-card"
                )}
              >
                <Badge variant={isCorrectOption(key, answer) ? "default" : "outline"} className="mt-0.5">
                  {key}
                </Badge>
                <div className="flex-1">
                  <MarkdownRenderer content={value} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 答案与解析 */}
      <div className="space-y-4 pt-4 border-t">
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">正确答案</h4>
            <div className="p-3 rounded-md bg-muted font-medium font-mono text-lg text-primary">
              {renderAnswer(answer)}
            </div>
          </div>
          
          <div className="space-y-2">
             <h4 className="text-sm font-semibold text-muted-foreground">题型</h4>
             <Badge variant="secondary">{type}</Badge>
          </div>
        </div>

        {explanation && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">解析</h4>
            <Card className="bg-muted/50 border-none shadow-none">
              <CardContent className="p-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <MarkdownRenderer content={explanation} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => <span className="block mb-2 last:mb-0">{children}</span>
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

function isCorrectOption(key: string, answer: any): boolean {
  if (typeof answer === 'string') {
    return answer === key
  }
  if (Array.isArray(answer)) {
    return answer.includes(key)
  }
  return false
}

function renderAnswer(answer: any): string {
  if (typeof answer === 'string') return answer
  if (Array.isArray(answer)) return answer.join(', ')
  if (typeof answer === 'object') return JSON.stringify(answer)
  return String(answer)
}
