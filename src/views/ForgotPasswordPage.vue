<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserService, ApiError } from '@/api'
import { NInput, NButton, NAlert, NResult } from 'naive-ui'

const router = useRouter()

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
      <NButton text @click="router.push('/login')" style="margin-bottom: 32px;">
        ← 返回登入
      </NButton>

      <!-- 已發送成功 -->
      <template v-if="isSent">
        <NResult status="success" title="郵件已發送" :description="`重設密碼的連結已發送至 ${email}，請查收信箱並點擊連結重設密碼。`">
          <template #footer>
            <NButton @click="isSent = false">重新發送</NButton>
          </template>
        </NResult>
      </template>

      <!-- 輸入 email 表單 -->
      <template v-else>
        <div class="header">
          <h2>忘記密碼</h2>
          <p>請輸入您的電子郵件，我們將發送重設密碼的連結給您。</p>
        </div>

        <form @submit.prevent="handleSubmit" class="form">
          <NAlert v-if="errorMessage" type="error" :bordered="false">
            {{ errorMessage }}
          </NAlert>

          <div class="form-item">
            <label>電子郵件</label>
            <NInput
              v-model:value="email"
              placeholder="name@example.com"
              size="large"
              autocomplete="email"
            />
          </div>

          <NButton
            type="primary"
            size="large"
            block
            :loading="isLoading"
            attr-type="submit"
          >
            發送重設連結
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
