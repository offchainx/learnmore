'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { FileUpload } from '@/components/ui/file-upload'
import { importFromPDF } from '@/actions/content-pipeline/import-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/ui/use-toast' // or sonner
import { ImportHistoryTable, ImportTask } from '@/components/admin/ImportHistoryTable'

interface Subject {
  id: string
  name: string
}

interface ImportFormProps {
  subjects: Subject[]
  initialTasks: ImportTask[]
}

export function ImportForm({ subjects, initialTasks }: ImportFormProps) {
  const router = useRouter()
  const [uploading, setUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [progressMessage, setProgressMessage] = React.useState('')
  
  const [selectedSubject, setSelectedSubject] = React.useState<string>('')
  const [yearInput, setYearInput] = React.useState<string>(new Date().getFullYear().toString())
  const [sourceInput, setSourceInput] = React.useState<string>('')

  const handleFileUpload = async (file: File) => {
    if (!selectedSubject) {
      toast({
        title: "请先选择科目",
        variant: "destructive"
      })
      return
    }

    setUploading(true)
    setProgress(0)
    setProgressMessage('正在上传文件...')

    try {
      // 1. 上传到 Supabase Storage
      const supabase = createClient()
      const filename = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('source-files')
        .upload(`uploads/${filename}`, file, {
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('source-files')
        .getPublicUrl(data.path)

      // 2. 触发导入流程
      setProgress(20)
      setProgressMessage('文件上传成功，正在开始处理...')

      // Note: In a real app with progress updates, we'd need a different mechanism
      // since Server Actions don't stream progress easily.
      // For now we just await the result.
      const result = await importFromPDF({
        pdfUrl: publicUrl,
        subjectId: selectedSubject,
        source: sourceInput,
        sourceYear: parseInt(yearInput) || undefined
      })

      if (result.success && result.data) {
        setProgress(100)
        setProgressMessage('处理完成！')
        toast({
          title: "导入成功",
          description: `成功导入 ${result.data.questionsCreated} 道题目`
        })
        router.refresh()
      } else {
        throw new Error(result.error || '导入失败')
      }

    } catch (error) {
      console.error('Import failed:', error)
      toast({
        title: "导入失败",
        description: error instanceof Error ? error.message : '未知错误',
        variant: "destructive"
      })
      setProgressMessage('导入失败')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>上传源文件</CardTitle>
          <CardDescription>
            支持 PDF、图片（JPG/PNG）格式，单个文件最大 50MB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept="application/pdf,image/png,image/jpeg"
            onUpload={handleFileUpload}
            disabled={uploading}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>科目</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="选择科目" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>年份</Label>
              <Input 
                type="number" 
                placeholder="2023" 
                value={yearInput}
                onChange={(e) => setYearInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>来源标识</Label>
            <Input 
              placeholder="例如：2023年中考数学真题" 
              value={sourceInput}
              onChange={(e) => setSourceInput(e.target.value)}
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">
                {progressMessage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>最近导入</CardTitle>
        </CardHeader>
        <CardContent>
          <ImportHistoryTable tasks={initialTasks} />
        </CardContent>
      </Card>
    </div>
  )
}
