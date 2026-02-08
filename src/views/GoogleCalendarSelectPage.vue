<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ScheduleService, ApiError } from '@/api'
import type { GoogleCalendarListItem } from '@/api'

const route = useRoute()
const router = useRouter()

const calendars = ref<GoogleCalendarListItem[]>([])
const isLoading = ref(true)
const isSelecting = ref(false)
const error = ref('')
const selectedId = ref<string | null>(null)

const tokenId = route.query.token_id as string

onMounted(async () => {
  if (!tokenId) {
    error.value = '無效的授權連結，請重新連接 Google Calendar'
    isLoading.value = false
    return
  }

  try {
    const res = await ScheduleService.listGoogleCalendars(tokenId)
    calendars.value = res.calendars
  } catch (e) {
    if (e instanceof ApiError) {
      error.value = '無法取得日曆列表，請重新連接 Google Calendar'
    } else {
      error.value = '網路連線錯誤'
    }
  } finally {
    isLoading.value = false
  }
})

const selectCalendar = async (calendarId: string) => {
  if (isSelecting.value) return

  selectedId.value = calendarId
  isSelecting.value = true
  error.value = ''

  try {
    await ScheduleService.selectGoogleCalendar(calendarId, tokenId)
    router.push('/schedules?google_connected=1')
  } catch (e) {
    if (e instanceof ApiError) {
      error.value = '連接失敗，請稍後再試'
    } else {
      error.value = '網路連線錯誤'
    }
    selectedId.value = null
  } finally {
    isSelecting.value = false
  }
}

const goBack = () => {
  router.push('/schedules')
}
</script>

<template>
  <div class="calendar-select-page">
    <div class="container">
      <div class="header">
        <div class="google-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
        <h1>選擇 Google Calendar</h1>
        <p>請選擇要同步排程的日曆</p>
      </div>

      <div v-if="isLoading" class="loading">
        <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        <span>載入日曆列表中...</span>
      </div>

      <div v-else-if="error && calendars.length === 0" class="error-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ error }}</p>
        <button @click="goBack" class="back-btn">返回排程管理</button>
      </div>

      <template v-else>
        <p v-if="error" class="error-msg">{{ error }}</p>

        <div class="calendar-list">
          <div
            v-for="calendar in calendars"
            :key="calendar.id"
            class="calendar-item"
            :class="{ selected: selectedId === calendar.id, selecting: isSelecting && selectedId === calendar.id }"
            @click="selectCalendar(calendar.id)"
          >
            <div class="calendar-info">
              <div class="calendar-name">
                {{ calendar.summary }}
                <span v-if="calendar.primary" class="primary-badge">主要日曆</span>
              </div>
              <div v-if="calendar.description" class="calendar-desc">{{ calendar.description }}</div>
            </div>
            <div class="calendar-action">
              <svg v-if="isSelecting && selectedId === calendar.id" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>
        </div>

        <button @click="goBack" class="cancel-btn">取消</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.calendar-select-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.google-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
}

.google-icon svg {
  width: 100%;
  height: 100%;
}

.header h1 {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.header p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  color: #64748b;
}

.loading svg {
  width: 32px;
  height: 32px;
  color: #10b981;
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
}

.error-msg {
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
}

.calendar-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.calendar-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-item:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.calendar-item.selected {
  border-color: #10b981;
  background: #ecfdf5;
}

.calendar-item.selecting {
  opacity: 0.7;
  pointer-events: none;
}

.calendar-info {
  flex: 1;
  min-width: 0;
}

.calendar-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.primary-badge {
  font-size: 11px;
  font-weight: 500;
  background: #10b981;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
}

.calendar-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.calendar-action svg {
  width: 20px;
  height: 20px;
  color: #94a3b8;
}

.calendar-item:hover .calendar-action svg {
  color: #10b981;
}

.back-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.cancel-btn {
  width: 100%;
  padding: 14px;
  background: #f1f5f9;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #e2e8f0;
}
</style>
