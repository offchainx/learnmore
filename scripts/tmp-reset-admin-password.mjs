import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const email = 'admin_ui_test@learnmore.com'
const password = 'Password123!'

const { data, error } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
})
if (error) {
  throw error
}

const user = data.users.find((item) => item.email === email)

if (!user) {
  const created = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (created.error) {
    throw created.error
  }
  console.log(`created:${created.data.user.id}`)
} else {
  const updated = await supabase.auth.admin.updateUserById(user.id, {
    password,
    email_confirm: true,
  })
  if (updated.error) {
    throw updated.error
  }
  console.log(`updated:${user.id}`)
}
