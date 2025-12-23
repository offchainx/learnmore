import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const sqlPath = path.join(process.cwd(), 'supabase/migrations/004_update_auth_trigger.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  console.log('Applying trigger update...');
  try {
    // Split by semicolons if multiple statements, but here we have $$ blocks which makes splitting hard.
    // Ideally executeRawUnsafe handles the whole block if it's valid SQL.
    // For CREATE FUNCTION, it is a single statement.
    await prisma.$executeRawUnsafe(sql);
    console.log('✅ Trigger updated successfully.');
  } catch (error) {
    console.error('❌ Failed to update trigger:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
