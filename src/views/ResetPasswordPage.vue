<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserService, ApiError } from '@/api'
import { NInput, NButton, NAlert, NResult } from 'naive-ui'
import { useFormSubmit } from '@/composables/useFormSubmit'
import { validatePassword } from '@/composables/usePasswordValidation'

const route = useRoute()
const router = useRouter()

const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isSuccess = ref(false)
const isInvalidToken = ref(false)

const { loading: isLoading, error: errorMessage, submit } = useFormSubmit(async () => {
  try {
    await UserService.resetPassword({
      token: token.value,
      new_password: newPassword.value
    })
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 400 || e.status === 404) {
        errorMessage.value = '重設連結已失效或無效，請重新申請'
      } else if (e.status === 422) {
        errorMessage.value = '密碼格式不符合要求'
      } else {
        errorMessage.value = '重設失敗，請稍後再試'
      }
      return
    }
    throw e
  }
  isSuccess.value = true
  setTimeout(() => {
    router.push('/login')
  }, 3000)
})

onMounted(() => {
  token.value = (route.query.token as string) || ''
  if (!token.value) {
    isInvalidToken.value = true
  }
})

const handleSubmit = () => submit(() => {
  if (!newPassword.value || !confirmPassword.value) return '請填寫所有欄位'
  return validatePassword(newPassword.value, confirmPassword.value)
})
</script>

<template>
  <div class="page">
    <div class="container">
      <NButton text @click="router.push('/login')" style="margin-bottom: 32px;">
        ← 返回登入
      </NButton>

      <!-- Token 無效 -->
      <template v-if="isInvalidToken">
        <NResult status="error" title="連結無效" description="此重設密碼連結無效或已過期，請重新申請。">
          <template #footer>
            <NButton type="primary" @click="router.push('/forgot-password')">重新申請</NButton>
          </template>
        </NResult>
      </template>

      <!-- 重設成功 -->
      <template v-else-if="isSuccess">
        <NResult status="success" title="密碼重設成功" description="您的密碼已成功重設，即將跳轉至登入頁面..." />
      </template>

      <!-- 重設密碼表單 -->
      <template v-else>
        <div class="header">
          <h2>重設密碼</h2>
          <p>請輸入您的新密碼。</p>
        </div>

        <form @submit.prevent="handleSubmit" class="form">
          <NAlert v-if="errorMessage" type="error" :bordered="false">
            {{ errorMessage }}
          </NAlert>

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
            重設密碼
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
