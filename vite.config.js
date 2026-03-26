import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/app': resolve(__dirname, 'src/app'),
      '@/shared': resolve(__dirname, 'src/shared'),
      '@/features': resolve(__dirname, 'src/features'),
      '@/services': resolve(__dirname, 'src/services'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    css: true,
  },
})