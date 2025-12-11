import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing credentials')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.warn('--- Listing Files in "videos" bucket ---')
  const { data: files, error: listError } = await supabase.storage
    .from('videos')
    .list('lessons') // List inside 'lessons' folder

  if (listError) {
    console.error('List Error:', listError)
  } else {
    console.warn('Files found:', files)
  }

  const targetPath = 'lessons/test-video.mp4'
  console.warn(`
--- Attempting to sign URL for: ${targetPath} (using Service Role) ---`)

  const { data: signData, error: signError } = await supabase.storage
    .from('videos')
    .createSignedUrl(targetPath, 3600)

  if (signError) {
    console.error('Sign Error:', signError)
  } else {
    console.warn('Signed URL generated successfully:', signData.signedUrl.substring(0, 50) + '...')
  }
}

main()

