'use server'

import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import { getCurrentUser } from '@/actions/auth'
import prisma from '@/lib/prisma'

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

interface GetVideoUrlResult {
  success: boolean
  url?: string
  error?: string
}

export async function getSignedVideoUrl(lessonId: string): Promise<GetVideoUrlResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      console.warn('getSignedVideoUrl: User not authenticated')
      return { success: false, error: 'Unauthorized' }
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { videoUrl: true }
    })

    if (!lesson || !lesson.videoUrl) {
      console.warn('getSignedVideoUrl: Video URL not found in DB', lesson)
      return { success: false, error: 'Video not found' }
    }

    // If it's already a full URL (external), return it
    if (lesson.videoUrl.startsWith('http')) {
      return { success: true, url: lesson.videoUrl }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.storage
      .from('videos')
      .createSignedUrl(lesson.videoUrl, 3600) // 1 hour validity

    if (error) {
      console.error('Sign URL error:', error)
      return { success: false, error: error.message }
    }

    console.warn('getSignedVideoUrl: Success', data.signedUrl)
    return { success: true, url: data.signedUrl }

  } catch (error: unknown) {
    console.error('Unexpected error fetching video URL:', error)
    let message = 'An unknown error occurred.'
    if (error instanceof Error) {
      message = error.message
    }
    return { success: false, error: message }
  }
}
