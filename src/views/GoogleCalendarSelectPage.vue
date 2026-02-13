<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ScheduleService, ApiError } from '@/api'
import type { GoogleCalendarListItem } from '@/api'
import { NCard, NSpin, NAlert, NButton, NTag, NEmpty } from 'naive-ui'

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
</script>

<template>
  <div class="calendar-select-page">
    <NCard style="max-width: 500px; width: 100%;">
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

      <!-- 載入中 -->
      <div v-if="isLoading" class="center-state">
        <NSpin size="large" />
      </div>

      <!-- 錯誤且無日曆 -->
      <template v-else-if="error && calendars.length === 0">
        <NAlert type="error" :bordered="false" style="margin-bottom: 16px;">{{ error }}</NAlert>
        <NButton block @click="router.push('/schedules')">返回排程管理</NButton>
      </template>

      <!-- 無日曆 -->
      <template v-else-if="calendars.length === 0">
        <NEmpty description="沒有可用的日曆" />
      </template>

      <!-- 日曆列表 -->
      <template v-else>
        <NAlert v-if="error" type="error" :bordered="false" style="margin-bottom: 16px;">
          {{ error }}
        </NAlert>

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
                <NTag v-if="calendar.primary" size="tiny" type="success" :bordered="false">主要日曆</NTag>
              </div>
              <div v-if="calendar.description" class="calendar-desc">{{ calendar.description }}</div>
            </div>
            <NSpin v-if="isSelecting && selectedId === calendar.id" size="small" />
          </div>
        </div>

        <NButton block @click="router.push('/schedules')">取消</NButton>
      </template>
    </NCard>
  </div>
</template>

<style scoped>
.calendar-select-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f8fafc;
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

.center-state {
  display: flex;
  justify-content: center;
  padding: 40px 0;
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
  border-radius: 14px;
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

.calendar-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
