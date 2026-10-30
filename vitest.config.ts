import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@/app': fileURLToPath(new URL('./app', import.meta.url)),
      '@':     fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    env: {
      IP_HASH_SECRET: 'test-secret-for-vitest-only',
    },
  },
})
