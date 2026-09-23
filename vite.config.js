import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Served from a custom domain root via Cloudflare, so the base stays '/'.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})
