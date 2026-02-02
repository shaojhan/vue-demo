<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { UserService, ApiError } from '@/api'

const email = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const isSent = ref(false)

const handleSubmit = async () => {
  if (!email.value) {
    errorMessage.value = '請輸入電子郵件'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await UserService.forgotPassword({ email: email.value })
    isSent.value = true
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        errorMessage.value = '找不到此電子郵件對應的帳號'
      } else if (error.status === 422) {
        errorMessage.value = '請輸入有效的電子郵件格式'
      } else {
        errorMessage.value = '發送失敗，請稍後再試'
      }
    } else {
      errorMessage.value = '網路連線錯誤，請檢查網路狀態'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="container">
      <div class="back-link">
        <RouterLink to="/login">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          返回登入
        </RouterLink>
      </div>

      <!-- 已發送成功 -->
      <template v-if="isSent">
        <div class="header">
          <div class="icon-circle success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2>郵件已發送</h2>
          <p>重設密碼的連結已發送至 <strong>{{ email }}</strong>，請查收信箱並點擊連結重設密碼。</p>
        </div>

        <div class="footer-text">
          <p>沒有收到郵件？ <button class="text-btn" @click="isSent = false">重新發送</button></p>
        </div>
      </template>

      <!-- 輸入 email 表單 -->
      <template v-else>
        <div class="header">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h2>忘記密碼</h2>
          <p>請輸入您的電子郵件，我們將發送重設密碼的連結給您。</p>
        </div>

        <form @submit.prevent="handleSubmit" class="form">
          <Transition name="fade">
            <div v-if="errorMessage" class="error-alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          </Transition>

          <div class="input-group">
            <label for="email">電子郵件</label>
            <div class="input-field">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="M22 6l-10 7L2 6"/>
              </svg>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="name@example.com"
                autocomplete="email"
              />
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="btn-loading">
              <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              發送中...
            </span>
            <span v-else>發送重設連結</span>
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: #f8fafc;
}

.container {
  width: 100%;
  max-width: 420px;
}

.back-link {
  margin-bottom: 32px;
}

.back-link a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.back-link a:hover {
  color: #6366f1;
}

.back-link svg {
  width: 18px;
  height: 18px;
}

.header {
  text-align: center;
  margin-bottom: 36px;
}

.icon-circle {
  width: 64px;
  height: 64px;
  background: #eef2ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.icon-circle svg {
  width: 28px;
  height: 28px;
  color: #6366f1;
}

.icon-circle.success {
  background: #f0fdf4;
}

.icon-circle.success svg {
  color: #16a34a;
}

.header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.header p {
  font-size: 15px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
}

.header strong {
  color: #1e293b;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

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

.footer-text {
  text-align: center;
  margin-top: 24px;
}

.footer-text p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.text-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}

.text-btn:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .header h2 {
    font-size: 24px;
  }

  .input-field input {
    padding: 12px 12px 12px 42px;
  }

  .submit-btn {
    padding: 14px;
  }
}
</style>
