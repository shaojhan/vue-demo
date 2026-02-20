<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ScheduleService, ChatService, ApiError } from '@/api'
import { isAllowedRedirectUrl } from '@/utils/urlValidation'
import type { ScheduleListItem, ScheduleResponse, GoogleStatusResponse, MessageItem, ActionTakenItem } from '@/api'
import {
  NButton, NCard, NAlert, NInput, NModal,
  NSpace, NTag, NCheckbox, NDatePicker, NDescriptions,
  NDescriptionsItem, useDialog
} from 'naive-ui'
import type { ColDef, RowClickedEvent } from 'ag-grid-community'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { useFormSubmit } from '@/composables/useFormSubmit'
import { useModal } from '@/composables/useModal'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import LoadingState from '@/components/LoadingState.vue'
import PaginationBar from '@/components/PaginationBar.vue'
import DataGrid from '@/components/DataGrid.vue'
import FormField from '@/components/FormField.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const dialog = useDialog()


// Google Calendar 狀態
const googleStatus = ref<GoogleStatusResponse | null>(null)
const googleLoading = ref(false)
const googleConnecting = ref(false)
const showGoogleSuccess = ref(false)

// 日期篩選 (timestamp)
const filterStartFrom = ref<number | null>(null)
const filterStartTo = ref<number | null>(null)

// 排程列表
const { items: schedules, total, page, pageSize, loading, fetch: fetchSchedules, reset: resetSchedules } = usePaginatedList(
  async (p) => {
    try {
      return await ScheduleService.listSchedules(
        p,
        10,
        filterStartFrom.value ? new Date(filterStartFrom.value).toISOString().slice(0, 10) : undefined,
        filterStartTo.value ? new Date(filterStartTo.value).toISOString().slice(0, 10) : undefined
      )
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        router.push('/user')
      }
      throw error
    }
  }
)

// 新增/編輯 Modal
const { show: showModal, open: openModal, close: closeModal } = useModal()
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const formTitle = ref('')
const formDescription = ref('')
const formLocation = ref('')
const formStartTime = ref<number | null>(null)
const formEndTime = ref<number | null>(null)
const formAllDay = ref(false)

// 儲存排程表單
const { loading: formSaving, error: formError, submit: submitForm } = useFormSubmit(async () => {
  const data = {
    title: formTitle.value.trim(),
    description: formDescription.value.trim() || null,
    location: formLocation.value.trim() || null,
    start_time: new Date(formStartTime.value!).toISOString(),
    end_time: new Date(formEndTime.value!).toISOString(),
    all_day: formAllDay.value,
    sync_to_google: !!googleStatus.value?.connected
  }

  if (isEditing.value && editingId.value) {
    await ScheduleService.updateSchedule(editingId.value, data)
  } else {
    await ScheduleService.createSchedule(data)
  }

  closeModal()
  fetchSchedules(page.value)
})

// 詳情 Modal
const { show: showDetailModal, close: closeDetailModal } = useModal()
const currentSchedule = ref<ScheduleResponse | null>(null)
const detailLoading = ref(false)

// 開啟新增 Modal
const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  formTitle.value = ''
  formDescription.value = ''
  formLocation.value = ''
  formStartTime.value = null
  formEndTime.value = null
  formAllDay.value = false
  formError.value = ''
  openModal()
}

// 開啟編輯 Modal
const openEditModal = (schedule: ScheduleListItem) => {
  isEditing.value = true
  editingId.value = schedule.id
  formTitle.value = schedule.title
  formDescription.value = schedule.description || ''
  formLocation.value = schedule.location || ''
  formStartTime.value = new Date(schedule.start_time).getTime()
  formEndTime.value = new Date(schedule.end_time).getTime()
  formAllDay.value = schedule.all_day
  formError.value = ''
  openModal()
}

// 儲存排程
const handleSave = () => submitForm(() => {
  if (!formTitle.value.trim()) return '請輸入標題'
  if (!formStartTime.value || !formEndTime.value) return '請選擇開始和結束時間'
  return null
})

// 開啟詳情
const openDetail = async (scheduleId: string) => {
  showDetailModal.value = true
  detailLoading.value = true
  currentSchedule.value = null

  try {
    currentSchedule.value = await ScheduleService.getSchedule(scheduleId)
  } catch {
    closeDetailModal()
  } finally {
    detailLoading.value = false
  }
}

// 刪除排程
const handleDelete = async (scheduleId: string) => {
  dialog.warning({
    title: '確認刪除',
    content: '確定要刪除此排程嗎？',
    positiveText: '刪除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await ScheduleService.deleteSchedule(scheduleId)
        fetchSchedules(page.value)
        if (showDetailModal.value) {
          closeDetailModal()
        }
      } catch {
        // 忽略錯誤
      }
    }
  })
}

// 篩選
const applyFilter = () => resetSchedules()

// 清除篩選
const clearFilter = () => {
  filterStartFrom.value = null
  filterStartTo.value = null
  resetSchedules()
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

// AG Grid 欄位定義
const columnDefs = ref<ColDef<ScheduleListItem>[]>([
  { headerName: '標題', field: 'title', flex: 2, minWidth: 120 },
  { headerName: '地點', field: 'location', flex: 1, minWidth: 100 },
  {
    headerName: '開始時間',
    field: 'start_time',
    flex: 1.5,
    minWidth: 150,
    valueFormatter: (params) => params.value ? formatDateTime(params.value) : ''
  },
  {
    headerName: '結束時間',
    field: 'end_time',
    flex: 1.5,
    minWidth: 150,
    valueFormatter: (params) => params.value ? formatDateTime(params.value) : ''
  },
  {
    headerName: '全天',
    field: 'all_day',
    width: 80,
    valueFormatter: (params) => params.value ? '是' : '否'
  },
  {
    headerName: '建立者',
    valueGetter: (params) => params.data?.creator?.username || '',
    flex: 1,
    minWidth: 80
  },
  {
    headerName: '同步狀態',
    field: 'is_synced',
    width: 110,
    cellRenderer: (params: { value: boolean }) => {
      const synced = params.value
      const color = synced ? '#16a34a' : '#94a3b8'
      const bg = synced ? '#dcfce7' : '#f1f5f9'
      const text = synced ? '已同步' : '未同步'
      return `<span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:12px;font-weight:600;color:${color};background:${bg};">${text}</span>`
    }
  }
])

const onRowClicked = (event: RowClickedEvent<ScheduleListItem>) => {
  if (event.data) {
    openDetail(event.data.id)
  }
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
    if (!isAllowedRedirectUrl(res.auth_url)) {
      googleConnecting.value = false
      return
    }
    window.location.href = res.auth_url
  } catch {
    googleConnecting.value = false
  }
}

// === 聊天視窗 ===
const chatOpen = ref(false)
const chatMessages = ref<MessageItem[]>([])
const chatInput = ref('')
const chatSending = ref(false)
const chatConversationId = ref<string | null>(null)
const chatLastActions = ref<ActionTakenItem[]>([])
const chatMessagesContainer = ref<HTMLElement | null>(null)

const scrollChatToBottom = async () => {
  await nextTick()
  if (chatMessagesContainer.value) {
    chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight
  }
}

const startNewChat = () => {
  chatConversationId.value = null
  chatMessages.value = []
  chatLastActions.value = []
  chatInput.value = ''
}

const handleChatSend = async () => {
  const msg = chatInput.value.trim()
  if (!msg || chatSending.value) return

  chatMessages.value.push({ role: 'user', content: msg, created_at: new Date().toISOString() })
  chatInput.value = ''
  chatLastActions.value = []
  scrollChatToBottom()

  chatSending.value = true
  try {
    const res = await ChatService.sendMessageChatPost({
      message: msg,
      conversation_id: chatConversationId.value
    })

    if (!chatConversationId.value) {
      chatConversationId.value = res.conversation_id
    }

    chatMessages.value.push({ role: 'assistant', content: res.message, created_at: new Date().toISOString() })
    chatLastActions.value = res.actions_taken || []
    scrollChatToBottom()

    // AI 可能修改了排程，重新整理列表
    if (chatLastActions.value.length > 0) {
      fetchSchedules(page.value)
    }
  } catch {
    chatMessages.value.push({ role: 'assistant', content: '抱歉，發生錯誤，請稍後再試。', created_at: new Date().toISOString() })
    scrollChatToBottom()
  } finally {
    chatSending.value = false
  }
}

const handleChatKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleChatSend()
  }
}

const chatToolLabels: Record<string, string> = {
  create_schedule: '建立排程',
  update_schedule: '更新排程',
  delete_schedule: '刪除排程',
  list_schedules: '查詢排程'
}

onMounted(() => {
  fetchSchedules()
  fetchGoogleStatus()

  if (route.query.google_connected === '1') {
    showGoogleSuccess.value = true
    setTimeout(() => {
      showGoogleSuccess.value = false
    }, 5000)
    router.replace({ path: '/schedules' })
  }
})
</script>

<template>
  <PageLayout badge="排程管理">
    <!-- Google 連接成功提示 -->
    <NAlert v-if="showGoogleSuccess" type="success" :bordered="false" closable style="margin-bottom: 24px;">
      Google Calendar 連接成功！
    </NAlert>

    <!-- Google Calendar 狀態 (Admin only) -->
    <NCard v-if="authStore.user?.role === 'ADMIN'" size="small" style="margin-bottom: 24px;">
      <div class="google-status-row">
        <div class="google-status-info">
          <div class="google-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <div>
            <div style="font-weight: 600;">Google Calendar</div>
            <div v-if="googleLoading" style="font-size: 13px; color: #64748b;">檢查連接狀態中...</div>
            <div v-else-if="googleStatus?.connected" style="font-size: 13px; color: #16a34a;">
              已連接 · {{ googleStatus.calendar_id }}
            </div>
            <div v-else style="font-size: 13px; color: #64748b;">尚未連接</div>
          </div>
        </div>
        <NButton
          v-if="!googleLoading"
          :loading="googleConnecting"
          :type="googleStatus?.connected ? 'default' : 'info'"
          @click="connectGoogle"
        >
          {{ googleStatus?.connected ? '重新連接' : '連接 Google' }}
        </NButton>
      </div>
    </NCard>

    <PageHeader title="排程管理" description="管理您的工作排程">
      <NButton type="success" @click="openCreateModal">新增排程</NButton>
    </PageHeader>

    <!-- 篩選區 -->
    <NCard size="small" style="margin-bottom: 24px;">
      <NSpace align="end">
        <div class="filter-group">
          <label>開始日期</label>
          <NDatePicker v-model:value="filterStartFrom" type="date" clearable style="width: 180px;" />
        </div>
        <div class="filter-group">
          <label>結束日期</label>
          <NDatePicker v-model:value="filterStartTo" type="date" clearable style="width: 180px;" />
        </div>
        <NButton type="primary" @click="applyFilter">篩選</NButton>
        <NButton @click="clearFilter">清除</NButton>
      </NSpace>
    </NCard>

    <!-- 排程表格 -->
    <LoadingState v-if="loading" />

    <template v-else>
      <DataGrid :row-data="schedules" :column-defs="columnDefs" clickable @row-clicked="onRowClicked" />
      <PaginationBar :page="page" :page-size="pageSize" :item-count="total" @update:page="fetchSchedules" />
    </template>

    <!-- 聊天浮動按鈕 -->
    <button v-if="!chatOpen" class="chat-fab" @click="chatOpen = true">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3C7.925 3 3 7.149 3 12.25c0 2.876 1.57 5.444 4.025 7.118L5.5 24l5.053-2.27C11.635 21.91 12.798 22 14 22c6.075 0 11-4.149 11-9.25S20.075 3 14 3Z" fill="white"/>
        <circle cx="10" cy="12.5" r="1.25" fill="#6366f1"/>
        <circle cx="14" cy="12.5" r="1.25" fill="#6366f1"/>
        <circle cx="18" cy="12.5" r="1.25" fill="#6366f1"/>
      </svg>
    </button>

    <!-- 聊天視窗 -->
    <div v-if="chatOpen" class="chat-widget">
      <div class="chat-widget-header">
        <div class="chat-widget-title">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="white" stroke-width="2" fill="rgba(255,255,255,0.15)"/>
            <path d="M16 22a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm12 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" fill="white"/>
            <path d="M16 30c0 0 2 4 8 4s8-4 8-4" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>AI 排程助理</span>
        </div>
        <NSpace :size="4">
          <NButton text size="tiny" style="color: white;" @click="startNewChat">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414L1 14.414V2a1 1 0 0 1 1-1h12ZM2 0a2 2 0 0 0-2 2v13.793l4.207-4.207A1 1 0 0 1 4.914 11H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2Z"/>
              <path d="M7.5 3.5a.5.5 0 0 1 1 0V5H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V6H6a.5.5 0 0 1 0-1h1.5V3.5Z"/>
            </svg>
          </NButton>
          <NButton text size="tiny" style="color: white;" @click="chatOpen = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708Z"/>
            </svg>
          </NButton>
        </NSpace>
      </div>

      <div ref="chatMessagesContainer" class="chat-widget-messages">
        <div v-if="chatMessages.length === 0" class="chat-welcome">
          <p>你好！我是 AI 排程助理，可以幫你管理排程。</p>
          <div class="chat-examples">
            <span class="chat-example-chip" @click="chatInput = '幫我明天下午2點安排一個會議'">安排會議</span>
            <span class="chat-example-chip" @click="chatInput = '查看我這週的排程'">查看排程</span>
            <span class="chat-example-chip" @click="chatInput = '取消明天的會議'">取消會議</span>
          </div>
        </div>

        <div v-for="(msg, idx) in chatMessages" :key="idx" class="chat-msg" :class="msg.role">
          <div class="chat-msg-bubble">
            <div class="chat-msg-text">{{ msg.content }}</div>
            <div v-if="msg.role === 'assistant' && idx === chatMessages.length - 1 && chatLastActions.length > 0" class="chat-actions">
              <div v-for="(action, aIdx) in chatLastActions" :key="aIdx" class="chat-action-item">
                <NTag :type="action.success ? 'success' : 'error'" size="tiny">
                  {{ chatToolLabels[action.tool] || action.tool }}
                </NTag>
                <span v-if="action.success" class="chat-action-ok">已執行</span>
                <span v-else class="chat-action-fail">失敗</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="chatSending" class="chat-msg assistant">
          <div class="chat-msg-bubble">
            <div class="chat-typing"><span /><span /><span /></div>
          </div>
        </div>
      </div>

      <div class="chat-widget-input">
        <NInput
          v-model:value="chatInput"
          type="textarea"
          placeholder="輸入訊息..."
          :rows="1"
          :autosize="{ minRows: 1, maxRows: 3 }"
          :disabled="chatSending"
          @keydown="handleChatKeydown"
        />
        <NButton type="primary" size="small" :loading="chatSending" :disabled="!chatInput.trim()" @click="handleChatSend">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="currentColor">
            <path d="M2.5 2.1a.5.5 0 0 1 .7-.4l12 5.5a.5.5 0 0 1 0 .9l-12 5.5a.5.5 0 0 1-.7-.6L4.2 9 2.5 4.7a.5.5 0 0 1 0-2.6ZM5.3 9.5l-1.4 3.5L13.3 9 3.9 5l1.4 3.5H8a.5.5 0 0 1 0 1H5.3Z"/>
          </svg>
        </NButton>
      </div>
    </div>

    <!-- 新增/編輯 Modal -->
    <NModal
      v-model:show="showModal"
      preset="card"
      :title="isEditing ? '編輯排程' : '新增排程'"
      style="max-width: 520px;"
      :mask-closable="true"
    >
      <NAlert v-if="formError" type="error" :bordered="false" style="margin-bottom: 16px;">
        {{ formError }}
      </NAlert>

      <FormField label="標題 *">
        <NInput v-model:value="formTitle" placeholder="輸入排程標題..." />
      </FormField>

      <FormField label="說明">
        <NInput v-model:value="formDescription" type="textarea" placeholder="輸入排程說明..." :rows="3" />
      </FormField>

      <FormField label="地點">
        <NInput v-model:value="formLocation" placeholder="輸入地點..." />
      </FormField>

      <div class="form-row">
        <FormField label="開始時間 *">
          <NDatePicker v-model:value="formStartTime" type="datetime" clearable style="width: 100%;" />
        </FormField>
        <FormField label="結束時間 *">
          <NDatePicker v-model:value="formEndTime" type="datetime" clearable style="width: 100%;" />
        </FormField>
      </div>

      <NCheckbox v-model:checked="formAllDay">全天活動</NCheckbox>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeModal">取消</NButton>
          <NButton type="success" :loading="formSaving" @click="handleSave">儲存</NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 詳情 Modal -->
    <NModal
      v-model:show="showDetailModal"
      preset="card"
      :title="currentSchedule?.title || '載入中...'"
      style="max-width: 480px;"
      :mask-closable="true"
    >
      <LoadingState v-if="detailLoading" />

      <template v-else-if="currentSchedule">
        <NDescriptions :column="1" label-placement="left" bordered>
          <NDescriptionsItem label="時間">
            {{ formatDateTime(currentSchedule.start_time) }} - {{ formatDateTime(currentSchedule.end_time) }}
            <NTag v-if="currentSchedule.all_day" size="tiny" type="success" :bordered="false" style="margin-left: 8px;">全天</NTag>
          </NDescriptionsItem>
          <NDescriptionsItem v-if="currentSchedule.location" label="地點">
            {{ currentSchedule.location }}
          </NDescriptionsItem>
          <NDescriptionsItem v-if="currentSchedule.description" label="說明">
            {{ currentSchedule.description }}
          </NDescriptionsItem>
          <NDescriptionsItem v-if="currentSchedule.creator" label="建立者">
            {{ currentSchedule.creator.username }}
          </NDescriptionsItem>
          <NDescriptionsItem label="Google 同步">
            <NTag :type="currentSchedule.google_sync.is_synced ? 'success' : 'default'" size="small">
              {{ currentSchedule.google_sync.is_synced ? '已同步' : '未同步' }}
            </NTag>
          </NDescriptionsItem>
        </NDescriptions>
      </template>

      <template v-if="currentSchedule && currentSchedule.creator?.user_id === authStore.user?.id" #footer>
        <NSpace justify="end">
          <NButton type="error" @click="handleDelete(currentSchedule!.id)">刪除</NButton>
          <NButton type="primary" @click="closeDetailModal(); openEditModal(currentSchedule as unknown as ScheduleListItem)">編輯</NButton>
        </NSpace>
      </template>
    </NModal>
  </PageLayout>
</template>

<style scoped>
.google-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

/* Form */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* === 聊天浮動按鈕 === */
.chat-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 1000;
}

.chat-fab:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.5);
}

/* === 聊天視窗 === */
.chat-widget {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 400px;
  height: 520px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
}

.chat-widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  flex-shrink: 0;
}

.chat-widget-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
}

.chat-widget-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.chat-welcome p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px;
}

.chat-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.chat-example-chip {
  padding: 6px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  font-size: 12px;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
}

.chat-example-chip:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #eef2ff;
}

.chat-msg {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}

.chat-msg.user {
  align-self: flex-end;
  align-items: flex-end;
}

.chat-msg.assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.chat-msg-bubble {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}

.chat-msg.user .chat-msg-bubble {
  background: #6366f1;
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-msg.assistant .chat-msg-bubble {
  background: #f1f5f9;
  color: #1e293b;
  border-bottom-left-radius: 4px;
}

.chat-msg-text {
  white-space: pre-wrap;
}

.chat-actions {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-action-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chat-action-ok {
  font-size: 11px;
  color: #10b981;
}

.chat-action-fail {
  font-size: 11px;
  color: #ef4444;
}

.chat-typing {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.chat-typing span {
  width: 7px;
  height: 7px;
  background: #94a3b8;
  border-radius: 50%;
  animation: chat-typing 1.2s ease-in-out infinite;
}

.chat-typing span:nth-child(2) { animation-delay: 0.2s; }
.chat-typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes chat-typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-5px); opacity: 1; }
}

.chat-widget-input {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.chat-widget-input :deep(.n-input) {
  flex: 1;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .chat-fab {
    bottom: 16px;
    right: 16px;
  }

  .chat-widget {
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100vh;
    border-radius: 0;
  }
}
</style>
