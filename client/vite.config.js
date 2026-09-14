import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL ? process.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : 'https://sih-project-4sno.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
