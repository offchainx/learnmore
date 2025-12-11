import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  const sqlPath = path.join(process.cwd(), 'supabase/migrations/003_storage_videos.sql')
  const sql = fs.readFileSync(sqlPath, 'utf-8')

  console.warn('Applying SQL from:', sqlPath)
  console.warn('-------------------')
  console.warn(sql)
  console.warn('-------------------')

  // Split by semicolon to execute one by one (rudimentary, but policies usually don't contain semicolons inside strings)
  // Actually, Prisma executeRawUnsafe can handle multiple statements in some drivers, but for safety let's try one block.
  // But wait, `create policy` might need to be executed individually.
  // Let's try executing the whole string first.
  
  try {
    await prisma.$executeRawUnsafe(sql)
    console.warn('Successfully applied migration.')
  } catch (e) {
    console.error('Error applying migration:', e)

    // Fallback: split by semicolon
    console.warn('Retrying by splitting statements...')
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0)
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement)
        console.warn('Executed:', statement.substring(0, 50) + '...')
      } catch (innerE) {
        console.error('Failed statement:', statement)
        console.error(innerE)
      }
    }
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
