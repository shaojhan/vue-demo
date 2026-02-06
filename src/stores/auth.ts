import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { OpenAPI } from '@/api'
import type { LoginUserInfo } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<LoginUserInfo | null>(null)
  const accessToken = ref<string | null>(null)
  const expiresAt = ref<number | null>(null) // 過期時間戳 (ms)

  // 檢查 token 是否有效（存在且未過期）
  const isLoggedIn = computed(() => {
    if (!accessToken.value || !expiresAt.value) return false
    return Date.now() < expiresAt.value
  })

  // 檢查 token 是否已過期
  const isExpired = computed(() => {
    if (!expiresAt.value) return false
    return Date.now() >= expiresAt.value
  })

  // 同步 token 到 OpenAPI 配置
  watch(accessToken, (token) => {
    OpenAPI.TOKEN = token || undefined
  }, { immediate: true })

  const login = (userData: LoginUserInfo, token: string, expiresIn: number) => {
    user.value = userData
    accessToken.value = token
    // 將 expiresIn（秒）轉換為過期時間戳
    expiresAt.value = Date.now() + expiresIn * 1000
  }

  const logout = () => {
    user.value = null
    accessToken.value = null
    expiresAt.value = null
  }

  return {
    user,
    accessToken,
    expiresAt,
    isLoggedIn,
    isExpired,
    login,
    logout
  }
}, {
  persist: true
})
