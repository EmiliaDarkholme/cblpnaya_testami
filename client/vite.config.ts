// client/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'localhost',
      '.trycloudflare.com', // Разрешаем все поддомены trycloudflare.com
      'studio-portable-traveling-generally.trycloudflare.com' // Конкретный хост
    ]
  }
})