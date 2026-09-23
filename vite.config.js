import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Default '/' for custom-domain root (Cloudflare). Override with
// SITE_BASE='/abhishek-a2/' only for subpath previews (GitHub Pages).
export default defineConfig({
  base: process.env.SITE_BASE || '/',
  plugins: [react(), tailwindcss()],
})
