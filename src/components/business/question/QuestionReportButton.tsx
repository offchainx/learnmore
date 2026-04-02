'use client'

import { useState, type FormEvent } from 'react'
import { ReportIssueType } from '@prisma/client'
import { HelpCircle } from 'lucide-react'
import { reportQuestion } from '@/actions/content-pipeline/question-service'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface QuestionReportButtonProps {
  questionId: string
  reportedBy: string
  questionLabel?: string
  className?: string
}

const ISSUE_TYPE_OPTIONS: Array<{ value: ReportIssueType; label: string; description: string }> = [
  { value: 'ANSWER_WRONG', label: '答案错误', description: '标准答案或判定逻辑有误' },
  { value: 'TYPO', label: '错别字', description: '题干、选项或解析中存在拼写问题' },
  { value: 'UNCLEAR', label: '表述不清', description: '题意、条件或措辞不够明确' },
  { value: 'IMAGE_BROKEN', label: '图片损坏', description: '题目图片缺失、错位或不可读' },
  { value: 'LATEX_ERROR', label: '公式错误', description: 'LaTeX 公式渲染或内容有误' },
  { value: 'OTHER', label: '其他', description: '不属于以上类型的问题' },
]

const ISSUE_TYPE_LABELS: Record<ReportIssueType, string> = ISSUE_TYPE_OPTIONS.reduce(
  (acc, item) => {
    acc[item.value] = item.label
    return acc
  },
  {} as Record<ReportIssueType, string>,
)

export function QuestionReportButton({
  questionId,
  reportedBy,
  questionLabel,
  className,
}: QuestionReportButtonProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [issueType, setIssueType] = useState<ReportIssueType>('OTHER')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedDescription = description.trim()
    if (!trimmedDescription) {
      toast({
        title: '请补充报错内容',
        description: '说明题目哪里有问题，方便管理员快速处理。',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await reportQuestion({
        questionId,
        reportedBy,
        issueType,
        description: trimmedDescription,
      })

      if (result.success) {
        toast({
          title: '报错已提交',
          description: '我们会尽快核查并处理这道题目。',
        })
        setOpen(false)
        setIssueType('OTHER')
        setDescription('')
        return
      }

      toast({
        title: '提交失败',
        description: result.error || '报错提交失败，请稍后重试。',
        variant: 'destructive',
      })
    } catch (error) {
      toast({
        title: '提交失败',
        description: error instanceof Error ? error.message : '报错提交失败，请稍后重试。',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider delayDuration={120}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                'h-9 w-9 rounded-full border-borderTone bg-surface/90 text-text-tertiary shadow-sm transition-all hover:border-[hsl(var(--border-strong))] hover:bg-surface hover:text-text-primary focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--page-bg))]',
                className,
              )}
              aria-label={`报错${questionLabel ? `：${questionLabel}` : ''}`}
              onClick={() => setOpen(true)}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="rounded-full border-borderTone bg-surface px-3 py-1 text-xs font-medium text-text-primary shadow-surface-md">
            报错
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="max-w-[560px] overflow-hidden rounded-[28px] border-borderTone bg-background p-0 shadow-[0_32px_90px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950">
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="border-b border-borderTone px-6 py-5 text-left dark:border-slate-800">
            <DialogTitle className="text-xl font-black tracking-tight text-text-primary dark:text-white">
              报错这道题
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-text-secondary dark:text-slate-400">
              发现题目内容、答案、图片或公式有问题时提交报错，管理员会在后台核查。
            </DialogDescription>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-borderTone bg-surface px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-text-secondary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                题目 ID {questionId.slice(0, 8)}
              </span>
              {questionLabel ? (
                <span className="rounded-full border border-borderTone bg-surface px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-text-secondary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {questionLabel}
                </span>
              ) : null}
            </div>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-slate-200">
                报错类型
              </label>
              <Select value={issueType} onValueChange={(value) => setIssueType(value as ReportIssueType)}>
                <SelectTrigger className="h-11 rounded-2xl border-borderTone bg-surface text-text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-white">
                  <SelectValue placeholder="请选择报错类型" />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="block">
                        <span className="font-medium text-text-primary dark:text-white">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-text-tertiary dark:text-slate-400">
                          {option.description}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary dark:text-slate-200">
                报错内容
              </label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="请尽量描述题目哪里有问题，例如答案错误、题干缺字、公式渲染异常等。"
                className="min-h-[150px] rounded-[24px] border-borderTone bg-surface px-4 py-3 text-sm leading-6 text-text-primary placeholder:text-text-tertiary dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          <DialogFooter className="border-t border-borderTone px-6 py-5 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-borderTone bg-transparent px-5"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button type="submit" className="rounded-2xl px-5" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : `提交报错${ISSUE_TYPE_LABELS[issueType] ? ` · ${ISSUE_TYPE_LABELS[issueType]}` : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
