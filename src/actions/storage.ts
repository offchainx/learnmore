'use server'

import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import { getCurrentUser } from '@/actions/auth'

interface UploadImageResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadImage(formData: FormData): Promise<UploadImageResult> {
  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: 'User not authenticated.' }
  }

  const file = formData.get('file') as File | null

  if (!file) {
    return { success: false, error: 'No file provided.' }
  }

  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'Only image files are allowed.' }
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    return { success: false, error: 'File size exceeds 5MB limit.' }
  }

  const supabase = await createClient()
  const fileExtension = file.name.split('.').pop()
  const fileName = `${uuidv4()}.${fileExtension}`
  const filePath = `posts/${user.id}/${fileName}`

  try {
    const { error: uploadError } = await supabase.storage
      .from('community-posts') // Updated bucket name
      .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return { success: false, error: uploadError.message }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('community-posts')
      .getPublicUrl(filePath)
      
    if (publicUrlData.publicUrl) {
      return { success: true, url: publicUrlData.publicUrl }
    } else {
      return { success: false, error: 'Failed to get public URL.' }
    }

  } catch (error: unknown) {
    console.error('Unexpected upload error:', error)
    let message = 'An unknown error occurred during upload.'
    if (error instanceof Error) {
      message = error.message
    }
    return { success: false, error: message }
  }
}
