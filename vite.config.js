import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // pour GitHub Pages, mettre le nom du repo si besoin
})
