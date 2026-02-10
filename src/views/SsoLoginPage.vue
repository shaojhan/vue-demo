<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { SsoService, ApiError } from '@/api'
import type { SSOProviderListItem } from '@/api'

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
    <div class="sso-card">
      <div class="sso-header">
        <svg viewBox="0 0 48 48" fill="none" class="sso-logo">
          <rect width="48" height="48" rx="12" fill="url(#sso-grad)"/>
          <path d="M24 14L14 20V32L24 38L34 32V20L24 14Z" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M24 26L14 20M24 26V38M24 26L34 20" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
          <defs>
            <linearGradient id="sso-grad" x1="0" y1="0" x2="48" y2="48">
              <stop stop-color="#6366f1"/>
              <stop offset="1" stop-color="#8b5cf6"/>
            </linearGradient>
          </defs>
        </svg>
        <h1>SSO 登入</h1>
        <p>選擇您的組織帳號進行登入</p>
      </div>

      <!-- 載入中 -->
      <div v-if="isLoading" class="loading-state">
        <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        <span>載入中...</span>
      </div>

      <!-- 錯誤且無 provider -->
      <div v-else-if="error && providers.length === 0" class="error-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ error }}</p>
      </div>

      <!-- 無可用 provider -->
      <div v-else-if="providers.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <p>目前沒有可用的 SSO 登入選項</p>
      </div>

      <!-- Provider 列表 -->
      <template v-else>
        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="provider-list">
          <button
            v-for="provider in providers"
            :key="provider.slug"
            class="provider-btn"
            :class="{ connecting: connectingSlug === provider.slug }"
            :disabled="connectingSlug !== null"
            @click="handleSsoLogin(provider.slug)"
          >
            <div class="provider-icon">
              <svg v-if="provider.protocol.toUpperCase() === 'OIDC'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="provider-info">
              <span class="provider-name">{{ provider.name }}</span>
              <span class="provider-protocol">{{ protocolLabel(provider.protocol) }}</span>
            </div>
            <div class="provider-action">
              <svg v-if="connectingSlug === provider.slug" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </button>
        </div>
      </template>

      <div class="sso-footer">
        <RouterLink to="/login" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          返回一般登入
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sso-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #f0f9ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.sso-card {
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.sso-header {
  text-align: center;
  margin-bottom: 32px;
}

.sso-logo {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  color: #64748b;
}

.loading-state svg {
  width: 32px;
  height: 32px;
  color: #6366f1;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 0;
  text-align: center;
}

.error-state svg {
  width: 48px;
  height: 48px;
  color: #dc2626;
}

.error-state p {
  color: #64748b;
  margin: 0;
  font-size: 15px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 0;
  text-align: center;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  color: #94a3b8;
}

.empty-state p {
  color: #64748b;
  margin: 0;
  font-size: 15px;
}

.error-msg {
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.provider-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.provider-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px 18px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.provider-btn:hover:not(:disabled) {
  border-color: #6366f1;
  background: #f5f3ff;
}

.provider-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.provider-btn.connecting {
  border-color: #6366f1;
  background: #eef2ff;
}

.provider-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.provider-icon svg {
  width: 22px;
  height: 22px;
  color: white;
}

.provider-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.provider-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.provider-protocol {
  font-size: 12px;
  color: #94a3b8;
}

.provider-action svg {
  width: 20px;
  height: 20px;
  color: #94a3b8;
}

.provider-btn:hover:not(:disabled) .provider-action svg {
  color: #6366f1;
}

.sso-footer {
  margin-top: 32px;
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #6366f1;
  text-decoration: none;
  transition: all 0.2s;
}

.back-link:hover {
  color: #4f46e5;
}

.back-link svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 480px) {
  .sso-card {
    padding: 28px 20px;
  }
}
</style>
