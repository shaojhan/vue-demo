import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useLogout() {
  const router = useRouter()
  const authStore = useAuthStore()

  const logout = () => {
    authStore.logout()
    router.push('/login')
  }

  return { logout }
}
