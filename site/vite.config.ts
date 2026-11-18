import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages serves the repo at /mywebportfolio/
export default defineConfig({
  base: '/mywebportfolio/',
  plugins: [react(), tailwindcss()],
})
