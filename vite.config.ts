import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,  // 等同於 0.0.0.0
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true
      }
    }
  }
})


