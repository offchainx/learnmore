'use client'

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { uploadSourceFile } from "@/actions/storage"
import { importFromPDF, getImportTasks } from "@/actions/content-pipeline/import-service"
import { getAllSubjects } from "@/actions/subject"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

// ==================== 表单 Schema ====================

const importSchema = z.object({
  subjectId: z.string().min(1, "请选择科目"),
  source: z.string().min(2, "来源标识至少需要2个字符").max(100),
  sourceYear: z.string().optional(),
  sourcePaper: z.string().optional(),
})

type ImportFormValues = z.infer<typeof importSchema>

// ==================== 页面组件 ====================

export default function ContentImportPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // 状态管理
  const [subjects, setSubjects] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<string>("")
  const [history, setHistory] = useState<any[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  // 初始化表单
  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importSchema),
    defaultValues: {
      subjectId: "",
      source: "",
      sourceYear: new Date().getFullYear().toString(),
      sourcePaper: "",
    },
  })

  // 加载初始数据
  useEffect(() => {
    async function init() {
      const [subjectsRes, historyRes] = await Promise.all([
        getAllSubjects(),
        getImportTasks({ limit: 5 })
      ])

      if (subjectsRes.success) {
        setSubjects(subjectsRes.data || [])
      }

      if (historyRes.success && historyRes.data) {
        setHistory(historyRes.data.tasks)
      }
      setIsLoadingHistory(false)
    }
    init()
  }, [])

  // 处理文件选择
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "文件过大",
          description: "文件大小不能超过 50MB",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  // 提交导入
  async function onSubmit(values: ImportFormValues) {
    if (!file) {
      toast({
        variant: "destructive",
        title: "未选择文件",
        description: "请先上传题目源文件 (PDF/图片)",
      })
      return
    }

    setIsUploading(true)
    setImportProgress(10)
    setImportStatus("正在上传文件到存储服务器...")

    try {
      // 1. 上传文件
      const formData = new FormData()
      formData.append("file", file)
      
      const uploadRes = await uploadSourceFile(formData)
      if (!uploadRes.success || !uploadRes.url) {
        throw new Error(uploadRes.error || "文件上传失败")
      }

      setImportProgress(30)
      setImportStatus("文件上传成功，正在启动 AI 处理流水线...")

      // 2. 模拟进度 (因为 Server Action 无法流式传输)
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 2
        })
      }, 1000)

      // 3. 执行导入任务
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
        setImportStatus("导入成功！")
        
        toast({
          title: "导入完成",
          description: `成功创建 ${importRes.data.questionsCreated} 道题目，跳过 ${importRes.data.questionsDuplicated} 道重复题目。`,
        })

        // 延迟跳转
        setTimeout(() => {
          router.push("/admin/content")
        }, 2000)
      } else {
        throw new Error(importRes.error || "导入失败")
      }

    } catch (error: any) {
      setImportStatus(`导入失败: ${error.message}`)
      toast({
        variant: "destructive",
        title: "导入失败",
        description: error.message,
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-5xl">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/content">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">批量导入题目</h1>
          <p className="text-muted-foreground">
            上传 PDF 或图片试卷，AI 将自动识别并拆分为结构化题目。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左侧：上传表单 */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>上传配置</CardTitle>
              <CardDescription>
                请选择科目并上传源文件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="subjectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>科目</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择科目" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subjects.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
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
                          <FormLabel>年份 (可选)</FormLabel>
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
                        <FormLabel>来源标识</FormLabel>
                        <FormControl>
                          <Input placeholder="例如：2023年中考数学真题" {...field} />
                        </FormControl>
                        <FormDescription>用于追踪题目来源</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 文件上传区 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">源文件 (PDF 或图片)</Label>
                    <div 
                      className={`border-2 border-dashed rounded-xl p-8 transition-colors text-center ${
                        file ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="application/pdf,image/*"
                        onChange={onFileChange}
                        disabled={isUploading}
                      />
                      <label 
                        htmlFor="file-upload" 
                        className={`flex flex-col items-center cursor-pointer ${isUploading ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {file ? (
                          <>
                            <FileText className="h-12 w-12 text-blue-500 mb-4" />
                            <span className="font-medium text-blue-600">{file.name}</span>
                            <span className="text-xs text-slate-500 mt-1">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 text-slate-400 mb-4" />
                            <span className="text-sm font-medium">点击或拖拽文件到此处上传</span>
                            <span className="text-xs text-slate-500 mt-2">支持 PDF, JPG, PNG (最大 50MB)</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* 进度显示 */}
                  {isUploading && (
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
                          {importStatus}
                        </span>
                        <span className="text-slate-500">{importProgress}%</span>
                      </div>
                      <Progress value={importProgress} className="h-2" />
                      <p className="text-xs text-slate-400 italic">
                        提示: AI 处理可能需要几分钟时间，请勿关闭页面。
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" type="button" asChild disabled={isUploading}>
                      <Link href="/admin/content">取消</Link>
                    </Button>
                    <Button type="submit" disabled={isUploading || !file}>
                      {isUploading ? "正在导入..." : "开始导入"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：帮助与历史 */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">导入说明</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div className="flex space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <p>AI 将自动识别题目干、选项、答案和解析。</p>
              </div>
              <div className="flex space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <p>支持 LaTeX 数学公式自动转换。</p>
              </div>
              <div className="flex space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />
                <p>导入后请在“待审核”列表中检查识别结果。</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">最近导入历史</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="space-y-3">
                  <div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                  <div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">暂无历史记录</p>
              ) : (
                <div className="space-y-3">
                  {history.map(task => (
                    <div key={task.id} className="text-sm p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      <div className="font-medium truncate" title={task.filename}>{task.filename}</div>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant={task.status === 'COMPLETED' ? 'success' : task.status === 'FAILED' ? 'destructive' : 'secondary'}>
                          {task.status === 'COMPLETED' ? '成功' : task.status === 'FAILED' ? '失败' : '处理中'}
                        </Badge>
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(task.createdAt), 'MM-dd HH:mm')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// 辅助组件：Label (避免从 @/components/ui/label 导入失败)
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>
}
