<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { NInput, NButton, NAlert, NDatePicker, NGrid, NGi } from 'naive-ui'
import { useFormSubmit } from '@/composables/useFormSubmit'
import { validatePassword } from '@/composables/usePasswordValidation'

const router = useRouter()

const uid = ref('')
const password = ref('')
const confirmPassword = ref('')
const email = ref('')
const name = ref('')
const birthdate = ref<number | null>(null)
const description = ref('')

const { loading: isLoading, error: errorMessage, submit } = useFormSubmit(async () => {
  const birthdateStr = new Date(birthdate.value!).toISOString().split('T')[0]
  const response = await fetch('/api/users/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: uid.value,
      pwd: password.value,
      email: email.value,
      name: name.value,
      birthdate: birthdateStr,
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
})

const handleRegister = () => submit(() => {
  if (!uid.value || !password.value || !confirmPassword.value || !email.value || !name.value || !birthdate.value) {
    return '請填寫所有必填欄位'
  }
  return validatePassword(password.value, confirmPassword.value)
})
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
          <NAlert v-if="errorMessage" type="error" :bordered="false">
            {{ errorMessage }}
          </NAlert>

          <NGrid :cols="2" :x-gap="16" responsive="screen" item-responsive>
            <NGi span="2 m:1">
              <div class="form-item">
                <label>帳號</label>
                <NInput v-model:value="uid" placeholder="請輸入帳號" size="large" />
              </div>
            </NGi>
            <NGi span="2 m:1">
              <div class="form-item">
                <label>姓名</label>
                <NInput v-model:value="name" placeholder="請輸入姓名" size="large" />
              </div>
            </NGi>
          </NGrid>

          <div class="form-item">
            <label>電子郵件</label>
            <NInput v-model:value="email" type="text" placeholder="name@example.com" size="large" />
          </div>

          <div class="form-item">
            <label>出生日期</label>
            <NDatePicker v-model:value="birthdate" type="date" style="width: 100%;" size="large" />
          </div>

          <NGrid :cols="2" :x-gap="16" responsive="screen" item-responsive>
            <NGi span="2 m:1">
              <div class="form-item">
                <label>密碼</label>
                <NInput
                  v-model:value="password"
                  type="password"
                  show-password-on="click"
                  placeholder="至少 6 位"
                  size="large"
                />
              </div>
            </NGi>
            <NGi span="2 m:1">
              <div class="form-item">
                <label>確認密碼</label>
                <NInput
                  v-model:value="confirmPassword"
                  type="password"
                  show-password-on="click"
                  placeholder="再次輸入密碼"
                  size="large"
                />
              </div>
            </NGi>
          </NGrid>

          <div class="form-item">
            <label>自我介紹 <span class="optional">（選填）</span></label>
            <NInput
              v-model:value="description"
              type="textarea"
              placeholder="簡單介紹一下自己..."
              :rows="3"
              size="large"
            />
          </div>

          <NButton
            type="primary"
            size="large"
            block
            :loading="isLoading"
            attr-type="submit"
          >
            建立帳戶
          </NButton>
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

.optional {
  font-weight: 400;
  color: #94a3b8;
  font-size: 13px;
}

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
}
</style>
