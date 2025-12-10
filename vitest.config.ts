import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/lib/test-setup.ts',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'], // Explicitly include default test file patterns
    exclude: ['**/node_modules/**', '**/dist/**', 'src/lib/__tests__/supabase-connection.test.ts', 'prisma/seed.test.ts'], // Simplified exclude
  },
})
