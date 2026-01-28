<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})
const isLoading = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
  if (!formData.value.username || !formData.value.email || !formData.value.password) {
    errorMessage.value = '請填寫所有必填欄位'
    return
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    errorMessage.value = '兩次輸入的密碼不一致'
    return
  }

  if (formData.value.password.length < 6) {
    errorMessage.value = '密碼長度至少需要 6 個字元'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert('註冊成功！')
    router.push('/login')
  } catch (error) {
    errorMessage.value = '註冊失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <div class="register-card">
      <div class="logo-section">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M16 21V19C16 16.79 14.21 15 12 15H5C2.79 15 1 16.79 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            <path d="M20 8V14M17 11H23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <div class="register-header">
        <h1>建立帳戶</h1>
        <p>加入我們，開始您的旅程</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="form-group">
          <label for="username">用戶名</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="請輸入用戶名"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">電子郵件</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="請輸入電子郵件"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">密碼</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="請輸入密碼（至少 6 位）"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">確認密碼</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            placeholder="請再次輸入密碼"
            required
          />
        </div>

        <button type="submit" class="register-button" :disabled="isLoading">
          <span v-if="isLoading">註冊中...</span>
          <span v-else>註冊</span>
        </button>
      </form>

      <div class="register-footer">
        <p>已有帳戶？ <RouterLink to="/login">立即登入</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  filter: blur(60px);
  animation: float 8s ease-in-out infinite;
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -100px;
  right: -100px;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -50px;
  left: -50px;
  animation-delay: -4s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -30px) scale(1.1); }
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  padding: 48px 40px;
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 1;
  animation: cardEntry 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes cardEntry {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.logo-section {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.logo {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.logo svg {
  width: 32px;
  height: 32px;
  color: white;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-header h1 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #1a1a2e 0%, #302b63 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px 0;
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

.error-message {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #fca5a5;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s;
  background: #f9fafb;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

.register-button {
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
}

.register-button:disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.register-footer {
  margin-top: 28px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.register-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.register-footer a:hover {
  color: #764ba2;
}

@media (max-width: 480px) {
  .register-card {
    padding: 36px 24px;
  }

  .register-header h1 {
    font-size: 26px;
  }
}
</style>
