<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NSpace } from 'naive-ui'

const router = useRouter()
</script>

<template>
  <div class="home-container">
    <div class="home-content">
      <div class="hero-section">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1>歡迎來到 Vue Demo</h1>
        <p>一個簡潔優雅的 Vue 3 示範專案</p>
      </div>

      <NSpace justify="center" :size="16" style="margin-bottom: 64px;">
        <NButton type="primary" size="large" @click="router.push('/login')">
          會員登入
        </NButton>
        <NButton size="large" ghost text-color="#ffffff" @click="router.push('/register')">
          立即註冊
        </NButton>
      </NSpace>

      <div class="features">
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>快速</h3>
          <p>基於 Vite 構建，享受極速開發體驗</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <h3>現代</h3>
          <p>使用 Vue 3 Composition API</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 22S8 18 8 13V5L12 3L16 5V13C16 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>安全</h3>
          <p>TypeScript 類型安全保障</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 40px 20px;
}

.home-content {
  text-align: center;
  max-width: 800px;
}

.hero-section {
  margin-bottom: 48px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
}

.logo-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

.hero-section h1 {
  font-size: 48px;
  font-weight: 700;
  color: white;
  margin: 0 0 16px;
  letter-spacing: -1px;
}

.hero-section p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px 24px;
  transition: all 0.3s;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px);
}

.feature-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.feature-icon svg {
  width: 28px;
  height: 28px;
  color: #a78bfa;
}

.feature-card h3 {
  color: white;
  font-size: 20px;
  margin: 0 0 12px;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .hero-section h1 {
    font-size: 32px;
  }
}
</style>
