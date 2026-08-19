import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '#app': fileURLToPath(new URL('./test/mocks/app.ts', import.meta.url))
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      exclude: [
        'node_modules/**',
        '.nuxt/**',
        'dist/**',
        'coverage/**',
        'nuxt.config.ts',
        'vitest.config.ts',
        'eslint.config.mjs',
        'types/**',
        'test/**'
      ]
    }
  }
})
