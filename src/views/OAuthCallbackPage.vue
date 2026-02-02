<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { OauthService, ApiError, UserRole } from '@/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const errorMessage = ref('')

onMounted(async () => {
  const code = route.query.code as string | undefined
  const accessToken = route.query.access_token as string | undefined

  if (accessToken) {
    // 後端直接 redirect 帶 token 參數
    const expiresIn = Number(route.query.expires_in) || 3600
    const user = {
      id: route.query.user_id as string || '',
      uid: route.query.uid as string || '',
      email: route.query.email as string || '',
      role: ((route.query.role as string) || 'NORMAL') as UserRole
    }
    authStore.login(user, accessToken, expiresIn)
    router.replace('/user')
  } else if (code) {
    // 用 code 換取 token
    try {
      const response = await OauthService.googleCallback(code)
      authStore.login(response.user, response.access_token, response.expires_in)
      router.replace('/user')
    } catch (error) {
      if (error instanceof ApiError) {
        errorMessage.value = '第三方登入失敗，請稍後再試'
      } else {
        errorMessage.value = '網路連線錯誤，請檢查網路狀態'
      }
    }
  } else {
    errorMessage.value = '無效的登入回呼'
  }
})
</script>

<template>
  <div class="callback-page">
    <div class="callback-card">
      <template v-if="errorMessage">
        <div class="icon-circle error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
        </div>
        <h2>登入失敗</h2>
        <p>{{ errorMessage }}</p>
        <RouterLink to="/login" class="back-btn">返回登入頁面</RouterLink>
      </template>
      <template v-else>
        <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        <p>登入處理中，請稍候...</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 24px;
}

.callback-card {
  text-align: center;
  max-width: 400px;
}

.callback-card h2 {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.callback-card p {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 24px;
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.icon-circle.error {
  background: #fef2f2;
}

.icon-circle.error svg {
  width: 28px;
  height: 28px;
  color: #dc2626;
}

.spin {
  width: 40px;
  height: 40px;
  color: #6366f1;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.back-btn {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}
</style>
