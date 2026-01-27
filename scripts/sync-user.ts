import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }

  const adminUser = data.users.find(u => u.email === 'admin@learnmore.com');

  if (!adminUser) {
    console.error('User admin@learnmore.com not found in Supabase Auth');
    process.exit(1);
  }

  console.log('Found user:', adminUser.id, adminUser.email);

  const user = await prisma.user.upsert({
    where: { id: adminUser.id },
    create: {
      id: adminUser.id,
      email: adminUser.email!,
      username: 'admin',
      role: 'ADMIN',
    },
    update: {
      email: adminUser.email!,
    },
  });
  console.log('✅ User synced:', user.id, user.email);

  await prisma.userSettings.upsert({
    where: { userId: adminUser.id },
    create: {
      userId: adminUser.id,
      language: 'zh',
      theme: 'light',
    },
    update: {},
  });
  console.log('✅ UserSettings synced');

  await prisma.$disconnect();
  console.log('\n🎉 Done! Please refresh your browser.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
