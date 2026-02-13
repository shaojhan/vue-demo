<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { SsoService, ApiError } from '@/api'
import type { SSOProviderListItem } from '@/api'
import { NButton, NCard, NSpin, NAlert, NEmpty, NTag } from 'naive-ui'
import { isAllowedRedirectUrl } from '@/utils/urlValidation'

const router = useRouter()

const providers = ref<SSOProviderListItem[]>([])
const isLoading = ref(true)
const error = ref('')
const connectingSlug = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await SsoService.listSsoProviders()
    providers.value = res.providers
  } catch (e) {
    if (e instanceof ApiError) {
      error.value = '無法取得 SSO 登入選項，請稍後再試'
    } else {
      error.value = '網路連線錯誤'
    }
  } finally {
    isLoading.value = false
  }
})

const handleSsoLogin = async (slug: string) => {
  if (connectingSlug.value) return

  connectingSlug.value = slug
  error.value = ''

  try {
    const res = await SsoService.ssoLogin(slug)
    if (!isAllowedRedirectUrl(res.redirect_url)) {
      error.value = '不安全的重導向網址，已阻止操作'
      connectingSlug.value = null
      return
    }
    window.location.href = res.redirect_url
  } catch (e) {
    if (e instanceof ApiError) {
      error.value = 'SSO 登入失敗，請稍後再試'
    } else {
      error.value = '網路連線錯誤'
    }
    connectingSlug.value = null
  }
}

const protocolLabel = (protocol: string) => {
  switch (protocol.toUpperCase()) {
    case 'OIDC': return 'OpenID Connect'
    case 'SAML': return 'SAML 2.0'
    default: return protocol
  }
}
</script>

<template>
  <div class="sso-page">
    <NCard style="max-width: 440px; width: 100%;">
      <div class="sso-header">
        <h1>SSO 登入</h1>
        <p>選擇您的組織帳號進行登入</p>
      </div>

      <!-- 載入中 -->
      <div v-if="isLoading" class="center-state">
        <NSpin size="large" />
      </div>

      <!-- 錯誤且無 provider -->
      <template v-else-if="error && providers.length === 0">
        <NAlert type="error" :bordered="false">{{ error }}</NAlert>
      </template>

      <!-- 無可用 provider -->
      <template v-else-if="providers.length === 0">
        <NEmpty description="目前沒有可用的 SSO 登入選項" />
      </template>

      <!-- Provider 列表 -->
      <template v-else>
        <NAlert v-if="error" type="error" :bordered="false" style="margin-bottom: 16px;">
          {{ error }}
        </NAlert>

        <div class="provider-list">
          <div
            v-for="provider in providers"
            :key="provider.slug"
            class="provider-btn"
            :class="{ connecting: connectingSlug === provider.slug }"
            @click="handleSsoLogin(provider.slug)"
          >
            <div class="provider-info">
              <span class="provider-name">{{ provider.name }}</span>
              <NTag size="tiny" :bordered="false">{{ protocolLabel(provider.protocol) }}</NTag>
            </div>
            <NSpin v-if="connectingSlug === provider.slug" size="small" />
          </div>
        </div>
      </template>

      <div class="sso-footer">
        <NButton text @click="router.push('/login')">
          ← 返回一般登入
        </NButton>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
.sso-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f8fafc;
}

.sso-header {
  text-align: center;
  margin-bottom: 32px;
}

.sso-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.sso-header p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.center-state {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.provider-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.provider-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.provider-btn:hover {
  border-color: #6366f1;
  background: #f5f3ff;
}

.provider-btn.connecting {
  border-color: #6366f1;
  background: #eef2ff;
  pointer-events: none;
}

.provider-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.provider-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.sso-footer {
  margin-top: 32px;
  text-align: center;
}
</style>
