import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { OpenAPI } from '../api'
import type { LoginUserInfo } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<LoginUserInfo | null>(null)
  const accessToken = ref<string | null>(null)
  const expiresIn = ref<number | null>(null)

  const isLoggedIn = computed(() => !!accessToken.value)

  // 同步 token 到 OpenAPI 配置
  watch(accessToken, (token) => {
    OpenAPI.TOKEN = token || undefined
  }, { immediate: true })

  const login = (userData: LoginUserInfo, token: string, expires: number) => {
    user.value = userData
    accessToken.value = token
    expiresIn.value = expires
  }

  const logout = () => {
    user.value = null
    accessToken.value = null
    expiresIn.value = null
  }

  return {
    user,
    accessToken,
    expiresIn,
    isLoggedIn,
    login,
    logout
  }
}, {
  persist: true
})
