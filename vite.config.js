import { defineConfig as definirConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default definirConfig({
  plugins: [react()],
})
