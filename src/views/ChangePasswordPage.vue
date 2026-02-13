<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserService, ApiError } from '@/api'
import { NInput, NButton, NAlert, NResult } from 'naive-ui'
import { useFormSubmit } from '@/composables/useFormSubmit'
import { validatePassword } from '@/composables/usePasswordValidation'

const router = useRouter()
const authStore = useAuthStore()

const userId = ref('')
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isSuccess = ref(false)

const { loading: isLoading, error: errorMessage, submit } = useFormSubmit(async () => {
  try {
    await UserService.updatePassword({
      user_id: userId.value,
      old_password: oldPassword.value,
      new_password: newPassword.value
    })
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      errorMessage.value = '舊密碼不正確'
      return
    }
    throw e
  }
  isSuccess.value = true
  setTimeout(() => {
    router.push('/user')
  }, 2000)
})

onMounted(async () => {
  try {
    const user = await UserService.getCurrentUser()
    userId.value = user.id
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  }
})

const handleSubmit = () => submit(() => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) return '請填寫所有欄位'
  const pwdError = validatePassword(newPassword.value, confirmPassword.value)
  if (pwdError) return pwdError
  if (!userId.value) return '無法取得使用者資訊'
  return null
})
</script>

<template>
  <div class="page">
    <div class="container">
      <NButton text @click="router.push('/user')" style="margin-bottom: 32px;">
        ← 返回個人頁面
      </NButton>

      <!-- 修改成功 -->
      <template v-if="isSuccess">
        <NResult status="success" title="密碼修改成功" description="您的密碼已成功修改，即將返回個人頁面..." />
      </template>

      <!-- 修改密碼表單 -->
      <template v-else>
        <div class="header">
          <h2>修改密碼</h2>
          <p>請輸入您的舊密碼和新密碼。</p>
        </div>

        <form @submit.prevent="handleSubmit" class="form">
          <NAlert v-if="errorMessage" type="error" :bordered="false">
            {{ errorMessage }}
          </NAlert>

          <div class="form-item">
            <label>舊密碼</label>
            <NInput
              v-model:value="oldPassword"
              type="password"
              show-password-on="click"
              placeholder="請輸入目前的密碼"
              size="large"
              autocomplete="current-password"
            />
          </div>

          <div class="form-item">
            <label>新密碼</label>
            <NInput
              v-model:value="newPassword"
              type="password"
              show-password-on="click"
              placeholder="請輸入新密碼（至少 6 位）"
              size="large"
              autocomplete="new-password"
            />
          </div>

          <div class="form-item">
            <label>確認新密碼</label>
            <NInput
              v-model:value="confirmPassword"
              type="password"
              show-password-on="click"
              placeholder="請再次輸入新密碼"
              size="large"
              autocomplete="new-password"
            />
          </div>

          <NButton
            type="primary"
            size="large"
            block
            :loading="isLoading"
            attr-type="submit"
          >
            確認修改
          </NButton>
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

.header {
  text-align: center;
  margin-bottom: 36px;
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

@media (max-width: 480px) {
  .header h2 {
    font-size: 24px;
  }
}
</style>
