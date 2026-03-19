import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const prisma = new PrismaClient()

async function setup() {
  const email = 'admin_ui_test@learnmore.com'
  const password = 'Password123!'
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })
  
  let userId = data?.user?.id
  
  if (error) {
    if (error.message.includes('already exists')) {
       console.log('User already exists in Auth, fetching id...')
       const { data: users } = await supabase.auth.admin.listUsers()
       userId = users.users.find(u => u.email === email)?.id
    } else {
       console.error('Auth Error:', error)
       process.exit(1)
    }
  } else {
    console.log('User created in Auth:', userId)
  }
  
  // Wait for Supabase trigger to insert the row into public.User
  await new Promise(r => setTimeout(r, 2000))

  try {
    await prisma.user.upsert({
      where: { email },
      update: { role: 'ADMIN' },
      create: {
        id: userId!,
        email,
        username: 'ui_tester',
        role: 'ADMIN'
      }
    })
    console.log('Successfully set admin user!')
    process.exit(0)
  } catch(e) {
    console.error('Prisma Error:', e)
    process.exit(1)
  }
}

setup()
