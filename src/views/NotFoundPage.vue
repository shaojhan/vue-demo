<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="notfound-container">
    <div class="notfound-content">
      <div class="error-code">404</div>
      <h1>頁面不存在</h1>
      <p>抱歉，您尋找的頁面不存在或已被移除</p>
      <RouterLink to="/" class="back-btn">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        返回首頁
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.notfound-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 20px;
}

.notfound-content {
  text-align: center;
}

.error-code {
  font-size: 150px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 16px;
  text-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
}

.notfound-content h1 {
  font-size: 32px;
  color: white;
  margin: 0 0 12px;
}

.notfound-content p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 32px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}

.back-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

@media (max-width: 480px) {
  .error-code {
    font-size: 100px;
  }

  .notfound-content h1 {
    font-size: 24px;
  }
}
</style>
