import prisma from '@/lib/prisma'
import { getSignedVideoUrl } from '@/actions/storage'
import { VideoPlayer } from '@/components/business/VideoPlayer'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ subjectId: string; lessonId: string }>;
}) {
  const { lessonId } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId }
  })

  if (!lesson) {
    notFound()
  }

  let videoUrl = null
  let videoError = null
  if (lesson.videoUrl) {
    const result = await getSignedVideoUrl(lessonId)
    if (result.success) {
      videoUrl = result.url
    } else {
        videoError = result.error
        console.error("Video URL fetch failed:", result.error)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
      </div>
      
      {videoUrl ? (
        <div className="border rounded-lg overflow-hidden bg-black shadow-sm">
          <VideoPlayer url={videoUrl} />
        </div>
      ) : lesson.type === 'VIDEO' ? (
         <div className="border rounded-lg p-8 min-h-[200px] bg-muted flex flex-col items-center justify-center text-muted-foreground gap-2">
           <p>Video content not available</p>
           {videoError && <p className="text-xs text-destructive">Error: {videoError}</p>}
         </div>
      ) : null}
      
      <div className="border rounded-lg p-8 min-h-[200px] bg-card text-card-foreground shadow-sm">
        <div className="prose dark:prose-invert max-w-none">
           {lesson.content ? (
             <ReactMarkdown 
               remarkPlugins={[remarkMath]} 
               rehypePlugins={[rehypeKatex]}
             >
               {lesson.content}
             </ReactMarkdown>
           ) : (
             <p className="text-muted-foreground italic">No content provided.</p>
           )}
        </div>
      </div>
    </div>
  );
}
