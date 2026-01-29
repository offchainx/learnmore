'use client'

import * as React from 'react'
import { Upload, X, FileText, Image as ImageIcon, File } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  accept?: string
  maxSize?: number // in bytes
  onUpload?: (file: File) => void
  disabled?: boolean
}

export function FileUpload({
  className,
  accept = 'image/*,application/pdf',
  maxSize = 50 * 1024 * 1024, // 50MB
  onUpload,
  disabled = false,
  ...props
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    setIsDragging(false)
  }

  const validateFile = (file: File): boolean => {
    if (maxSize && file.size > maxSize) {
      setError(`文件大小超过限制 (${(maxSize / 1024 / 1024).toFixed(0)}MB)`)
      return false
    }
    
    // Simple MIME type check based on accept prop
    // This is not perfect but good enough for UI feedback
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim())
      const fileType = file.type
      const fileName = file.name.toLowerCase()
      
      const isValid = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          const mainType = type.split('/')[0]
          return fileType.startsWith(mainType)
        }
        if (type.startsWith('.')) {
          return fileName.endsWith(type.toLowerCase())
        }
        return fileType === type
      })

      if (!isValid) {
        setError('不支持的文件类型')
        return false
      }
    }

    setError(null)
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0]
      if (validateFile(droppedFile)) {
        setFile(droppedFile)
        onUpload?.(droppedFile)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
        onUpload?.(selectedFile)
      }
    }
  }

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null)
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />
    if (type.includes('image')) return <ImageIcon className="h-8 w-8 text-blue-500" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
        disabled && 'opacity-60 cursor-not-allowed',
        error && 'border-destructive/50 bg-destructive/5',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled}
      />

      {file ? (
        <div className="flex items-center gap-4 w-full max-w-sm p-4 bg-background rounded-md border shadow-sm">
          {getFileIcon(file.type)}
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={removeFile}
            className="p-1 hover:bg-muted rounded-full transition-colors"
            disabled={disabled}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-4 bg-muted/50 rounded-full">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              点击或拖拽文件到此处上传
            </p>
            <p className="text-xs text-muted-foreground">
              支持 PDF, JPG, PNG (最大 50MB)
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="absolute bottom-2 text-xs text-destructive font-medium">
          {error}
        </p>
      )}
    </div>
  )
}
