<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

const uid = ref('')
const password = ref('')
const confirmPassword = ref('')
const email = ref('')
const name = ref('')
const birthdate = ref('')
const description = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const handleRegister = async () => {
  if (!uid.value || !password.value || !confirmPassword.value || !email.value || !name.value || !birthdate.value) {
    errorMessage.value = '請填寫所有必填欄位'
    return
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = '兩次輸入的密碼不一致'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = '密碼長度至少需要 6 個字元'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('/api/users/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uid: uid.value,
        pwd: password.value,
        email: email.value,
        name: name.value,
        birthdate: birthdate.value,
        description: description.value || '',
        role: 'NORMAL'
      })
    })

    if (response.status === 200) {
      alert('註冊成功！')
      router.push('/login')
    } else if (response.status === 409) {
      errorMessage.value = '此帳號已被註冊，請換一個'
    } else if (response.status === 422) {
      errorMessage.value = '輸入格式有誤，請檢查各欄位'
    } else {
      errorMessage.value = '註冊失敗，請稍後再試'
    }
  } catch (error) {
    errorMessage.value = '網路連線錯誤，請檢查網路狀態'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="register-page">
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
        <p class="brand-subtitle">立即加入，開啟全新體驗</p>

        <div class="features-list">
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21V19C16 16.79 14.21 15 12 15H5C2.79 15 1 16.79 1 19V21"/>
                <circle cx="8.5" cy="7" r="4"/>
                <path d="M20 8V14M17 11H23"/>
              </svg>
            </div>
            <div class="feature-text">
              <span class="feature-title">免費註冊</span>
              <span class="feature-desc">快速建立您的專屬帳戶</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="feature-text">
              <span class="feature-title">安全保障</span>
              <span class="feature-desc">嚴格的資料加密保護</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div class="feature-text">
              <span class="feature-title">即刻啟用</span>
              <span class="feature-desc">註冊完成立即使用所有功能</span>
            </div>
          </div>
        </div>
      </div>

      <div class="brand-footer">
        <p>&copy; 2024 Vue Demo. All rights reserved.</p>
      </div>
    </div>

    <!-- 右側註冊區 -->
    <div class="register-section">
      <div class="register-container">
        <div class="register-header">
          <h2>建立帳戶</h2>
          <p>填寫以下資訊來註冊新帳戶</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <Transition name="fade">
            <div v-if="errorMessage" class="error-alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          </Transition>

          <div class="form-row">
            <div class="input-group">
              <label for="uid">帳號</label>
              <div class="input-field">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="uid"
                  v-model="uid"
                  type="text"
                  placeholder="請輸入帳號"
                  autocomplete="username"
                />
              </div>
            </div>

            <div class="input-group">
              <label for="name">姓名</label>
              <div class="input-field">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="name"
                  v-model="name"
                  type="text"
                  placeholder="請輸入姓名"
                  autocomplete="name"
                />
              </div>
            </div>
          </div>

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

          <div class="input-group">
            <label for="birthdate">出生日期</label>
            <div class="input-field">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <input
                id="birthdate"
                v-model="birthdate"
                type="date"
                autocomplete="bday"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="input-group">
              <label for="password">密碼</label>
              <div class="input-field">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="至少 6 位"
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
              <label for="confirmPassword">確認密碼</label>
              <div class="input-field">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="再次輸入密碼"
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
          </div>

          <div class="input-group">
            <label for="description">自我介紹 <span class="optional">（選填）</span></label>
            <div class="input-field textarea-field">
              <textarea
                id="description"
                v-model="description"
                placeholder="簡單介紹一下自己..."
                rows="3"
              ></textarea>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="btn-loading">
              <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              註冊中...
            </span>
            <span v-else>建立帳戶</span>
          </button>
        </form>

        <div class="register-footer">
          <p>已有帳戶？ <RouterLink to="/login">立即登入</RouterLink></p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
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

/* 右側註冊區 */
.register-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: #f8fafc;
}

.register-container {
  width: 100%;
  max-width: 500px;
}

.register-header {
  margin-bottom: 36px;
}

.register-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.register-header p {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .input-group {
  flex: 1;
}

.optional {
  font-weight: 400;
  color: #94a3b8;
  font-size: 13px;
}

.textarea-field textarea {
  width: 100%;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  background: white;
  color: #1e293b;
  transition: all 0.2s;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
}

.textarea-field textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.textarea-field textarea::placeholder {
  color: #94a3b8;
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

/* 註冊按鈕 */
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

/* 底部 */
.register-footer {
  margin-top: 32px;
  text-align: center;
}

.register-footer p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.register-footer a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
}

.register-footer a:hover {
  text-decoration: underline;
}

/* RWD */
@media (max-width: 1024px) {
  .brand-section {
    display: none;
  }

  .register-section {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .register-header h2 {
    font-size: 26px;
  }

  .input-field input {
    padding: 12px 12px 12px 42px;
  }

  .submit-btn {
    padding: 14px;
  }

  .form-row {
    flex-direction: column;
    gap: 18px;
  }
}
</style>
