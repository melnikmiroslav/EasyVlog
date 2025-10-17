import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/EasyVlog/',
  plugins: [react()],
  optimizeDeps: {
    include: ['react-router-dom']
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom']
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
