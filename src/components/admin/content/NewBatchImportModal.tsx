'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { uploadSourceFile } from '@/actions/storage'
import { importFromPDF, importFromWebUrl } from '@/actions/content-pipeline/import-service'
import { MAX_PDF_SIZE } from '@/lib/content-pipeline/import-utils'
import type { BatchData } from '@/types/content-pipeline'

type ImportFormValues = {
  importMethod: 'FILE_UPLOAD' | 'WEB_URL'
  subjectId: string
  source: string
  isPastPaper: boolean
  pageUrl?: string
  maxQuestions?: string
}

const importSchema = z
  .object({
    importMethod: z.enum(['FILE_UPLOAD', 'WEB_URL']),
    subjectId: z.string().min(1, '请选择科目'),
    source: z.string().min(2, '来源备注至少需要2个字符').max(100),
    isPastPaper: z.boolean().default(false),
    pageUrl: z.string().optional(),
    maxQuestions: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.importMethod !== 'WEB_URL') return

    const pageUrl = values.pageUrl?.trim() || ''
    if (!pageUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '请输入网页链接',
        path: ['pageUrl'],
      })
      return
    }

    if (!/^https?:\/\/www\.examcoo\.com\/editor\/do\/view\/id\/\d+/i.test(pageUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '当前仅支持 Examcoo 试卷链接（/editor/do/view/id/{id}）',
        path: ['pageUrl'],
      })
    }

    if (values.maxQuestions && values.maxQuestions.trim()) {
      const n = Number(values.maxQuestions)
      if (!Number.isFinite(n) || n <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '抓取题数上限必须是大于 0 的数字',
          path: ['maxQuestions'],
        })
      }
    }
  })

interface NewBatchImportModalProps {
  isOpen: boolean
  onClose: () => void
  subjects: Array<{ id: string; name: string }>
  onImportQueued?: (batch: BatchData) => void
  onImportQueueFailed?: (batchId: string) => void
  onImportSuccess?: () => void
}

const IMPORT_METHODS = [
  {
    key: 'FILE_UPLOAD' as const,
    title: '文件上传（PDF/图像）',
    description: '上传本地文件，走 OCR + AI 结构化导入。',
    badge: 'AI Pipeline',
  },
  {
    key: 'WEB_URL' as const,
    title: '网页链接抓取',
    description: '输入 Examcoo 试卷链接，抓取题目/答案/解析/题图。',
    badge: 'Script Crawl',
  },
]

export function NewBatchImportModal({
  isOpen,
  onClose,
  subjects,
  onImportQueued,
  onImportQueueFailed,
  onImportSuccess,
}: NewBatchImportModalProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importSchema) as unknown as Resolver<ImportFormValues>,
    defaultValues: {
      importMethod: 'FILE_UPLOAD',
      subjectId: '',
      source: '',
      isPastPaper: false,
      pageUrl: '',
      maxQuestions: '',
    },
  })

  const importMethod = form.watch('importMethod')

  const createOptimisticBatch = (values: ImportFormValues): BatchData => {
    const subjectName =
      subjects.find((subject) => subject.id === values.subjectId)?.name || '未知科目'

    return {
      id: `temp-${Date.now()}`,
      name: values.source,
      fileCount: 1,
      subject: subjectName,
      curriculum: 'UEC',
      progress: 1,
      status: 'Queued',
      statusMessage: '任务已入队，等待开始抓取...',
      createdAt: new Date(),
      questionsCount: 0,
      sourceRemark: values.source,
      sourceFileUrl:
        values.importMethod === 'WEB_URL' ? values.pageUrl?.trim() || undefined : undefined,
      events: ['IMPORT_TASK_CREATED'],
      importDiagnostics: {
        currentStage: 'QUEUING',
        currentStageLabel: '等待处理',
        statusSummary: '任务已入队，等待前序抓取任务完成...',
        overallProgress: 1,
        stageProgress: 0,
      },
    }
  }

  const resetState = () => {
    form.reset({
      importMethod: 'FILE_UPLOAD',
      subjectId: '',
      source: '',
      isPastPaper: false,
      pageUrl: '',
      maxQuestions: '',
    })
    setFile(null)
    setIsUploading(false)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.size > MAX_PDF_SIZE) {
      toast({
        variant: 'destructive',
        title: '文件过大',
        description: `文件大小不能超过 ${MAX_PDF_SIZE / 1024 / 1024}MB`,
      })
      return
    }
    setFile(selectedFile)
  }

  async function onSubmit(values: ImportFormValues) {
    if (values.importMethod === 'FILE_UPLOAD' && !file) {
      toast({
        variant: 'destructive',
        title: '未选择文件',
        description: '请先上传题目源文件 (PDF/图片)',
      })
      return
    }

    try {
      if (values.importMethod === 'WEB_URL') {
        setIsUploading(true)
        const optimisticBatch = createOptimisticBatch(values)
        const payload = {
          pageUrl: values.pageUrl!.trim(),
          subjectId: values.subjectId,
          source: values.source,
          isPastPaper: values.isPastPaper,
          maxQuestions: values.maxQuestions?.trim() ? Number(values.maxQuestions) : undefined,
        }
        // 网页导入点击后直接返回任务列表，状态在列表中查看
        onImportQueued?.(optimisticBatch)
        onClose()
        resetState()
        try {
          const importRes = await importFromWebUrl(payload)
          if (!importRes.success || !importRes.data) {
            throw new Error(importRes.error || '网页导入失败')
          }

          toast({
            title: '任务已入队',
            description: '请在批量任务管理查看排队与抓取进度。',
          })
          onImportSuccess?.()

          void fetch('/api/admin/content/import/consume', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({ trigger: 'web-import-queue' }),
          }).catch(() => undefined)
        } catch (error) {
          onImportQueueFailed?.(optimisticBatch.id)
          throw error
        }

        return
      }

      setIsUploading(true)
      const selectedFile = file as File
      const payload = {
        subjectId: values.subjectId,
        source: values.source,
        isPastPaper: values.isPastPaper,
      }
      const optimisticBatch = createOptimisticBatch(values)

      // 文件导入点击后也直接返回任务列表，进度统一在批量任务管理中查看
      onImportQueued?.(optimisticBatch)
      onClose()
      resetState()
      toast({
        title: '任务已提交',
        description: '请在批量任务管理查看导入进度和状态。',
      })

      void (async () => {
        try {
          const formData = new FormData()
          formData.append('file', selectedFile)

          const uploadRes = await uploadSourceFile(formData)
          if (!uploadRes.success || !uploadRes.url) {
            throw new Error(uploadRes.error || '文件上传失败')
          }

          const importRes = await importFromPDF({
            pdfUrl: uploadRes.url,
            subjectId: payload.subjectId,
            source: payload.source,
            isPastPaper: payload.isPastPaper,
          })

          if (!importRes.success || !importRes.data) {
            throw new Error(importRes.error || '导入失败')
          }

          toast({
            title: '任务已入队',
            description: '请在批量任务管理查看排队与导入进度。',
          })

          void fetch('/api/admin/content/import/consume', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify({ trigger: 'file-import-queue' }),
          }).catch(() => undefined)
        } catch (error) {
          onImportQueueFailed?.(optimisticBatch.id)
          const message = error instanceof Error ? error.message : '未知错误'
          toast({
            variant: 'destructive',
            title: '导入失败',
            description: message,
          })
        } finally {
          onImportSuccess?.()
        }
      })()

      return
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误'
      toast({
        variant: 'destructive',
        title: '导入失败',
        description: message,
      })
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Upload className="h-6 w-6 text-primary" />
            批量导入 AI
          </DialogTitle>
          <DialogDescription>支持文件导入（PDF/图像）与网页链接抓取，两种方式可切换。</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 pt-4 desktop:grid-cols-3">
          <div className="space-y-6 desktop:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="importMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>导入方式</FormLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {IMPORT_METHODS.map((method) => {
                          const active = field.value === method.key
                          return (
                            <button
                              key={method.key}
                              type="button"
                              className={`text-left p-4 rounded-xl border transition-all ${
                                active
                                  ? 'border-borderTone bg-surface-selected dark:border-borderTone dark:bg-surface-selected'
                                  : 'border-borderTone dark:border-borderTone hover:border-[hsl(var(--border-strong))]'
                              }`}
                              onClick={() => field.onChange(method.key)}
                              disabled={isUploading}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-text-primary dark:text-text-primary">{method.title}</span>
                                <Badge variant={active ? 'default' : 'secondary'}>{method.badge}</Badge>
                              </div>
                              <p className="text-xs text-text-secondary dark:text-text-secondary">{method.description}</p>
                            </button>
                          )
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>所属科目</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="选择科目" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>来源备注 (必填)</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：七年级上册第一阶段综合质量检测题" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">用于题库检索与导入追踪</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPastPaper"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-xl border border-borderTone bg-surface-subtle p-4 dark:border-borderTone dark:bg-surface-subtle">
                      <div className="space-y-1">
                        <FormLabel className="mb-0">真题标签（当前关闭）</FormLabel>
                        <FormDescription className="text-xs">
                          当前版本统一归入普通练习池，真题标签暂不写入数据库。
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {importMethod === 'FILE_UPLOAD' ? (
                  <div className="space-y-2">
                    <FormLabel>题目源文件 (PDF / 图片)</FormLabel>
                    <div
                      className={`group relative border-2 border-dashed rounded-xl p-8 transition-all text-center ${
                        file
                          ? 'border-borderTone bg-surface-selected dark:border-borderTone dark:bg-surface-selected'
                          : 'border-borderTone dark:border-borderTone hover:border-[hsl(var(--border-strong))] bg-surface dark:bg-surface'
                      }`}
                    >
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="application/pdf,image/jpeg,image/png,image/webp"
                        onChange={onFileChange}
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`flex flex-col items-center cursor-pointer ${
                          isUploading ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                      >
                        {file ? (
                          <div className="relative">
                            <div className="w-16 h-16 rounded-xl bg-[hsl(var(--state-info-bg))] dark:bg-[hsl(var(--state-info-bg))] flex items-center justify-center mb-3 border border-borderTone dark:border-borderTone">
                              <FileText className="h-8 w-8 text-[hsl(var(--state-info-fg))] dark:text-[hsl(var(--state-info-fg))]" />
                            </div>
                            <span className="font-semibold text-text-primary dark:text-text-primary block max-w-xs truncate">
                              {file.name}
                            </span>
                            <Badge variant="secondary" className="mt-2">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </Badge>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-xl bg-surface dark:bg-surface-subtle flex items-center justify-center mb-3 border border-borderTone dark:border-borderTone shadow-sm group-hover:scale-110 transition-transform">
                              <Upload className="h-8 w-8 text-text-tertiary group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-base font-semibold text-text-secondary dark:text-text-secondary">
                              点击或拖拽文件上传
                            </span>
                            <span className="text-sm text-text-tertiary mt-2">
                              支持 PDF / JPG / PNG / WEBP (最大 {MAX_PDF_SIZE / 1024 / 1024}MB)
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="pageUrl"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>网页链接</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.examcoo.com/editor/do/view/id/2430396" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">当前仅支持 Examcoo 试卷 view 链接</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxQuestions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>抓取题数上限</FormLabel>
                          <FormControl>
                            <Input placeholder="留空=全部" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">建议先小批量验证</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button variant="ghost" type="button" onClick={onClose} disabled={isUploading}>
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploading || (importMethod === 'FILE_UPLOAD' && !file)}
                  >
                    {isUploading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        提交任务中...
                      </span>
                    ) : (
                      '开始导入'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <div className="desktop:col-span-1">
            <Card className="bg-gradient-to-br from-surface to-surface-muted dark:from-surface dark:to-surface-subtle text-text-primary dark:text-text-primary border-borderTone dark:border-borderTone shadow-surface-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[hsl(var(--state-warning-fg))] fill-[hsl(var(--state-warning-fg))]" />
                  导入指南
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-subtle dark:bg-surface-subtle flex items-center justify-center shrink-0 border border-borderTone dark:border-borderTone">
                    <CheckCircle2 className="h-4 w-4 text-[hsl(var(--state-success-fg))] dark:text-[hsl(var(--state-success-fg))]" />
                  </div>
                  <p className="text-text-secondary dark:text-text-secondary leading-relaxed">
                    <span className="text-text-primary dark:text-text-primary font-semibold">多方式导入</span>
                    ：支持 PDF/图像 与网页链接抓取，可按场景切换。
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-subtle dark:bg-surface-subtle flex items-center justify-center shrink-0 border border-borderTone dark:border-borderTone">
                    <CheckCircle2 className="h-4 w-4 text-[hsl(var(--state-success-fg))] dark:text-[hsl(var(--state-success-fg))]" />
                  </div>
                  <p className="text-text-secondary dark:text-text-secondary leading-relaxed">
                    <span className="text-text-primary dark:text-text-primary font-semibold">图案保留</span>
                    ：抓取时会解析题图链接并写入题目主图字段。
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-subtle dark:bg-surface-subtle flex items-center justify-center shrink-0 border border-borderTone dark:border-borderTone">
                    <AlertCircle className="h-4 w-4 text-[hsl(var(--state-warning-fg))] dark:text-[hsl(var(--state-warning-fg))]" />
                  </div>
                  <p className="text-text-secondary dark:text-text-secondary leading-relaxed">
                    <span className="text-text-primary dark:text-text-primary font-semibold">审核入库</span>
                    ：导入后题目先进入 <span className="text-primary dark:text-primary font-semibold">待审核</span> 状态，skills 会先自动清洗并判定；无法自动处理的题目再进入人工复核。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
