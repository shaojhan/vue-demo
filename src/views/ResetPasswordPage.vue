<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { UserService, ApiError } from '../api'

const route = useRoute()
const router = useRouter()

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const isSuccess = ref(false)
const isInvalidToken = ref(false)

onMounted(() => {
  token.value = (route.query.token as string) || ''
  if (!token.value) {
    isInvalidToken.value = true
  }
})

const handleSubmit = async () => {
  if (!newPassword.value || !confirmPassword.value) {
    errorMessage.value = '請填寫所有欄位'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = '兩次輸入的密碼不一致'
    return
  }

  if (newPassword.value.length < 6) {
    errorMessage.value = '密碼長度至少需要 6 個字元'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await UserService.resetPassword({
      token: token.value,
      new_password: newPassword.value
    })
    isSuccess.value = true
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 400 || error.status === 404) {
        errorMessage.value = '重設連結已失效或無效，請重新申請'
      } else if (error.status === 422) {
        errorMessage.value = '密碼格式不符合要求'
      } else {
        errorMessage.value = '重設失敗，請稍後再試'
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

      <!-- Token 無效 -->
      <template v-if="isInvalidToken">
        <div class="header">
          <div class="icon-circle error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
          </div>
          <h2>連結無效</h2>
          <p>此重設密碼連結無效或已過期，請重新申請。</p>
        </div>
        <RouterLink to="/forgot-password" class="submit-btn" style="display: block; text-align: center; text-decoration: none;">
          重新申請
        </RouterLink>
      </template>

      <!-- 重設成功 -->
      <template v-else-if="isSuccess">
        <div class="header">
          <div class="icon-circle success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2>密碼重設成功</h2>
          <p>您的密碼已成功重設，即將跳轉至登入頁面...</p>
        </div>
      </template>

      <!-- 重設密碼表單 -->
      <template v-else>
        <div class="header">
          <div class="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <h2>重設密碼</h2>
          <p>請輸入您的新密碼。</p>
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
            <label for="newPassword">新密碼</label>
            <div class="input-field">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                id="newPassword"
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="請輸入新密碼（至少 6 位）"
                autocomplete="new-password"
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

          <div class="input-group">
            <label for="confirmPassword">確認新密碼</label>
            <div class="input-field">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="請再次輸入新密碼"
                autocomplete="new-password"
              />
              <button type="button" class="toggle-btn" @click="showConfirmPassword = !showConfirmPassword">
                <svg v-if="!showConfirmPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="btn-loading">
              <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              重設中...
            </span>
            <span v-else>重設密碼</span>
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

.icon-circle.error {
  background: #fef2f2;
}

.icon-circle.error svg {
  color: #dc2626;
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
  padding: 14px 48px 14px 46px;
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

@media (max-width: 480px) {
  .header h2 {
    font-size: 24px;
  }

  .input-field input {
    padding: 12px 44px 12px 42px;
  }

  .submit-btn {
    padding: 14px;
  }
}
</style>
