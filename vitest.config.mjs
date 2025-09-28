import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vitest/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  test: {
    environment: 'jsdom', // Better for React testing
    globals: true, // Enable global test functions
    setupFiles: ['./tests/setup.js'], // Test setup file
    include: [
      'tests/**/*.test.js',
      'tests/**/*.test.jsx',
      'src/**/*.test.js',
      'src/**/*.test.jsx'
    ],
    exclude: [
      'node_modules',
      'dist',
      'build',
      '**/*.config.js'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js',
        '**/*.test.js',
        '**/*.test.jsx'
      ],
      threshold: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    testTimeout: 10000, // 10 second timeout
    hookTimeout: 10000,
    watchExclude: [
      'node_modules/**',
      'dist/**',
      'build/**'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
