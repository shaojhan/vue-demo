<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { KafkaService } from '@/api'
import type { KafkaMessageItem } from '@/api'
import {
  NButton, NCard, NAlert, NInput, NTag
} from 'naive-ui'
import type { ColDef } from 'ag-grid-community'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { useFormSubmit } from '@/composables/useFormSubmit'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import LoadingState from '@/components/LoadingState.vue'
import PaginationBar from '@/components/PaginationBar.vue'
import FilterBar from '@/components/FilterBar.vue'
import DataGrid from '@/components/DataGrid.vue'
import SubscriptionList from '@/components/SubscriptionList.vue'
import FormField from '@/components/FormField.vue'

const router = useRouter()

// 連線狀態
const running = ref(false)
const subscriptions = ref<string[]>([])
const statusLoading = ref(false)

// 訂閱管理
const newTopic = ref('')
const subscribing = ref(false)
const subscribeError = ref('')

// 發送訊息
const produceTopic = ref('')
const produceValue = ref('')
const produceKey = ref('')
const produceSuccess = ref(false)

const { loading: produceLoading, error: produceError, submit: submitProduce } = useFormSubmit(async () => {
  await KafkaService.kafkaProduce({
    topic: produceTopic.value,
    value: produceValue.value,
    key: produceKey.value || undefined
  })
  produceSuccess.value = true
  produceValue.value = ''
  setTimeout(() => { produceSuccess.value = false }, 3000)
})

// 訊息列表
const topicFilter = ref('')
const messagePageSize = 20
const { items: messages, total: messageTotal, page: messagePage, loading: messageLoading, fetch: fetchMessages, reset: resetMessages } = usePaginatedList(
  (p) => KafkaService.kafkaListMessages(topicFilter.value || undefined, p, messagePageSize),
  { pageSize: messagePageSize }
)

// 取得狀態
const fetchStatus = async () => {
  statusLoading.value = true
  try {
    const res = await KafkaService.kafkaStatus()
    running.value = res.running
    subscriptions.value = res.subscriptions
  } catch {
    running.value = false
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
    await KafkaService.kafkaSubscribe({ topic: newTopic.value.trim() })
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
    await KafkaService.kafkaUnsubscribe(topic)
    fetchStatus()
  } catch {
    // ignore
  }
}

// 發送
const handleProduce = () => submitProduce(() => {
  if (!produceTopic.value.trim()) return '請輸入主題'
  if (!produceValue.value.trim()) return '請輸入訊息內容'
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
const msgColumnDefs = ref<ColDef<KafkaMessageItem>[]>([
  { headerName: '主題', field: 'topic', flex: 2, minWidth: 150 },
  { headerName: 'Key', field: 'key', flex: 1, minWidth: 100 },
  {
    headerName: '訊息內容',
    field: 'value',
    flex: 3,
    minWidth: 200,
    autoHeight: true,
    wrapText: true,
    cellStyle: { 'font-family': 'monospace', 'font-size': '13px', 'white-space': 'pre-wrap', 'line-height': '1.5', 'padding-top': '8px', 'padding-bottom': '8px' }
  },
  { headerName: 'Partition', field: 'partition', width: 100 },
  { headerName: 'Offset', field: 'offset', width: 100 },
  {
    headerName: '接收時間',
    field: 'received_at',
    flex: 1.5,
    minWidth: 160,
    valueFormatter: (params) => params.value ? formatTime(params.value) : ''
  }
])

onMounted(() => {
  fetchStatus()
  fetchMessages()
})
</script>

<template>
  <PageLayout badge="KAFKA">
    <template #nav>
      <NButton @click="router.push('/admin')">管理後台</NButton>
      <NButton @click="router.push('/mqtt')">MQTT 管理</NButton>
    </template>

    <PageHeader title="Kafka 管理" description="管理 Kafka 連線、訂閱與訊息" />

    <!-- 連線狀態 -->
    <NCard title="連線狀態" style="margin-bottom: 24px;">
      <template #header-extra>
        <NButton size="small" :loading="statusLoading" @click="fetchStatus">重新整理</NButton>
      </template>
      <div class="status-row">
        <span class="status-label">狀態</span>
        <NTag :type="running ? 'success' : 'error'" size="small">
          {{ running ? '運行中' : '未運行' }}
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

      <SubscriptionList :topics="subscriptions" @unsubscribe="handleUnsubscribe" />

      <div class="subscribe-form">
        <NInput v-model:value="newTopic" placeholder="輸入主題 (例如: my-topic)" style="flex: 1;" />
        <NButton type="primary" :loading="subscribing" @click="handleSubscribe">訂閱</NButton>
      </div>
    </NCard>

    <!-- 發送訊息 -->
    <NCard title="發送訊息" style="margin-bottom: 24px;">
      <NAlert v-if="produceError" type="error" :bordered="false" style="margin-bottom: 16px;">
        {{ produceError }}
      </NAlert>
      <NAlert v-if="produceSuccess" type="success" :bordered="false" style="margin-bottom: 16px;">
        訊息已發送
      </NAlert>

      <div class="publish-form">
        <div class="publish-row">
          <FormField label="主題" style="flex: 1;">
            <NInput v-model:value="produceTopic" placeholder="輸入發送主題" />
          </FormField>
          <FormField label="Key（選填）" style="flex: 1;">
            <NInput v-model:value="produceKey" placeholder="訊息 Key" />
          </FormField>
        </div>
        <FormField label="訊息內容">
          <NInput v-model:value="produceValue" type="textarea" placeholder="輸入訊息內容" :rows="3" />
        </FormField>
        <NButton type="success" block :loading="produceLoading" @click="handleProduce">發送</NButton>
      </div>
    </NCard>

    <!-- 訊息紀錄 -->
    <NCard title="訊息紀錄">
      <template #header-extra>
        <span style="font-size: 14px; color: #64748b;">共 {{ messageTotal }} 筆</span>
      </template>

      <FilterBar v-model="topicFilter" placeholder="依主題篩選..." />

      <LoadingState v-if="messageLoading" />
      <template v-else>
        <DataGrid :row-data="messages as KafkaMessageItem[]" :column-defs="msgColumnDefs" />
      </template>

      <PaginationBar :page="messagePage" :page-size="messagePageSize" :item-count="messageTotal" @update:page="fetchMessages" />
    </NCard>
  </PageLayout>
</template>

<style scoped>
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

.subscribe-form {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.publish-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.publish-row {
  display: flex;
  gap: 16px;
}

@media (max-width: 640px) {
  .subscribe-form {
    flex-direction: column;
    align-items: stretch;
  }

  .publish-row {
    flex-direction: column;
  }

  .publish-row :deep(.form-group) {
    width: 100% !important;
  }
}
</style>
