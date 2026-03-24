import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Allow imports like: import X from '@/lib/...'
      '@': path.resolve(__dirname, './src'),
    },
  },
})
