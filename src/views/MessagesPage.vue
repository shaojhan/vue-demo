<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { MessageService, UserService } from '@/api'
import type { MessageThreadResponse, UserSearchItem } from '@/api'
import {
  NButton, NCard, NEmpty, NAlert, NInput, NModal,
  NTabs, NTabPane, NBadge, NSpace, useDialog
} from 'naive-ui'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { useFormSubmit } from '@/composables/useFormSubmit'
import { useModal } from '@/composables/useModal'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import LoadingState from '@/components/LoadingState.vue'
import PaginationBar from '@/components/PaginationBar.vue'
import FormField from '@/components/FormField.vue'

const authStore = useAuthStore()
const dialog = useDialog()

// Tab 狀態
type TabType = 'inbox' | 'sent'
const activeTab = ref<TabType>('inbox')

// 訊息列表
const { items: messages, total, page, pageSize, loading, fetch: fetchMessages, reset: resetMessages } = usePaginatedList(
  (p) => activeTab.value === 'inbox'
    ? MessageService.getInbox(p, 10)
    : MessageService.getSent(p, 10)
)

// 未讀數量
const unreadCount = ref(0)

// 撰寫訊息 Modal
const { show: showComposeModal, close: closeComposeModal } = useModal(() => {
  composeError.value = ''
  composeSuccess.value = false
})
const composeRecipientId = ref('')
const composeSubject = ref('')
const composeContent = ref('')
const composeSuccess = ref(false)

// 收件人搜尋
const recipientSearch = ref('')
const recipientOptions = ref<UserSearchItem[]>([])
const recipientLoading = ref(false)

// 訊息詳情 Modal
const { show: showThreadModal, close: closeThreadModal } = useModal(() => {
  currentThread.value = null
  replyContent.value = ''
})
const currentThread = ref<MessageThreadResponse | null>(null)
const threadLoading = ref(false)
const replyContent = ref('')
const replySending = ref(false)

// 取得未讀數量
const fetchUnreadCount = async () => {
  try {
    const res = await MessageService.getUnreadCount()
    unreadCount.value = res.count
  } catch {
    unreadCount.value = 0
  }
}

// 搜尋收件人
const searchRecipients = async () => {
  if (!recipientSearch.value || recipientSearch.value.length < 2) {
    recipientOptions.value = []
    return
  }
  recipientLoading.value = true
  try {
    const res = await UserService.searchUsers(recipientSearch.value, 10)
    recipientOptions.value = res.items
  } catch {
    recipientOptions.value = []
  } finally {
    recipientLoading.value = false
  }
}

// 選擇收件人
const selectRecipient = (user: UserSearchItem) => {
  composeRecipientId.value = user.id
  recipientSearch.value = `${user.uid} (${user.email})`
  recipientOptions.value = []
}

// 發送訊息
const { loading: composeSending, error: composeError, submit: submitCompose } = useFormSubmit(async () => {
  await MessageService.sendMessage({
    recipient_id: composeRecipientId.value,
    subject: composeSubject.value.trim(),
    content: composeContent.value.trim()
  })
  composeSuccess.value = true
  composeRecipientId.value = ''
  recipientSearch.value = ''
  composeSubject.value = ''
  composeContent.value = ''
  fetchMessages()
  fetchUnreadCount()
  setTimeout(() => {
    showComposeModal.value = false
    composeSuccess.value = false
  }, 1500)
})

const handleSendMessage = () => submitCompose(() => {
  if (!composeRecipientId.value || !composeSubject.value.trim() || !composeContent.value.trim()) return '請填寫所有欄位'
  return null
})

// 開啟訊息對話
const openThread = async (messageId: number) => {
  showThreadModal.value = true
  threadLoading.value = true
  currentThread.value = null

  try {
    const thread = await MessageService.getThread(messageId)
    currentThread.value = thread
    if (!thread.original_message.is_read && thread.original_message.recipient.user_id === authStore.user?.id) {
      await MessageService.markAsRead(messageId)
      fetchUnreadCount()
      const msg = messages.value.find(m => m.id === messageId)
      if (msg) msg.is_read = true
    }
  } catch {
    showThreadModal.value = false
  } finally {
    threadLoading.value = false
  }
}

// 回覆訊息
const handleReply = async () => {
  if (!replyContent.value.trim() || !currentThread.value) return

  replySending.value = true

  try {
    await MessageService.replyMessage(currentThread.value.original_message.id, {
      content: replyContent.value.trim()
    })
    replyContent.value = ''
    const thread = await MessageService.getThread(currentThread.value.original_message.id)
    currentThread.value = thread
    fetchMessages()
  } catch {
    // 忽略錯誤
  } finally {
    replySending.value = false
  }
}

// 刪除訊息
const handleDelete = async (messageId: number) => {
  dialog.warning({
    title: '確認刪除',
    content: '確定要刪除此訊息嗎？',
    positiveText: '刪除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await MessageService.deleteMessage(messageId)
        fetchMessages()
        fetchUnreadCount()
        if (showThreadModal.value) {
          showThreadModal.value = false
        }
      } catch {
        // 忽略錯誤
      }
    }
  })
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days} 天前`
  } else {
    return date.toLocaleDateString('zh-TW')
  }
}

// Tab label with badge
const inboxLabel = computed(() => unreadCount.value > 0 ? `收件匣 (${unreadCount.value})` : '收件匣')

// 監聽 Tab 切換
watch(activeTab, () => resetMessages())

// 監聽收件人搜尋
let searchTimeout: ReturnType<typeof setTimeout>
watch(recipientSearch, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchRecipients, 300)
})

onMounted(() => {
  fetchMessages()
  fetchUnreadCount()
})
</script>

<template>
  <PageLayout badge="訊息中心" max-width="900px">
    <PageHeader title="訊息中心" description="與其他用戶交流溝通">
      <NButton type="primary" @click="showComposeModal = true">撰寫訊息</NButton>
    </PageHeader>

    <NCard>
      <NTabs v-model:value="activeTab" type="line">
        <NTabPane name="inbox" :tab="inboxLabel">
          <!-- 內容統一渲染 -->
        </NTabPane>
        <NTabPane name="sent" tab="已發送">
          <!-- 內容統一渲染 -->
        </NTabPane>
      </NTabs>

      <!-- 訊息列表 -->
      <LoadingState v-if="loading" />

      <div v-else-if="messages.length === 0" style="padding: 40px 0;">
        <NEmpty :description="activeTab === 'inbox' ? '收件匣是空的' : '尚未發送任何訊息'" />
      </div>

      <div v-else class="message-list">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['message-item', { unread: !msg.is_read && activeTab === 'inbox' }]"
          @click="openThread(msg.id)"
        >
          <div class="message-avatar">
            {{ (activeTab === 'inbox' ? msg.sender.username : msg.recipient.username).charAt(0).toUpperCase() }}
          </div>
          <div class="message-body">
            <div class="message-header">
              <span class="message-from">
                {{ activeTab === 'inbox' ? msg.sender.username : msg.recipient.username }}
              </span>
              <span class="message-time">{{ formatDate(msg.created_at) }}</span>
            </div>
            <div class="message-subject">{{ msg.subject }}</div>
            <div class="message-preview">{{ msg.content_preview }}</div>
          </div>
          <div class="message-meta">
            <span v-if="msg.reply_count && msg.reply_count > 0" class="reply-count">
              {{ msg.reply_count }} 則回覆
            </span>
            <NBadge v-if="!msg.is_read && activeTab === 'inbox'" dot />
          </div>
        </div>
      </div>

      <!-- 分頁 -->
      <PaginationBar :page="page" :page-size="pageSize" :item-count="total" @update:page="fetchMessages" />
    </NCard>

    <!-- 撰寫訊息 Modal -->
    <NModal
      v-model:show="showComposeModal"
      preset="card"
      title="撰寫新訊息"
      style="max-width: 560px;"
      :mask-closable="true"
      @after-leave="closeComposeModal"
    >
      <NAlert v-if="composeError" type="error" :bordered="false" style="margin-bottom: 16px;">
        {{ composeError }}
      </NAlert>

      <NAlert v-if="composeSuccess" type="success" :bordered="false" style="margin-bottom: 16px;">
        訊息已成功發送！
      </NAlert>

      <FormField label="收件人">
        <div class="recipient-input">
          <NInput
            v-model:value="recipientSearch"
            placeholder="搜尋用戶帳號或 Email..."
          />
          <div v-if="recipientOptions.length > 0" class="recipient-dropdown">
            <div
              v-for="user in recipientOptions"
              :key="user.id"
              class="recipient-option"
              @click="selectRecipient(user)"
            >
              <span class="option-name">{{ user.uid }}</span>
              <span class="option-email">{{ user.email }}</span>
            </div>
          </div>
        </div>
      </FormField>

      <FormField label="主旨">
        <NInput v-model:value="composeSubject" placeholder="輸入訊息主旨..." />
      </FormField>

      <FormField label="內容">
        <NInput
          v-model:value="composeContent"
          type="textarea"
          placeholder="輸入訊息內容..."
          :rows="6"
        />
      </FormField>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="showComposeModal = false">取消</NButton>
          <NButton type="primary" :loading="composeSending" @click="handleSendMessage">發送</NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 訊息對話 Modal -->
    <NModal
      v-model:show="showThreadModal"
      preset="card"
      :title="currentThread?.original_message.subject || '載入中...'"
      style="max-width: 640px;"
      :mask-closable="true"
      @after-leave="closeThreadModal"
    >
      <LoadingState v-if="threadLoading" />

      <template v-else-if="currentThread">
        <!-- 原始訊息 -->
        <div class="thread-message original">
          <div class="thread-avatar">
            {{ currentThread.original_message.sender.username.charAt(0).toUpperCase() }}
          </div>
          <div class="thread-content">
            <div class="thread-info">
              <span class="thread-sender">{{ currentThread.original_message.sender.username }}</span>
              <span class="thread-time">{{ formatDate(currentThread.original_message.created_at) }}</span>
            </div>
            <div class="thread-text">{{ currentThread.original_message.content }}</div>
          </div>
          <NButton
            v-if="currentThread.original_message.sender.user_id === authStore.user?.id"
            text
            type="error"
            size="small"
            @click="handleDelete(currentThread.original_message.id)"
          >
            刪除
          </NButton>
        </div>

        <!-- 回覆列表 -->
        <div v-for="reply in currentThread.replies" :key="reply.id" class="thread-message reply">
          <div class="thread-avatar">
            {{ reply.sender.username.charAt(0).toUpperCase() }}
          </div>
          <div class="thread-content">
            <div class="thread-info">
              <span class="thread-sender">{{ reply.sender.username }}</span>
              <span class="thread-time">{{ formatDate(reply.created_at) }}</span>
            </div>
            <div class="thread-text">{{ reply.content }}</div>
          </div>
        </div>
      </template>

      <template v-if="currentThread" #footer>
        <div class="reply-footer">
          <NInput
            v-model:value="replyContent"
            type="textarea"
            placeholder="輸入回覆內容..."
            :rows="2"
            style="flex: 1;"
          />
          <NButton
            type="primary"
            :loading="replySending"
            :disabled="!replyContent.trim()"
            @click="handleReply"
          >
            回覆
          </NButton>
        </div>
      </template>
    </NModal>
  </PageLayout>
</template>

<style scoped>
/* 訊息列表 */
.message-list {
  max-height: 600px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.2s;
}

.message-item:hover {
  background: #f8fafc;
}

.message-item:last-child {
  border-bottom: none;
}

.message-item.unread {
  background: #eff6ff;
}

.message-item.unread:hover {
  background: #dbeafe;
}

.message-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.message-from {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.message-time {
  font-size: 13px;
  color: #94a3b8;
}

.message-subject {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-preview {
  font-size: 13px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reply-count {
  font-size: 13px;
  color: #94a3b8;
}

/* 收件人搜尋 */
.recipient-input {
  position: relative;
}

.recipient-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-top: 4px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.recipient-option {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.recipient-option:hover {
  background: #f8fafc;
}

.option-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
}

.option-email {
  display: block;
  font-size: 13px;
  color: #64748b;
}

/* Thread */
.thread-message {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.thread-message:last-child {
  border-bottom: none;
}

.thread-message.original {
  background: #f8fafc;
  margin: -16px -24px 0;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.thread-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.thread-content {
  flex: 1;
  min-width: 0;
}

.thread-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.thread-sender {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.thread-time {
  font-size: 13px;
  color: #94a3b8;
}

.thread-text {
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
  white-space: pre-wrap;
}

.reply-footer {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

/* RWD */
@media (max-width: 640px) {
  .message-item {
    padding: 12px 16px;
  }

  .message-avatar {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}
</style>
