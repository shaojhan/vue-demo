import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  uid: string
  name?: string
  token?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  const login = (userData: User, authToken: string) => {
    user.value = userData
    token.value = authToken
  }

  const logout = () => {
    user.value = null
    token.value = null
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout
  }
}, {
  persist: true
})
