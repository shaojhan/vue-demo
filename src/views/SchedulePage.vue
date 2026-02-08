<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ScheduleService, ApiError } from '@/api'
import type { ScheduleListItem, ScheduleResponse, GoogleStatusResponse } from '@/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Google Calendar 狀態
const googleStatus = ref<GoogleStatusResponse | null>(null)
const googleLoading = ref(false)
const googleConnecting = ref(false)
const showGoogleSuccess = ref(false)

// 排程列表
const schedules = ref<ScheduleListItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const loading = ref(false)
const totalPages = computed(() => Math.ceil(total.value / pageSize))

// 日期篩選
const filterStartFrom = ref('')
const filterStartTo = ref('')

// 新增/編輯 Modal
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const formTitle = ref('')
const formDescription = ref('')
const formLocation = ref('')
const formStartTime = ref('')
const formEndTime = ref('')
const formAllDay = ref(false)
const formSaving = ref(false)
const formError = ref('')

// 詳情 Modal
const showDetailModal = ref(false)
const currentSchedule = ref<ScheduleResponse | null>(null)
const detailLoading = ref(false)

// 取得排程列表
const fetchSchedules = async (p = 1) => {
  loading.value = true
  try {
    const res = await ScheduleService.listSchedules(
      p,
      pageSize,
      filterStartFrom.value || undefined,
      filterStartTo.value || undefined
    )
    schedules.value = res.items
    total.value = res.total
    page.value = res.page
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      router.push('/user')
    }
    schedules.value = []
  } finally {
    loading.value = false
  }
}

// 開啟新增 Modal
const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  formTitle.value = ''
  formDescription.value = ''
  formLocation.value = ''
  formStartTime.value = ''
  formEndTime.value = ''
  formAllDay.value = false
  formError.value = ''
  showModal.value = true
}

// 開啟編輯 Modal
const openEditModal = (schedule: ScheduleListItem) => {
  isEditing.value = true
  editingId.value = schedule.id
  formTitle.value = schedule.title
  formDescription.value = schedule.description || ''
  formLocation.value = schedule.location || ''
  formStartTime.value = formatDateTimeLocal(schedule.start_time)
  formEndTime.value = formatDateTimeLocal(schedule.end_time)
  formAllDay.value = schedule.all_day
  formError.value = ''
  showModal.value = true
}

// 關閉 Modal
const closeModal = () => {
  showModal.value = false
  formError.value = ''
}

// 儲存排程
const handleSave = async () => {
  if (!formTitle.value.trim()) {
    formError.value = '請輸入標題'
    return
  }
  if (!formStartTime.value || !formEndTime.value) {
    formError.value = '請選擇開始和結束時間'
    return
  }

  formSaving.value = true
  formError.value = ''

  try {
    const data = {
      title: formTitle.value.trim(),
      description: formDescription.value.trim() || null,
      location: formLocation.value.trim() || null,
      start_time: new Date(formStartTime.value).toISOString(),
      end_time: new Date(formEndTime.value).toISOString(),
      all_day: formAllDay.value
    }

    if (isEditing.value && editingId.value) {
      await ScheduleService.updateSchedule(editingId.value, data)
    } else {
      await ScheduleService.createSchedule(data)
    }

    showModal.value = false
    fetchSchedules(page.value)
  } catch (error) {
    if (error instanceof ApiError) {
      formError.value = '儲存失敗，請稍後再試'
    } else {
      formError.value = '網路連線錯誤'
    }
  } finally {
    formSaving.value = false
  }
}

// 開啟詳情
const openDetail = async (scheduleId: string) => {
  showDetailModal.value = true
  detailLoading.value = true
  currentSchedule.value = null

  try {
    currentSchedule.value = await ScheduleService.getSchedule(scheduleId)
  } catch {
    showDetailModal.value = false
  } finally {
    detailLoading.value = false
  }
}

// 刪除排程
const handleDelete = async (scheduleId: string) => {
  if (!confirm('確定要刪除此排程嗎？')) return

  try {
    await ScheduleService.deleteSchedule(scheduleId)
    fetchSchedules(page.value)
    if (showDetailModal.value) {
      showDetailModal.value = false
    }
  } catch {
    // 忽略錯誤
  }
}

// 篩選
const applyFilter = () => {
  page.value = 1
  fetchSchedules()
}

// 清除篩選
const clearFilter = () => {
  filterStartFrom.value = ''
  filterStartTo.value = ''
  page.value = 1
  fetchSchedules()
}

// 格式化日期時間
const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化為 datetime-local input
const formatDateTimeLocal = (dateStr: string) => {
  const date = new Date(dateStr)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60 * 1000)
  return localDate.toISOString().slice(0, 16)
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-TW')
}

// 登出
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// 取得 Google Calendar 狀態
const fetchGoogleStatus = async () => {
  if (authStore.user?.role !== 'ADMIN') return

  googleLoading.value = true
  try {
    googleStatus.value = await ScheduleService.getGoogleStatus()
  } catch {
    googleStatus.value = null
  } finally {
    googleLoading.value = false
  }
}

// 連接 Google Calendar
const connectGoogle = async () => {
  googleConnecting.value = true
  try {
    const res = await ScheduleService.getGoogleAuthUrl()
    window.location.href = res.auth_url
  } catch {
    googleConnecting.value = false
  }
}

onMounted(() => {
  fetchSchedules()
  fetchGoogleStatus()

  // 檢查是否剛連接完成
  if (route.query.google_connected === '1') {
    showGoogleSuccess.value = true
    setTimeout(() => {
      showGoogleSuccess.value = false
    }, 5000)
    // 清除 query 參數
    router.replace({ path: '/schedules' })
  }
})
</script>

<template>
  <div class="schedule-page">
    <nav class="top-nav">
      <div class="nav-brand">
        <svg viewBox="0 0 48 48" fill="none" class="nav-logo">
          <rect width="48" height="48" rx="12" fill="url(#grad)"/>
          <path d="M24 14L14 20V32L24 38L34 32V20L24 14Z" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
          <path d="M24 26L14 20M24 26V38M24 26L34 20" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="48" y2="48">
              <stop stop-color="#6366f1"/>
              <stop offset="1" stop-color="#8b5cf6"/>
            </linearGradient>
          </defs>
        </svg>
        <span>Vue Demo</span>
        <span class="nav-badge">排程管理</span>
      </div>
      <div class="nav-actions">
        <RouterLink to="/user" class="nav-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          個人頁面
        </RouterLink>
        <button class="logout-btn" @click="handleLogout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          登出
        </button>
      </div>
    </nav>

    <main class="schedule-content">
      <!-- Google 連接成功提示 -->
      <Transition name="fade">
        <div v-if="showGoogleSuccess" class="success-alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Google Calendar 連接成功！</span>
        </div>
      </Transition>

      <!-- Google Calendar 狀態 (Admin only) -->
      <div v-if="authStore.user?.role === 'ADMIN'" class="google-status-card">
        <div class="google-status-info">
          <div class="google-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <div class="google-status-text">
            <span class="google-title">Google Calendar</span>
            <span v-if="googleLoading" class="google-desc">檢查連接狀態中...</span>
            <span v-else-if="googleStatus?.connected" class="google-desc connected">
              已連接 · {{ googleStatus.calendar_id }}
            </span>
            <span v-else class="google-desc">尚未連接</span>
          </div>
        </div>
        <button
          v-if="!googleLoading"
          class="google-connect-btn"
          :class="{ connected: googleStatus?.connected }"
          :disabled="googleConnecting"
          @click="connectGoogle"
        >
          <svg v-if="googleConnecting" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
          <template v-else>
            {{ googleStatus?.connected ? '重新連接' : '連接 Google' }}
          </template>
        </button>
      </div>

      <div class="page-header">
        <div>
          <h1>排程管理</h1>
          <p>管理您的工作排程</p>
        </div>
        <button class="create-btn" @click="openCreateModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          新增排程
        </button>
      </div>

      <!-- 篩選區 -->
      <div class="filter-section">
        <div class="filter-group">
          <label>開始日期</label>
          <input type="date" v-model="filterStartFrom" />
        </div>
        <div class="filter-group">
          <label>結束日期</label>
          <input type="date" v-model="filterStartTo" />
        </div>
        <button class="filter-btn" @click="applyFilter">篩選</button>
        <button class="clear-btn" @click="clearFilter">清除</button>
      </div>

      <div class="schedule-card">
        <!-- 排程列表 -->
        <div v-if="loading" class="loading-state">
          <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
          載入中...
        </div>

        <div v-else-if="schedules.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p>尚無排程</p>
        </div>

        <div v-else class="schedule-list">
          <div
            v-for="schedule in schedules"
            :key="schedule.id"
            class="schedule-item"
            @click="openDetail(schedule.id)"
          >
            <div class="schedule-time">
              <span class="time-date">{{ formatDate(schedule.start_time) }}</span>
              <span v-if="!schedule.all_day" class="time-hour">
                {{ new Date(schedule.start_time).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) }}
              </span>
              <span v-else class="time-allday">全天</span>
            </div>
            <div class="schedule-body">
              <div class="schedule-title">{{ schedule.title }}</div>
              <div v-if="schedule.location" class="schedule-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {{ schedule.location }}
              </div>
              <div v-if="schedule.creator" class="schedule-creator">
                建立者: {{ schedule.creator.username }}
              </div>
            </div>
            <div class="schedule-actions">
              <span v-if="schedule.is_synced" class="sync-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </span>
              <button
                v-if="schedule.creator?.user_id === authStore.user?.id"
                class="edit-btn"
                @click.stop="openEditModal(schedule)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 分頁 -->
        <div v-if="totalPages > 1" class="pagination">
          <button :disabled="page <= 1" @click="fetchSchedules(page - 1)">上一頁</button>
          <span>第 {{ page }} / {{ totalPages }} 頁</span>
          <button :disabled="page >= totalPages" @click="fetchSchedules(page + 1)">下一頁</button>
        </div>
      </div>
    </main>

    <!-- 新增/編輯 Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ isEditing ? '編輯排程' : '新增排程' }}</h3>
            <button class="close-btn" @click="closeModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <Transition name="fade">
              <div v-if="formError" class="error-alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
                <span>{{ formError }}</span>
              </div>
            </Transition>

            <div class="form-group">
              <label>標題 *</label>
              <input v-model="formTitle" type="text" placeholder="輸入排程標題..." />
            </div>

            <div class="form-group">
              <label>說明</label>
              <textarea v-model="formDescription" placeholder="輸入排程說明..." rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>地點</label>
              <input v-model="formLocation" type="text" placeholder="輸入地點..." />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>開始時間 *</label>
                <input v-model="formStartTime" type="datetime-local" />
              </div>
              <div class="form-group">
                <label>結束時間 *</label>
                <input v-model="formEndTime" type="datetime-local" />
              </div>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input v-model="formAllDay" type="checkbox" />
                <span>全天活動</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button class="cancel-btn" @click="closeModal">取消</button>
            <button class="save-btn" :disabled="formSaving" @click="handleSave">
              <span v-if="formSaving">
                <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                儲存中...
              </span>
              <span v-else>儲存</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 詳情 Modal -->
    <Transition name="modal">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
        <div class="modal-content detail-modal">
          <div class="modal-header">
            <h3>{{ currentSchedule?.title || '載入中...' }}</h3>
            <button class="close-btn" @click="showDetailModal = false">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="detailLoading" class="loading-state">
              <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              載入中...
            </div>

            <template v-else-if="currentSchedule">
              <div class="detail-item">
                <span class="detail-label">時間</span>
                <span class="detail-value">
                  {{ formatDateTime(currentSchedule.start_time) }} - {{ formatDateTime(currentSchedule.end_time) }}
                  <span v-if="currentSchedule.all_day" class="allday-tag">全天</span>
                </span>
              </div>

              <div v-if="currentSchedule.location" class="detail-item">
                <span class="detail-label">地點</span>
                <span class="detail-value">{{ currentSchedule.location }}</span>
              </div>

              <div v-if="currentSchedule.description" class="detail-item">
                <span class="detail-label">說明</span>
                <span class="detail-value">{{ currentSchedule.description }}</span>
              </div>

              <div v-if="currentSchedule.creator" class="detail-item">
                <span class="detail-label">建立者</span>
                <span class="detail-value">{{ currentSchedule.creator.username }}</span>
              </div>

              <div class="detail-item">
                <span class="detail-label">Google 同步</span>
                <span class="detail-value">
                  <span v-if="currentSchedule.google_sync.is_synced" class="sync-status synced">已同步</span>
                  <span v-else class="sync-status not-synced">未同步</span>
                </span>
              </div>
            </template>
          </div>

          <div v-if="currentSchedule && currentSchedule.creator?.user_id === authStore.user?.id" class="modal-footer">
            <button class="delete-btn" @click="handleDelete(currentSchedule.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
              刪除
            </button>
            <button class="edit-action-btn" @click="showDetailModal = false; openEditModal(currentSchedule as ScheduleListItem)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              編輯
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.schedule-page {
  min-height: 100vh;
  background: #f8fafc;
}

/* 頂部導航 */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.nav-logo {
  width: 36px;
  height: 36px;
}

.nav-badge {
  padding: 4px 10px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-link:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #eef2ff;
}

.nav-link svg {
  width: 18px;
  height: 18px;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.logout-btn svg {
  width: 18px;
  height: 18px;
}

/* 主要內容 */
.schedule-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px;
}

/* 成功提示 */
.success-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #dcfce7;
  border: 1px solid #86efac;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #16a34a;
  margin-bottom: 24px;
}

.success-alert svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Google Calendar 狀態卡片 */
.google-status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 24px;
}

.google-status-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.google-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.google-icon svg {
  width: 32px;
  height: 32px;
}

.google-status-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.google-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.google-desc {
  font-size: 13px;
  color: #64748b;
}

.google-desc.connected {
  color: #16a34a;
}

.google-connect-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #4285F4 0%, #1a73e8 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.google-connect-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
}

.google-connect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-connect-btn.connected {
  background: #f1f5f9;
  color: #64748b;
}

.google-connect-btn.connected:hover:not(:disabled) {
  background: #e2e8f0;
  box-shadow: none;
}

.google-connect-btn svg {
  width: 18px;
  height: 18px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.page-header p {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.create-btn svg {
  width: 20px;
  height: 20px;
}

/* 篩選區 */
.filter-section {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.filter-group input {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  background: white;
}

.filter-group input:focus {
  outline: none;
  border-color: #6366f1;
}

.filter-btn {
  padding: 10px 20px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #4f46e5;
}

.clear-btn {
  padding: 10px 20px;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

/* 排程卡片 */
.schedule-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

/* 載入與空狀態 */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
  gap: 12px;
}

.loading-state svg,
.empty-state svg {
  width: 48px;
  height: 48px;
}

.empty-state p {
  font-size: 15px;
  margin: 0;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 排程列表 */
.schedule-list {
  max-height: 600px;
  overflow-y: auto;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
}

.schedule-item:hover {
  background: #f8fafc;
}

.schedule-item:last-child {
  border-bottom: none;
}

.schedule-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.time-date {
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
}

.time-hour {
  font-size: 12px;
  color: #64748b;
}

.time-allday {
  font-size: 11px;
  color: #10b981;
  background: #dcfce7;
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 4px;
}

.schedule-body {
  flex: 1;
  min-width: 0;
}

.schedule-title {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.schedule-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.schedule-location svg {
  width: 14px;
  height: 14px;
}

.schedule-creator {
  font-size: 12px;
  color: #94a3b8;
}

.schedule-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sync-badge {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #10b981;
}

.sync-badge svg {
  width: 18px;
  height: 18px;
}

.edit-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #eef2ff;
  color: #6366f1;
}

.edit-btn svg {
  width: 18px;
  height: 18px;
}

/* 分頁 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  font-size: 14px;
  color: #64748b;
}

.pagination button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  border-color: #6366f1;
  color: #6366f1;
  background: #eef2ff;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.detail-modal {
  max-width: 480px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
}

/* Form */
.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  color: #1e293b;
  background: white;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #6366f1;
}

.checkbox-group span {
  font-size: 14px;
  color: #374151;
}

/* Alerts */
.error-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 14px;
  color: #dc2626;
  margin-bottom: 20px;
}

.error-alert svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Buttons */
.cancel-btn {
  padding: 12px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-btn svg {
  width: 18px;
  height: 18px;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fee2e2;
}

.delete-btn svg {
  width: 18px;
  height: 18px;
}

.edit-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #6366f1;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-action-btn:hover {
  background: #e0e7ff;
}

.edit-action-btn svg {
  width: 18px;
  height: 18px;
}

/* 詳情項目 */
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 15px;
  color: #1e293b;
}

.allday-tag {
  display: inline-block;
  padding: 2px 8px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 8px;
}

.sync-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.sync-status.synced {
  background: #dcfce7;
  color: #16a34a;
}

.sync-status.not-synced {
  background: #f1f5f9;
  color: #64748b;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
}

/* RWD */
@media (max-width: 640px) {
  .top-nav {
    padding: 12px 16px;
  }

  .nav-actions span {
    display: none;
  }

  .schedule-content {
    padding: 24px 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .create-btn {
    width: 100%;
    justify-content: center;
  }

  .filter-section {
    flex-wrap: wrap;
  }

  .filter-group {
    flex: 1;
    min-width: 120px;
  }

  .schedule-item {
    padding: 16px;
    flex-wrap: wrap;
  }

  .schedule-time {
    min-width: 60px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 16px;
    max-height: calc(100vh - 32px);
  }
}
</style>
