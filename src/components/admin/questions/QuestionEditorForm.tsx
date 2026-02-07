'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { QuestionType } from '@prisma/client'
import { Loader2, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'

import { RichTextEditor } from '../common/RichTextEditor'
import { QuestionPreview } from './QuestionPreview'
import { updateQuestion } from '@/actions/content-pipeline/question-service'
import type { QuestionWithRelations } from '@/lib/content-pipeline/types'

// Define schema
const formSchema = z.object({
  content: z.string().min(1, '题目内容不能为空'),
  type: z.nativeEnum(QuestionType),
  difficulty: z.number().min(1).max(5),
  explanation: z.string().optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  // For options and answers, we'll handle them manually in the form state for flexibility
  // as they depend heavily on the type
})

interface QuestionEditorFormProps {
  question: QuestionWithRelations
}

export function QuestionEditorForm({ question }: QuestionEditorFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  // Options and Answer State
  const [options, setOptions] = useState<Record<string, string>>(
    (question.options as Record<string, string>) || {}
  )
  const [answer, setAnswer] = useState<any>(question.answer)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: question.content,
      type: question.type,
      difficulty: question.difficulty,
      explanation: question.explanation || '',
      qualityScore: question.qualityScore || 0,
    },
  })

  // Watch values for preview
  const watchedValues = form.watch()

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      // Validate answer based on type
      if ((values.type === 'SINGLE_CHOICE' || values.type === 'MULTIPLE_CHOICE') && Object.keys(options).length < 2) {
        throw new Error('选择题至少需要2个选项')
      }
      if (!answer) {
        throw new Error('请设置正确答案')
      }

      const result = await updateQuestion(question.id, {
        ...values,
        options: (values.type === 'SINGLE_CHOICE' || values.type === 'MULTIPLE_CHOICE') ? options : null,
        answer: answer,
      })

      if (result.success) {
        toast({
          title: '保存成功',
          description: '题目内容已更新',
        })
        router.refresh()
        router.push(`/admin/content/${question.id}`)
      } else {
        throw new Error(result.error || '保存失败')
      }
    } catch (error) {
      toast({
        title: '操作失败',
        description: error instanceof Error ? error.message : '保存失败',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper to construct preview object
  const previewQuestion: QuestionWithRelations = {
    ...question,
    ...watchedValues,
    options,
    answer,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">编辑题目</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? '隐藏预览' : '显示预览'}
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            保存更改
          </Button>
        </div>
      </div>

      <div className={cn("grid gap-6", showPreview ? "lg:grid-cols-2" : "grid-cols-1")}>
        {/* Editor Column */}
        <div className="space-y-6">
          <Form {...form}>
            <form className="space-y-6">
              
              <Card>
                <CardContent className="p-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>题型</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择题型" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(QuestionType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>难度系数 ({field.value})</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="py-4"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qualityScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>质量分数 (0-100)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>题目内容 (Markdown + LaTeX)</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="输入题目内容..."
                            rows={15}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Options Editor (Only for Choice Questions) */}
              {(watchedValues.type === 'SINGLE_CHOICE' || watchedValues.type === 'MULTIPLE_CHOICE') && (
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <FormLabel>选项管理</FormLabel>
                    <div className="space-y-3">
                      {['A', 'B', 'C', 'D'].map((key) => (
                        <div key={key} className="flex gap-2">
                          <div className="flex items-center justify-center w-10 h-10 border rounded bg-muted font-bold shrink-0">
                            {key}
                          </div>
                          <Input
                            value={options[key] || ''}
                            onChange={(e) => {
                              const newOptions = { ...options }
                              if (e.target.value) {
                                newOptions[key] = e.target.value
                              } else {
                                delete newOptions[key]
                              }
                              setOptions(newOptions)
                            }}
                            placeholder={`选项 ${key} 内容`}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Answer Editor */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <FormLabel>正确答案</FormLabel>
                  
                  {watchedValues.type === 'SINGLE_CHOICE' ? (
                    <Select 
                      value={answer as string} 
                      onValueChange={setAnswer}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择正确答案" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(options).sort().map(key => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : watchedValues.type === 'MULTIPLE_CHOICE' ? (
                     <div className="flex gap-4 flex-wrap">
                       {Object.keys(options).sort().map(key => (
                         <Button
                           key={key}
                           type="button"
                           variant={(Array.isArray(answer) && answer.includes(key)) ? "default" : "outline"}
                           onClick={() => {
                             let newAnswer = Array.isArray(answer) ? [...answer] : []
                             if (newAnswer.includes(key)) {
                               newAnswer = newAnswer.filter(k => k !== key)
                             } else {
                               newAnswer.push(key)
                               newAnswer.sort()
                             }
                             setAnswer(newAnswer)
                           }}
                         >
                           {key}
                         </Button>
                       ))}
                     </div>
                  ) : (
                    <Input 
                      value={typeof answer === 'string' ? answer : JSON.stringify(answer)}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="输入答案"
                    />
                  )}
                </CardContent>
              </Card>

              {/* TODO: Implement Tag and Knowledge Point editing. 
                  Currently backend updateQuestion action does not support relation updates for tags/KPs. 
                  Need to update 'src/actions/content-pipeline/question-service.ts' to handle 'tags' and 'knowledgePoints' in 'data'.
              */}

              <Card>
                <CardContent className="p-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="explanation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>解析</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="输入题目解析..."
                            rows={8}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

            </form>
          </Form>
        </div>

        {/* Preview Column */}
        {showPreview && (
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">实时预览</h3>
                <Separator className="mb-4" />
                <QuestionPreview question={previewQuestion} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
