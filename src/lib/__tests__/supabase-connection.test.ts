// src/lib/__tests__/supabase-connection.test.ts
import { createSupabaseBrowserClient } from '@/lib/supabase-client'

async function testSupabaseConnection() {
  console.log('--- Running Supabase Connection Test ---')
  try {
    const supabase = createSupabaseBrowserClient()
    // Attempt to get session to verify connection
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Supabase connection test failed:', error.message)
      return false
    }
    if (data && data.session) {
      console.log('Supabase connection successful! Session found.')
      console.log('User:', data.session.user?.email)
    } else {
      console.log('Supabase connection successful! No active session found.')
    }
    return true
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.error('Supabase connection test failed unexpectedly:', errorMessage)
    return false
  } finally {
    console.log('--- Supabase Connection Test Finished ---')
  }
}

// To run this test, you might need a simple script, e.g., in package.json:
// "test:supabase": "node -r esbuild-register src/lib/__tests__/supabase-connection.test.ts"
// Or import it and call it in a proper test environment.
// For now, it's a standalone check.

// Example of how to execute it if run directly:
if (require.main === module) {
  // Only run if this file is executed directly (e.g., node supabase-connection.test.ts)
  testSupabaseConnection()
}
