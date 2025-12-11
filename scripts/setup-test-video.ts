import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // 0. Ensure Bucket Exists
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.find(b => b.name === 'videos')

  if (!bucketExists) {
    console.warn("Bucket 'videos' not found. Creating it...")
    const { error: createError } = await supabase.storage.createBucket('videos', {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['video/mp4', 'video/webm']
    })

    if (createError) {
      console.error("Failed to create bucket:", createError)
      // Attempt to continue, might fail if permission issue
    } else {
        console.warn("Bucket 'videos' created.")
    }
  }

  // 1. Upload Video
  const videoPath = 'sample.mp4'
  const targetPath = 'lessons/test-video.mp4'
  
  if (!fs.existsSync(videoPath)) {
    console.error('sample.mp4 not found. Please run curl command first.')
    process.exit(1)
  }

  const fileContent = fs.readFileSync(videoPath)

  console.warn('Uploading video to Supabase Storage...')
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(targetPath, fileContent, {
      contentType: 'video/mp4',
      upsert: true
    })

  if (error) {
    console.error('Error uploading video:', error)
    // Continue anyway if it might already exist, or fail?
    // If error is "Duplicate", it's fine.
    if (!error.message.includes('already exists')) {
        process.exit(1)
    }
  } else {
    console.warn('Video uploaded successfully:', data?.path)
  }

  // 2. Update a Lesson in DB
  console.warn('Finding a lesson to update...')
  const lesson = await prisma.lesson.findFirst()

  if (!lesson) {
    console.error('No lessons found in database. Please seed the database first.')
    process.exit(1)
  }

  console.warn(`Updating Lesson: ${lesson.title} (${lesson.id})`)

  await prisma.lesson.update({
    where: { id: lesson.id },
    data: {
      videoUrl: targetPath,
      type: 'VIDEO'
    }
  })

  console.warn('Lesson updated successfully!')
  console.warn('-----------------------------------')
  console.warn(`Test URL: http://localhost:3000/course/${lesson.chapterId}/${lesson.id}`)
  // Note: chapterId in DB relates to chapter, we need subjectId for the route

  // Fetch subjectId to give full URL
  const chapter = await prisma.chapter.findUnique({
    where: { id: lesson.chapterId },
    include: { subject: true }
  })

  if (chapter) {
      console.warn(`Navigate to: http://localhost:3000/course/${chapter.subjectId}/${lesson.id}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
