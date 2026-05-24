import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // ag-grid 為單一大型 chunk（lazy 載入），調高警告門檻避免雜訊
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          // 核心框架分離為穩定 vendor chunk，利於長期快取
          'vue-vendor': ['vue', 'vue-router', 'pinia', 'pinia-plugin-persistedstate'],
          'ag-grid': ['ag-grid-community', 'ag-grid-vue3']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
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


