import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Checking Supabase Connection...')
console.log(`URL: ${supabaseUrl ? 'Found' : 'Missing'}`)
console.log(`Key: ${supabaseKey ? 'Found' : 'Missing'}`)

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    if (error) {
        // If "users" table doesn't allow anon access, this might fail, which is expected.
        // Let's try auth.
        console.log('Database check failed (might be RLS), trying Auth check...')
    } else {
        console.log('Database connection successful!')
    }

    // Auth check doesn't require a valid user session, just a valid key
    const { error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.error('Auth Connection Failed:', authError.message)
      process.exit(1)
    } else {
      console.log('Auth Connection Successful!')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

testConnection()
