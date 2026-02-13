<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { OauthService, UserService, OpenAPI, ApiError } from '@/api'
import { NSpin, NResult, NButton } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const errorMessage = ref('')

onMounted(async () => {
  const code = route.query.code as string | undefined

  if (code) {
    // 清除 URL 中的 code 參數
    window.history.replaceState({}, '', route.path)

    try {
      const tokenRes = await OauthService.googleExchangeCode({ code })
      // 先設定 token 以便後續 API 呼叫帶上認證
      OpenAPI.TOKEN = tokenRes.access_token
      const userRes = await UserService.getCurrentUser()
      authStore.login(
        { id: userRes.id, uid: userRes.uid, email: userRes.email, role: userRes.role },
        tokenRes.access_token,
        tokenRes.expires_in
      )
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
    <template v-if="errorMessage">
      <NResult status="error" title="登入失敗" :description="errorMessage">
        <template #footer>
          <NButton type="primary" @click="router.push('/login')">返回登入頁面</NButton>
        </template>
      </NResult>
    </template>
    <template v-else>
      <NSpin size="large" />
      <p style="margin-top: 20px; color: #64748b;">登入處理中，請稍候...</p>
    </template>
  </div>
</template>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  padding: 24px;
}
</style>
