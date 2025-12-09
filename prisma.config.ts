// prisma.config.ts
import { defineConfig, env } from 'prisma/config'
import 'dotenv/config' // Explicitly load .env file

export default defineConfig({
  schema: 'prisma/schema.prisma', // Path to your schema.prisma file (relative to root)
  datasource: { // Singular 'datasource'
    url: env('DATABASE_URL'), // This is crucial for db push in Prisma v7
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})