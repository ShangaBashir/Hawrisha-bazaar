import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/categories': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/bestsellers': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/carousel': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/products': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  }
})
