import { getLessonData } from '@/actions/subject'
import { getSignedVideoUrl } from '@/actions/storage'
import { LessonVideoPlayer } from '@/components/business/LessonVideoPlayer'
import { CourseNavigation } from '@/components/business/CourseNavigation'
import { QuizView } from '@/components/business/QuizView'
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
  const { subjectId, lessonId } = await params

  const result = await getLessonData(lessonId)

  if (!result.success || !result.data) {
    notFound()
  }

  const { lesson, userProgress, nextLessonId, questions } = result.data

  // If it's a quiz, render the quiz view
  if (lesson.type === 'QUIZ' && questions && questions.length > 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-20">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
          <p className="text-muted-foreground">Complete the quiz to test your knowledge.</p>
        </div>
        
        <QuizView 
          chapterId={lesson.chapterId}
          questions={questions}
        />

        {/* Navigation is handled inside QuizView after submission, or we can show it if completed */}
         <CourseNavigation 
          subjectId={subjectId}
          nextLessonId={nextLessonId}
          isCompleted={userProgress?.isCompleted || false}
        />
      </div>
    );
  }

  let videoUrl = null
  let videoError = null
  if (lesson.videoUrl) {
    const videoResult = await getSignedVideoUrl(lessonId)
    if (videoResult.success) {
      videoUrl = videoResult.url
    } else {
        videoError = videoResult.error
        console.error("Video URL fetch failed:", videoResult.error)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
      </div>
      
      {videoUrl ? (
        <div className="border rounded-lg overflow-hidden bg-black shadow-sm">
          <LessonVideoPlayer 
            lessonId={lesson.id} 
            videoUrl={videoUrl} 
            initialPosition={userProgress?.lastPosition || 0}
          />
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

      <CourseNavigation 
        subjectId={subjectId}
        nextLessonId={nextLessonId}
        isCompleted={userProgress?.isCompleted || false}
      />
    </div>
  );
}
