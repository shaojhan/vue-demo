<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserService, ApiError } from '@/api'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const isUnverified = ref(false)
const isResending = ref(false)

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
  window.location.href = '/api/auth/google/login'
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
          <Transition name="fade">
            <div v-if="errorMessage" :class="['error-alert', { warning: isUnverified }]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              <div class="alert-content">
                <span>{{ errorMessage }}</span>
                <button v-if="isUnverified" type="button" class="resend-btn" :disabled="isResending" @click="handleResendVerification">
                  {{ isResending ? '發送中...' : '重新發送驗證郵件' }}
                </button>
              </div>
            </div>
          </Transition>

          <div class="input-group">
            <label for="username">電子郵件</label>
            <div class="input-field">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="M22 6l-10 7L2 6"/>
              </svg>
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="name@example.com"
                autocomplete="username"
              />
            </div>
          </div>

          <div class="input-group">
            <div class="label-row">
              <label for="password">密碼</label>
              <RouterLink to="/forgot-password" class="forgot-link">忘記密碼？</RouterLink>
            </div>
            <div class="input-field">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="輸入您的密碼"
                autocomplete="current-password"
              />
              <button type="button" class="toggle-btn" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="remember-row">
            <label class="checkbox-wrap">
              <input type="checkbox" v-model="rememberMe" />
              <span class="custom-checkbox"></span>
              <span class="checkbox-text">記住我的登入狀態</span>
            </label>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="btn-loading">
              <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              處理中...
            </span>
            <span v-else>登入</span>
          </button>

          <div class="divider">
            <span>或</span>
          </div>

          <div class="social-buttons">
            <button type="button" class="social-btn" @click="handleGoogleLogin">
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 登入
            </button>
            <button type="button" class="social-btn github">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              使用 GitHub 登入
            </button>
          </div>
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

.brand-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-10%, -10%) scale(1.1); }
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

/* 錯誤提示 */
.error-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 14px;
}

.error-alert svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 輸入框 */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
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

.input-field {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 14px;
  width: 20px;
  height: 20px;
  color: #94a3b8;
  pointer-events: none;
}

.input-field input {
  width: 100%;
  padding: 14px 14px 14px 46px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  background: white;
  color: #1e293b;
  transition: all 0.2s;
  box-sizing: border-box;
}

.input-field input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-field input::placeholder {
  color: #94a3b8;
}

.toggle-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  transition: color 0.2s;
}

.toggle-btn:hover {
  color: #6366f1;
}

.toggle-btn svg {
  width: 20px;
  height: 20px;
}

/* 記住我 */
.remember-row {
  margin-top: -4px;
}

.checkbox-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #475569;
}

.checkbox-wrap input {
  display: none;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.checkbox-wrap input:checked + .custom-checkbox {
  background: #6366f1;
  border-color: #6366f1;
}

.checkbox-wrap input:checked + .custom-checkbox::after {
  content: '';
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translateY(-1px);
}

/* 登入按鈕 */
.submit-btn {
  padding: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -6px rgba(99, 102, 241, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spin {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 分隔線 */
.divider {
  display: flex;
  align-items: center;
  gap: 16px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.divider span {
  font-size: 13px;
  color: #94a3b8;
}

/* 社交登入 */
.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.social-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.social-btn svg {
  width: 20px;
  height: 20px;
}

.social-btn.github:hover {
  background: #24292e;
  border-color: #24292e;
  color: white;
}

/* 底部 */
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

/* RWD */
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

  .input-field input {
    padding: 12px 12px 12px 42px;
  }

  .submit-btn {
    padding: 14px;
  }
}
</style>
