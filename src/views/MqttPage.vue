<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { MqttService } from '@/api'
import type { MQTTMessageItem } from '@/api'
import {
  NButton, NCard, NSpin, NAlert, NInput, NSelect,
  NPagination, NSpace, NTag
} from 'naive-ui'
import { AgGridVue } from 'ag-grid-vue3'
import type { ColDef } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { useFormSubmit } from '@/composables/useFormSubmit'
import { useLogout } from '@/composables/useLogout'

const router = useRouter()
const { logout: handleLogout } = useLogout()

// 連線狀態
const connected = ref(false)
const subscriptions = ref<string[]>([])
const statusLoading = ref(false)

// 訂閱管理
const newTopic = ref('')
const newQos = ref(1)
const subscribing = ref(false)
const subscribeError = ref('')

// 發送訊息
const publishTopic = ref('')
const publishPayload = ref('')
const publishQos = ref(1)
const publishSuccess = ref(false)

const { loading: publishLoading, error: publishError, submit: submitPublish } = useFormSubmit(async () => {
  await MqttService.mqttPublish({
    topic: publishTopic.value,
    payload: publishPayload.value,
    qos: publishQos.value
  })
  publishSuccess.value = true
  publishPayload.value = ''
  setTimeout(() => { publishSuccess.value = false }, 3000)
})

// 訊息列表
const topicFilter = ref('')
const messagePageSize = 20
const { items: messages, total: messageTotal, page: messagePage, loading: messageLoading, fetch: fetchMessages, reset: resetMessages } = usePaginatedList(
  (p) => MqttService.mqttListMessages(topicFilter.value || undefined, p, messagePageSize),
  { pageSize: messagePageSize }
)

const qosOptions = [
  { label: 'QoS 0', value: 0 },
  { label: 'QoS 1', value: 1 },
  { label: 'QoS 2', value: 2 }
]

// 取得狀態
const fetchStatus = async () => {
  statusLoading.value = true
  try {
    const res = await MqttService.mqttStatus()
    connected.value = res.connected
    subscriptions.value = res.subscriptions
  } catch {
    connected.value = false
  } finally {
    statusLoading.value = false
  }
}

// 訂閱
const handleSubscribe = async () => {
  if (!newTopic.value.trim()) {
    subscribeError.value = '請輸入主題'
    return
  }
  subscribing.value = true
  subscribeError.value = ''
  try {
    await MqttService.mqttSubscribe({ topic: newTopic.value.trim(), qos: newQos.value })
    newTopic.value = ''
    fetchStatus()
  } catch {
    subscribeError.value = '訂閱失敗'
  } finally {
    subscribing.value = false
  }
}

// 取消訂閱
const handleUnsubscribe = async (topic: string) => {
  try {
    await MqttService.mqttUnsubscribe(topic)
    fetchStatus()
  } catch {
    // ignore
  }
}

// 發送
const handlePublish = () => submitPublish(() => {
  if (!publishTopic.value.trim()) return '請輸入主題'
  if (!publishPayload.value.trim()) return '請輸入訊息內容'
  return null
})

// 篩選變更時重新載入
let filterTimer: ReturnType<typeof setTimeout> | null = null
watch(topicFilter, () => {
  if (filterTimer) clearTimeout(filterTimer)
  filterTimer = setTimeout(() => resetMessages(), 400)
})

// 格式化時間
const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleString('zh-TW')
}

// AG Grid 欄位定義
const msgColumnDefs = ref<ColDef<MQTTMessageItem>[]>([
  { headerName: '主題', field: 'topic', flex: 2, minWidth: 150 },
  {
    headerName: '訊息內容',
    field: 'payload',
    flex: 3,
    minWidth: 200,
    autoHeight: true,
    wrapText: true,
    cellStyle: { 'font-family': 'monospace', 'font-size': '13px', 'white-space': 'pre-wrap', 'line-height': '1.5', 'padding-top': '8px', 'padding-bottom': '8px' }
  },
  {
    headerName: 'QoS',
    field: 'qos',
    width: 80
  },
  {
    headerName: '接收時間',
    field: 'received_at',
    flex: 1.5,
    minWidth: 160,
    valueFormatter: (params) => params.value ? formatTime(params.value) : ''
  }
])

const msgDefaultColDef: ColDef = {
  sortable: true,
  resizable: true
}

onMounted(() => {
  fetchStatus()
  fetchMessages()
})
</script>

<template>
  <div class="mqtt-page">
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
        <span class="nav-badge">MQTT</span>
      </div>
      <NSpace>
        <NButton @click="router.push('/admin')">管理後台</NButton>
        <NButton @click="router.push('/user')">個人頁面</NButton>
        <NButton @click="handleLogout">登出</NButton>
      </NSpace>
    </nav>

    <main class="mqtt-content">
      <div class="page-header">
        <h1>MQTT 管理</h1>
        <p>管理 MQTT 連線、訂閱與訊息</p>
      </div>

      <!-- 連線狀態 -->
      <NCard title="連線狀態" style="margin-bottom: 24px;">
        <template #header-extra>
          <NButton size="small" :loading="statusLoading" @click="fetchStatus">重新整理</NButton>
        </template>
        <div class="status-row">
          <span class="status-label">狀態</span>
          <NTag :type="connected ? 'success' : 'error'" size="small">
            {{ connected ? '已連線' : '未連線' }}
          </NTag>
        </div>
      </NCard>

      <!-- 訂閱管理 -->
      <NCard title="訂閱管理" style="margin-bottom: 24px;">
        <template #header-extra>
          <span style="font-size: 14px; color: #64748b;">{{ subscriptions.length }} 個主題</span>
        </template>

        <NAlert v-if="subscribeError" type="error" :bordered="false" style="margin-bottom: 16px;">
          {{ subscribeError }}
        </NAlert>

        <!-- 目前訂閱 -->
        <div v-if="subscriptions.length > 0" class="subscription-list">
          <div v-for="topic in subscriptions" :key="topic" class="subscription-item">
            <code class="topic-name">{{ topic }}</code>
            <NButton size="tiny" type="error" secondary @click="handleUnsubscribe(topic)">取消訂閱</NButton>
          </div>
        </div>
        <div v-else class="empty-hint">目前沒有訂閱任何主題</div>

        <!-- 新增訂閱 -->
        <div class="subscribe-form">
          <NInput v-model:value="newTopic" placeholder="輸入主題 (例如: sensor/temp)" style="flex: 1;" />
          <NSelect v-model:value="newQos" :options="qosOptions" style="width: 120px;" />
          <NButton type="primary" :loading="subscribing" @click="handleSubscribe">訂閱</NButton>
        </div>
      </NCard>

      <!-- 發送訊息 -->
      <NCard title="發送訊息" style="margin-bottom: 24px;">
        <NAlert v-if="publishError" type="error" :bordered="false" style="margin-bottom: 16px;">
          {{ publishError }}
        </NAlert>
        <NAlert v-if="publishSuccess" type="success" :bordered="false" style="margin-bottom: 16px;">
          訊息已發送
        </NAlert>

        <div class="publish-form">
          <div class="publish-row">
            <div class="form-group" style="flex: 1;">
              <label>主題</label>
              <NInput v-model:value="publishTopic" placeholder="輸入發送主題" />
            </div>
            <div class="form-group" style="width: 120px;">
              <label>QoS</label>
              <NSelect v-model:value="publishQos" :options="qosOptions" />
            </div>
          </div>
          <div class="form-group">
            <label>訊息內容</label>
            <NInput v-model:value="publishPayload" type="textarea" placeholder="輸入訊息內容" :rows="3" />
          </div>
          <NButton type="success" block :loading="publishLoading" @click="handlePublish">發送</NButton>
        </div>
      </NCard>

      <!-- 訊息紀錄 -->
      <NCard title="訊息紀錄">
        <template #header-extra>
          <span style="font-size: 14px; color: #64748b;">共 {{ messageTotal }} 筆</span>
        </template>

        <div class="filter-bar">
          <NInput v-model:value="topicFilter" placeholder="依主題篩選..." clearable style="max-width: 300px;" />
        </div>

        <div v-if="messageLoading" class="center-state">
          <NSpin size="large" />
        </div>
        <template v-else>
          <ag-grid-vue
            class="ag-theme-quartz message-grid"
            :rowData="messages as MQTTMessageItem[]"
            :columnDefs="msgColumnDefs"
            :defaultColDef="msgDefaultColDef"
            :pagination="false"
            :domLayout="'autoHeight'"
          />
        </template>

        <div v-if="messageTotal > messagePageSize" class="pagination-wrapper">
          <NPagination
            :page="messagePage"
            :page-size="messagePageSize"
            :item-count="messageTotal"
            @update:page="fetchMessages"
          />
        </div>
      </NCard>
    </main>
  </div>
</template>

<style scoped>
.mqtt-page {
  min-height: 100vh;
  background: #f8fafc;
}

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
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.mqtt-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px;
}

.page-header {
  margin-bottom: 36px;
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

/* 連線狀態 */
.status-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

/* 訂閱管理 */
.subscription-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.subscription-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.topic-name {
  font-family: monospace;
  font-size: 14px;
  color: #1e293b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
}

.empty-hint {
  text-align: center;
  padding: 24px;
  color: #94a3b8;
  font-size: 14px;
}

.subscribe-form {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

/* 發送訊息 */
.publish-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.publish-row {
  display: flex;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

/* 訊息紀錄 */
.filter-bar {
  margin-bottom: 16px;
}

.center-state {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.message-grid {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0 0;
}

/* RWD */
@media (max-width: 640px) {
  .top-nav {
    padding: 12px 16px;
  }

  .mqtt-content {
    padding: 32px 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .subscribe-form {
    flex-direction: column;
    align-items: stretch;
  }

  .publish-row {
    flex-direction: column;
  }

  .publish-row .form-group {
    width: 100% !important;
  }
}
</style>
