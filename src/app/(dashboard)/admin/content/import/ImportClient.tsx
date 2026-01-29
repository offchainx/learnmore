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
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Zap, Layers, Sparkles } from "lucide-react"
import Link from "next/link"
import { uploadSourceFile } from "@/actions/storage"
import { importFromPDF, getImportTasks } from "@/actions/content-pipeline/import-service"
import { getAllSubjects } from "@/actions/subject"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { AdminClientWrapper } from "@/components/admin/AdminClientWrapper"
import { MAX_PDF_SIZE } from "@/lib/content-pipeline/import-utils"

// ==================== 表单 Schema ====================

const importSchema = z.object({
  subjectId: z.string().min(1, "请选择科目"),
  source: z.string().min(2, "来源标识至少需要2个字符").max(100),
  sourceYear: z.string().optional(),
  sourcePaper: z.string().optional(),
})

type ImportFormValues = z.infer<typeof importSchema>

interface ImportClientProps {
  userRole: string
  initialSubjects: any[]
  initialHistory: any[]
}

export function ImportClient({ userRole, initialSubjects, initialHistory }: ImportClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // 状态管理
  const [subjects, setSubjects] = useState<any[]>(initialSubjects)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<string>("")
  const [history, setHistory] = useState<any[]>(initialHistory)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

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

  // 处理文件选择
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > MAX_PDF_SIZE) {
        toast({
          variant: "destructive",
          title: "文件过大",
          description: `文件大小不能超过 ${MAX_PDF_SIZE / 1024 / 1024}MB`,
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
    setImportStatus("正在上传文件...")

    try {
      const formData = new FormData()
      formData.append("file", file)
      
      const uploadRes = await uploadSourceFile(formData)
      if (!uploadRes.success || !uploadRes.url) {
        throw new Error(uploadRes.error || "文件上传失败")
      }

      setImportProgress(30)
      setImportStatus("解析中...")

      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
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
        setImportStatus("成功！")
        
        toast({
          title: "导入完成",
          description: `成功创建 ${importRes.data.questionsCreated} 道题目。`,
        })

        setTimeout(() => {
          router.push("/admin/content")
        }, 1500)
      } else {
        throw new Error(importRes.error || "导入失败")
      }

    } catch (error: any) {
      setImportStatus(`失败: ${error.message}`)
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
    <AdminClientWrapper userRole={userRole}>
      <div className="min-h-screen py-10 px-4">
        <div className="container mx-auto space-y-8 max-w-6xl">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/content" 
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  批量导入 <span className="text-blue-600 dark:text-blue-400">AI</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  上传试卷，开启 AI 自动化题目识别
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 fill-blue-600/20" />
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">AI Pipeline v1.0</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Main Form Area */}
            <div className="lg:col-span-8 space-y-8">
              <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600/5 to-indigo-600/5 border-b border-slate-100 dark:border-slate-800 p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                      <Layers className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">上传题目源文件</CardTitle>
                      <CardDescription>配置相关元数据以提高 AI 识别准确率</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      
                      {/* Meta Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="subjectId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 dark:text-slate-300 font-bold">所属科目</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="rounded-2xl h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                    <SelectValue placeholder="选择科目" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
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
                              <FormLabel className="text-slate-700 dark:text-slate-300 font-bold">年份</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="2024" 
                                  {...field} 
                                  className="rounded-2xl h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-blue-500" 
                                />
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
                            <FormLabel className="text-slate-700 dark:text-slate-300 font-bold">来源标识 (必填)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="例如：2023年中考数学真题" 
                                {...field} 
                                className="rounded-2xl h-12 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-blue-500"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">用于在题库中快速搜索来源</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Upload Area */}
                      <div className="space-y-3">
                        <FormLabel className="text-slate-700 dark:text-slate-300 font-bold">题目源文件 (PDF / 图片)</FormLabel>
                        <div 
                          className={`group relative border-2 border-dashed rounded-3xl p-12 transition-all text-center ${
                            file 
                              ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20' 
                              : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-900 bg-slate-50/30 dark:bg-slate-950/30'
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
                              <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4 border border-blue-200 dark:border-blue-800 shadow-inner">
                                  <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-bold text-slate-900 dark:text-white block max-w-xs truncate">{file.name}</span>
                                <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-none">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </Badge>
                              </div>
                            ) : (
                              <>
                                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                  <Upload className="h-10 w-10 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">点击或拖拽文件上传</span>
                                <span className="text-sm text-slate-500 mt-2">支持 PDF, JPG, PNG (最大 {MAX_PDF_SIZE / 1024 / 1024}MB)</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>

                      {/* Progress Indicator */}
                      {isUploading && (
                        <div className="space-y-4 p-6 bg-blue-50/50 dark:bg-blue-950/20 rounded-3xl border border-blue-100/50 dark:border-blue-900/30 animate-in fade-in slide-in-from-bottom-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {importStatus}
                            </span>
                            <span className="text-blue-600 dark:text-blue-400 font-extrabold">{importProgress}%</span>
                          </div>
                          <div className="h-3 bg-blue-100 dark:bg-blue-900/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
                              style={{ width: `${importProgress}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-2 text-blue-600/70 dark:text-blue-400/70 text-xs">
                            <Sparkles className="h-3 w-3" />
                            <span>AI 正在分析文档内容，请稍候...</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-4 pt-4">
                        <Button 
                          variant="ghost" 
                          type="button" 
                          asChild 
                          disabled={isUploading}
                          className="rounded-2xl h-12 px-8 font-bold text-slate-500"
                        >
                          <Link href="/admin/content">取消</Link>
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isUploading || !file}
                          className="rounded-2xl h-12 px-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                        >
                          {isUploading ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              正在导入...
                            </span>
                          ) : "开始 AI 导入"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar / History Area */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Guide Card */}
              <Card className="border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                    导入指南
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <span className="text-white font-bold">高精度识别</span>：AI 将自动拆分题干、选项、正确答案及详细解析。
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <span className="text-white font-bold">公式支持</span>：完美支持 LaTeX 数学公式，自动转换为渲染格式。
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <AlertCircle className="h-4 w-4 text-orange-400" />
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      <span className="text-white font-bold">审核入库</span>：导入后题目进入 <span className="text-blue-400 font-bold underline underline-offset-4">待审核</span> 状态，需人工确认后发布。
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* History Card */}
              <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="pb-3 border-b border-slate-50 dark:border-slate-800">
                  <CardTitle className="text-lg">最近任务</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoadingHistory ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-2xl" />
                      ))}
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-400">暂无历史记录</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map(task => (
                        <div key={task.id} className="group relative p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-blue-500/20 hover:bg-white dark:hover:bg-slate-800 transition-all">
                          <div className="font-bold text-slate-900 dark:text-white truncate text-sm mb-2" title={task.filename}>
                            {task.filename}
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge 
                              variant="secondary" 
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold border-none ${
                                task.status === 'COMPLETED' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                  : task.status === 'FAILED' 
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}
                            >
                              {task.status === 'COMPLETED' ? '成功' : task.status === 'FAILED' ? '失败' : '处理中'}
                            </Badge>
                            <span className="text-[10px] font-medium text-slate-400 italic">
                              {format(new Date(task.createdAt), 'MM-dd HH:mm')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button variant="ghost" className="w-full mt-4 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    查看全部记录
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminClientWrapper>
  )
}

// 辅助组件：Label
function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={`text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>{children}</label>
}
