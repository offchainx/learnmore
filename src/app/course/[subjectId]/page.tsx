export default function CourseIndexPage() {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4 text-center">
        <div className="p-4 rounded-full bg-primary/10">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10 text-primary"
            >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold">Welcome to the Course</h2>
        <p className="text-muted-foreground max-w-[500px]">
          Select a lesson from the sidebar to begin your learning journey.
        </p>
      </div>
    );
  }
