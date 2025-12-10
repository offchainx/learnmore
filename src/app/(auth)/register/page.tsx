'use client';

import { signupAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useActionState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react'; // Assuming BookOpen is used for logo, ChevronDown for select

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(signupAction, null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      alert("Passwords don't match!"); // Client-side validation
      return;
    }
    
    // Convert FormData to object for potential further client-side processing or just to match types
    // For now, signupAction only handles email and password.
    // Additional fields (name, grade) are present in UI but not passed to action.
    formAction(formData); 
  };

  return (
    <Card className="w-full max-w-[440px] bg-[#0a0a0a]/60 backdrop-blur-xl border-white/10 shadow-2xl relative z-10">
      <CardHeader className="space-y-1 items-center text-center pb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-white">Create Account</CardTitle>
        <CardDescription className="text-slate-400">Join thousands of students improving their grades</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">Full Name</Label>
            <Input 
              id="username" 
              name="username" // Mapped to username for Server Action if it's there
              placeholder="Student Name" 
              required 
              className="bg-[#111] border-white/5 focus:bg-[#161616] text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="grade" className="text-white">Grade Level</Label>
            <div className="relative">
              <select
                id="grade"
                name="grade" // Added name for form data, though not used by signupAction yet
                defaultValue="7" // Use defaultValue for controlled/uncontrolled select
                className="flex h-12 w-full rounded-xl border border-white/5 bg-[#111] px-4 py-2 text-sm text-white ring-offset-black placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent transition-all appearance-none cursor-pointer hover:bg-[#161616]"
              >
                <option value="7" className="bg-[#111]">Grade 7 (Year 7)</option>
                <option value="8" className="bg-[#111]">Grade 8 (Year 8)</option>
                <option value="9" className="bg-[#111]">Grade 9 (Year 9)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email or Phone</Label>
            <Input 
              id="email" 
              name="email"
              type="email" // Changed type to email
              placeholder="email@example.com" 
              required 
              className="bg-[#111] border-white/5 focus:bg-[#161616] text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required 
                className="bg-[#111] border-white/5 focus:bg-[#161616] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirm</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword"
                type="password" 
                required 
                className="bg-[#111] border-white/5 focus:bg-[#161616] text-white"
              />
            </div>
          </div>
          
          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}

          <Button type="submit" size="lg" variant="glow" className="w-full mt-6 h-12 text-base shadow-lg shadow-blue-500/20" disabled={isPending}>
            {isPending ? 'Signing Up...' : 'Start Learning'}
          </Button>
        </form>
        
         <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0a0a0a] px-2 text-slate-500">Or continue with</span>
          </div>
        </div>

        <Button variant="outline" className="w-full h-12 border-white/10 hover:bg-white/5 text-slate-300 font-normal">
           <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26+-.19-.58z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
           Google Account
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center pb-6 pt-2">
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
