import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <main className="flex flex-col gap-4 items-center sm:items-start text-center">
        <h1 className="text-4xl font-bold">Welcome to Learn More</h1>
        <p className="text-xl text-muted-foreground">The platform for middle school online education.</p>
        <div className="flex gap-4">
           <Button>Get Started</Button>
           <Button variant="outline">Learn More</Button>
        </div>
      </main>
    </div>
  );
}
