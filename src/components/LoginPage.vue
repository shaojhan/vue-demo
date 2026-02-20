<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserService, ApiError } from '@/api'
import { NInput, NButton, NCheckbox, NAlert, NDivider, NSpace } from 'naive-ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const isUnverified = ref(false)
const isResending = ref(false)
const isSessionExpired = ref(false)

onMounted(() => {
  if (route.query.expired === '1') {
    isSessionExpired.value = true
  }
})

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = '請輸入用戶名和密碼'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  isUnverified.value = false

  try {
    const response = await UserService.loginUser({
      username: username.value,
      password: password.value
    })

    authStore.login(response.user, response.access_token, response.expires_in)
    router.push('/user')
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        isUnverified.value = true
        errorMessage.value = '您的帳號尚未完成信箱驗證，請查收驗證郵件並完成驗證後再登入。'
      } else if (error.status === 401) {
        errorMessage.value = '帳號或密碼錯誤，請重新輸入'
      } else if (error.status === 422) {
        errorMessage.value = '輸入格式有誤，請檢查帳號密碼'
      } else {
        errorMessage.value = '登入失敗，請稍後再試'
      }
    } else {
      errorMessage.value = '網路連線錯誤，請檢查網路狀態'
    }
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = () => {
  sessionStorage.setItem('oauth_provider', 'google')
  window.location.href = '/api/auth/google/login'
}

const handleGithubLogin = () => {
  sessionStorage.setItem('oauth_provider', 'github')
  window.location.href = '/api/auth/github/login'
}

const handleResendVerification = async () => {
  if (!username.value) {
    errorMessage.value = '請先輸入電子郵件'
    return
  }

  isResending.value = true
  try {
    await UserService.resendVerification({ email: username.value })
    errorMessage.value = '驗證郵件已重新發送，請查收信箱。'
    isUnverified.value = false
  } catch {
    errorMessage.value = '發送失敗，請稍後再試'
  } finally {
    isResending.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- 左側品牌區 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="brand-logo">
          <svg viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="white" fill-opacity="0.15"/>
            <path d="M24 14L14 20V32L24 38L34 32V20L24 14Z" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M24 26L14 20M24 26V38M24 26L34 20" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="brand-title">Vue Demo</h1>
        <p class="brand-subtitle">探索現代化的 Web 開發體驗</p>

        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div class="feature-text">
              <span class="feature-title">極速體驗</span>
              <span class="feature-desc">基於 Vite 的閃電構建</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="feature-text">
              <span class="feature-title">安全可靠</span>
              <span class="feature-desc">TypeScript 類型安全</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
            </div>
            <div class="feature-text">
              <span class="feature-title">全球部署</span>
              <span class="feature-desc">隨處可用的雲端服務</span>
            </div>
          </div>
        </div>
      </div>

      <div class="brand-footer">
        <p>&copy; 2024 Vue Demo. All rights reserved.</p>
      </div>
    </div>

    <!-- 右側登入區 -->
    <div class="login-section">
      <div class="login-container">
        <div class="login-header">
          <h2>歡迎回來</h2>
          <p>請登入您的帳戶以繼續</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <NAlert v-if="isSessionExpired" type="info" :bordered="false">
            您的登入已過期，請重新登入
          </NAlert>

          <NAlert v-if="errorMessage" :type="isUnverified ? 'warning' : 'error'" :bordered="false">
            <span>{{ errorMessage }}</span>
            <NButton
              v-if="isUnverified"
              text
              type="warning"
              size="small"
              :loading="isResending"
              style="margin-top: 8px;"
              @click="handleResendVerification"
            >
              重新發送驗證郵件
            </NButton>
          </NAlert>

          <div class="form-item">
            <label>電子郵件</label>
            <NInput
              v-model:value="username"
              placeholder="name@example.com"
              size="large"
              autocomplete="username"
            />
          </div>

          <div class="form-item">
            <div class="label-row">
              <label>密碼</label>
              <RouterLink to="/forgot-password" class="forgot-link">忘記密碼？</RouterLink>
            </div>
            <NInput
              v-model:value="password"
              type="password"
              show-password-on="click"
              placeholder="輸入您的密碼"
              size="large"
              autocomplete="current-password"
            />
          </div>

          <NCheckbox v-model:checked="rememberMe">
            記住我的登入狀態
          </NCheckbox>

          <NButton
            type="primary"
            size="large"
            block
            :loading="isLoading"
            attr-type="submit"
          >
            登入
          </NButton>

          <NDivider>或</NDivider>

          <NSpace vertical :size="12">
            <NButton block size="large" @click="handleGoogleLogin">
              <template #icon>
                <svg viewBox="0 0 24 24" style="width: 18px; height: 18px;">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </template>
              使用 Google 登入
            </NButton>
            <NButton block size="large" @click="handleGithubLogin">
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor" style="width: 18px; height: 18px;">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </template>
              使用 GitHub 登入
            </NButton>
            <NButton block size="large" @click="router.push('/sso')">
              <template #icon>
                <svg viewBox="0 0 24 24" fill="currentColor" style="width: 18px; height: 18px;">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </template>
              使用 SSO 登入
            </NButton>
          </NSpace>
        </form>

        <div class="login-footer">
          <p>還沒有帳戶？ <RouterLink to="/register">免費註冊</RouterLink></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
}

/* 左側品牌區 */
.brand-section {
  flex: 1;
  background: linear-gradient(160deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
  position: relative;
  overflow: hidden;
}

.brand-content {
  position: relative;
  z-index: 1;
}

.brand-logo {
  width: 72px;
  height: 72px;
  margin-bottom: 32px;
}

.brand-logo svg {
  width: 100%;
  height: 100%;
}

.brand-title {
  font-size: 42px;
  font-weight: 700;
  color: white;
  margin: 0 0 12px;
  letter-spacing: -1px;
}

.brand-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 48px;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: transform 0.3s, background 0.3s;
}

.feature-item:hover {
  transform: translateX(8px);
  background: rgba(255, 255, 255, 0.15);
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon svg {
  width: 24px;
  height: 24px;
  color: white;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.feature-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.brand-footer {
  position: relative;
  z-index: 1;
}

.brand-footer p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* 右側登入區 */
.login-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: #f8fafc;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-header {
  margin-bottom: 36px;
}

.login-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.login-header p {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-size: 13px;
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
}

.login-footer p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.login-footer a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
}

.login-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .brand-section {
    display: none;
  }

  .login-section {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .login-header h2 {
    font-size: 26px;
  }
}
</style>
