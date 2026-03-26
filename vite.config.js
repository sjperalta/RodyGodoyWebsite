import { copyFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** GitHub Pages has no server fallback; unknown paths 404. Copy index → 404.html so /admin etc. load the SPA. */
function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const indexHtml = resolve(dist, 'index.html')
      if (!existsSync(indexHtml)) return
      copyFileSync(indexHtml, resolve(dist, '404.html'))
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), githubPagesSpaFallback()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.js'],
    css: true,
  },
})
