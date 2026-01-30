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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Zap, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { uploadSourceFile } from '@/actions/storage'
import { importFromPDF } from '@/actions/content-pipeline/import-service'
import { MAX_PDF_SIZE } from '@/lib/content-pipeline/import-utils'

const importSchema = z.object({
  subjectId: z.string().min(1, '请选择科目'),
  source: z.string().min(2, '来源标识至少需要2个字符').max(100),
  sourceYear: z.string().optional(),
  sourcePaper: z.string().optional(),
})

type ImportFormValues = z.infer<typeof importSchema>

interface NewBatchImportModalProps {
  isOpen: boolean
  onClose: () => void
  subjects: any[]
  onImportSuccess?: () => void
}

export function NewBatchImportModal({
  isOpen,
  onClose,
  subjects,
  onImportSuccess,
}: NewBatchImportModalProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<string>('')

  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      subjectId: '',
      source: '',
      sourceYear: new Date().getFullYear().toString(),
      sourcePaper: '',
    },
  })

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
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
  }

  async function onSubmit(values: ImportFormValues) {
    if (!file) {
      toast({
        variant: 'destructive',
        title: '未选择文件',
        description: '请先上传题目源文件 (PDF/图片)',
      })
      return
    }

    setIsUploading(true)
    setImportProgress(10)
    setImportStatus('正在上传文件...')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await uploadSourceFile(formData)
      if (!uploadRes.success || !uploadRes.url) {
        throw new Error(uploadRes.error || '文件上传失败')
      }

      setImportProgress(30)
      setImportStatus('解析中...')

      const progressInterval = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 2
        })
      }, 1000)

      const importRes = await importFromPDF({
        pdfUrl: uploadRes.url,
        subjectId: values.subjectId,
        source: values.source,
        sourceYear: values.sourceYear ? parseInt(values.sourceYear) : undefined,
        sourcePaper: values.sourcePaper,
      })

      clearInterval(progressInterval)

      if (importRes.success && importRes.data) {
        setImportProgress(100)
        setImportStatus('成功！')

        toast({
          title: '导入完成',
          description: `成功创建 ${importRes.data.questionsCreated} 道题目。`,
        })

        setTimeout(() => {
          onClose()
          onImportSuccess?.()
          // Reset form
          form.reset()
          setFile(null)
          setImportProgress(0)
          setImportStatus('')
        }, 1500)
      } else {
        throw new Error(importRes.error || '导入失败')
      }
    } catch (error: any) {
      setImportStatus(`失败: ${error.message}`)
      toast({
        variant: 'destructive',
        title: '导入失败',
        description: error.message,
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Upload className="h-6 w-6 text-blue-600" />
            批量导入 AI
          </DialogTitle>
          <DialogDescription>上传试卷图片，开启 AI 自动化题目识别（暂不支持 PDF，请先转为图片）</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          {/* Main Form - Left 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Meta Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="sourceYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>年份</FormLabel>
                        <FormControl>
                          <Input placeholder="2024" {...field} />
                        </FormControl>
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
                      <FormLabel>来源标识 (必填)</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：2023年中考数学真题" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">用于在题库中快速搜索来源</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Upload Area */}
                <div className="space-y-2">
                  <FormLabel>题目源文件 (PDF / 图片)</FormLabel>
                  <div
                    className={`group relative border-2 border-dashed rounded-xl p-8 transition-all text-center ${
                      file
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50 dark:bg-slate-900'
                    }`}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
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
                          <div className="w-16 h-16 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-3 border border-blue-200 dark:border-blue-800">
                            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white block max-w-xs truncate">
                            {file.name}
                          </span>
                          <Badge variant="secondary" className="mt-2">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center mb-3 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-110 transition-transform">
                            <Upload className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
                            点击或拖拽文件上传
                          </span>
                          <span className="text-sm text-slate-500 mt-2">
                            支持 JPG, PNG, WEBP (最大 {MAX_PDF_SIZE / 1024 / 1024}MB)
                          </span>
                          <span className="text-xs text-orange-600 dark:text-orange-400 mt-1 block">
                            ⚠️ 暂不支持 PDF，请先转换为图片格式
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Progress Indicator */}
                {isUploading && (
                  <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {importStatus}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">
                        {importProgress}%
                      </span>
                    </div>
                    <div className="h-2 bg-blue-100 dark:bg-blue-900/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button variant="ghost" type="button" onClick={onClose} disabled={isUploading}>
                    取消
                  </Button>
                  <Button type="submit" disabled={isUploading || !file}>
                    {isUploading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        正在导入...
                      </span>
                    ) : (
                      '开始 AI 导入'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Guide - Right 1/3 */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  导入指南
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    <span className="text-white font-semibold">高精度识别</span>
                    ：AI 将自动拆分题干、选项、正确答案及详细解析。
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    <span className="text-white font-semibold">公式支持</span>
                    ：完美支持 LaTeX 数学公式，自动转换为渲染格式。
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                    <AlertCircle className="h-4 w-4 text-orange-400" />
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    <span className="text-white font-semibold">审核入库</span>
                    ：导入后题目进入{' '}
                    <span className="text-blue-400 font-semibold">待审核</span>{' '}
                    状态，需人工确认后发布。
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
