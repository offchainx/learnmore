import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  const lessonId = 'ca8a4bc5-58bb-41db-a2c8-8a821a657aad'
  console.warn(`Updating Lesson: ${lessonId}`)

  // Use a reliable public test video
  const publicVideoUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  console.warn(`Setting videoUrl to: ${publicVideoUrl}`)

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      videoUrl: publicVideoUrl,
      type: 'VIDEO'
    }
  })

  console.warn('Lesson updated successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
