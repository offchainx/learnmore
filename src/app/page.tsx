'use client' // This page needs to be a Client Component to use useState/useEffect and supabase browser client

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { createSupabaseBrowserClient } from '@/lib/supabase-client'

export default function Home() {
  const [supabaseStatus, setSupabaseStatus] = useState(
    'Checking Supabase connection...'
  )

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Supabase connection error:', error.message)
          setSupabaseStatus(`Supabase connection failed: ${error.message}`)
        } else if (data && data.session) {
          setSupabaseStatus(
            `Supabase connected. User: ${data.session.user?.email || 'Unknown'}`
          )
        } else {
          setSupabaseStatus('Supabase connected. No active user session.')
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        console.error('Supabase test failed unexpectedly:', errorMessage)
        setSupabaseStatus(`Supabase test failed unexpectedly: ${errorMessage}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <main className="flex flex-col items-center gap-4 text-center sm:items-start">
        <h1 className="text-4xl font-bold">Welcome to Learn More</h1>
        <p className="text-xl text-muted-foreground">
          The platform for middle school online education.
        </p>
        <div className="flex gap-4">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
        </div>
        <p className="mt-4 text-sm text-gray-500">{supabaseStatus}</p>
      </main>
    </div>
  )
}
