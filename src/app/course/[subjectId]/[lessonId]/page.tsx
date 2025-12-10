export default function LessonPage({
  params,
}: {
  params: { subjectId: string; lessonId: string };
}) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Lesson {params.lessonId}</h1>
        <p className="text-muted-foreground">
          Subject ID: {params.subjectId}
        </p>
      </div>
      
      <div className="border rounded-lg p-8 min-h-[400px] bg-card text-card-foreground shadow-sm">
        <div className="prose dark:prose-invert max-w-none">
          <p>
            This is the content for lesson <strong>{params.lessonId}</strong>.
          </p>
          <p>
            In a real implementation, this would fetch markdown or rich text content 
            from the database based on the ID.
          </p>
          <h3>Topics Covered</h3>
          <ul>
            <li>Concept A</li>
            <li>Concept B</li>
            <li>Practical Examples</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
