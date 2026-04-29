'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Loader2, Upload } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface AvatarUploadProps {
  currentAvatar: string | null
  username: string
  onUpload: (url: string) => void
}

export function AvatarUpload({
  currentAvatar,
  username,
  onUpload,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentAvatar)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('请选择一张图片再上传。')
      }

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

      if (data) {
        setPreview(data.publicUrl)
        onUpload(data.publicUrl)
        toast({
          title: '头像已上传',
          description: '头像已更新，记得保存资料。',
        })
      }
    } catch (error) {
      toast({
        title: '上传失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24 border-2 border-slate-200">
        <AvatarImage src={preview || ''} alt={username} />
        <AvatarFallback className="border border-slate-200 bg-slate-50 text-2xl text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          {username?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-2">
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          上传头像
        </Button>
      </div>
    </div>
  )
}
