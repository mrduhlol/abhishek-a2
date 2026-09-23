import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Project-site base (/abhishek-a2/) only for GitHub Pages builds so local dev stays at /.
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/abhishek-a2/' : '/',
  plugins: [react(), tailwindcss()],
})
