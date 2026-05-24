import { ref, computed } from 'vue'
import { ScheduleService } from '@/api'
import type { GoogleStatusResponse } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { isAllowedRedirectUrl } from '@/utils/urlValidation'

/**
 * Google Calendar 連接狀態與授權流程。僅 ADMIN 會去查詢狀態；
 * connectGoogle 取得授權 URL 後驗證白名單再導向。
 */
export function useGoogleCalendar() {
  const authStore = useAuthStore()

  const googleStatus = ref<GoogleStatusResponse | null>(null)
  const googleLoading = ref(false)
  const googleConnecting = ref(false)
  const showGoogleSuccess = ref(false)

  const isAdmin = computed(() => authStore.user?.role === 'ADMIN')

  const fetchGoogleStatus = async () => {
    if (!isAdmin.value) return

    googleLoading.value = true
    try {
      googleStatus.value = await ScheduleService.getGoogleStatus()
    } catch {
      googleStatus.value = null
    } finally {
      googleLoading.value = false
    }
  }

  const connectGoogle = async () => {
    googleConnecting.value = true
    try {
      const res = await ScheduleService.getGoogleAuthUrl()
      if (!isAllowedRedirectUrl(res.auth_url)) {
        googleConnecting.value = false
        return
      }
      window.location.href = res.auth_url
    } catch {
      googleConnecting.value = false
    }
  }

  // 連接成功後短暫顯示提示
  const flashSuccess = (ms = 5000) => {
    showGoogleSuccess.value = true
    setTimeout(() => {
      showGoogleSuccess.value = false
    }, ms)
  }

  return {
    googleStatus,
    googleLoading,
    googleConnecting,
    showGoogleSuccess,
    isAdmin,
    fetchGoogleStatus,
    connectGoogle,
    flashSuccess,
  }
}
