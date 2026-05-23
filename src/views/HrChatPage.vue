<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HrChatService } from '@/api'
import type { ConversationListItem, MessageItem, ActionTakenItem } from '@/api'
import {
  NButton, NInput, NSpin, NSpace, NTag, useDialog
} from 'naive-ui'
import { useLogout } from '@/composables/useLogout'

const router = useRouter()
const dialog = useDialog()
const { logout: handleLogout } = useLogout()

// 對話列表
const conversations = ref<ConversationListItem[]>([])
const conversationsLoading = ref(false)

// 當前對話
const currentConversationId = ref<string | null>(null)
const messages = ref<MessageItem[]>([])
const messagesLoading = ref(false)

// 輸入
const inputMessage = ref('')
const sending = ref(false)

// 最近回覆的 actions
const lastActions = ref<ActionTakenItem[]>([])

// sidebar 顯示 (手機版)
const showSidebar = ref(false)

// 訊息區域 ref
const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 載入對話列表
const fetchConversations = async () => {
  conversationsLoading.value = true
  try {
    const res = await HrChatService.listConversationsHrChatConversationsGet(1, 50)
    conversations.value = res.items
  } catch {
    // ignore
  } finally {
    conversationsLoading.value = false
  }
}

// 載入對話內容
const loadConversation = async (id: string) => {
  currentConversationId.value = id
  messagesLoading.value = true
  lastActions.value = []
  showSidebar.value = false
  try {
    const res = await HrChatService.getConversationHrChatConversationsConversationIdGet(id)
    messages.value = res.messages
    scrollToBottom()
  } catch {
    messages.value = []
  } finally {
    messagesLoading.value = false
  }
}

// 新對話
const startNewConversation = () => {
  currentConversationId.value = null
  messages.value = []
  lastActions.value = []
  inputMessage.value = ''
  showSidebar.value = false
}

// 送出訊息
const handleSend = async () => {
  const msg = inputMessage.value.trim()
  if (!msg || sending.value) return

  // 即時顯示用戶訊息
  messages.value.push({ role: 'user', content: msg, created_at: new Date().toISOString() })
  inputMessage.value = ''
  lastActions.value = []
  scrollToBottom()

  sending.value = true
  try {
    const res = await HrChatService.sendMessageHrChatPost({
      message: msg,
      conversation_id: currentConversationId.value
    })

    // 更新 conversation id（新對話時）
    if (!currentConversationId.value) {
      currentConversationId.value = res.conversation_id
      fetchConversations()
    }

    // 加入 AI 回覆
    messages.value.push({ role: 'assistant', content: res.message, created_at: new Date().toISOString() })
    lastActions.value = res.actions_taken || []
    scrollToBottom()
  } catch {
    messages.value.push({ role: 'assistant', content: '抱歉，發生錯誤，請稍後再試。', created_at: new Date().toISOString() })
    scrollToBottom()
  } finally {
    sending.value = false
  }
}

// Enter 送出
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// 刪除對話
const handleDelete = (conv: ConversationListItem) => {
  dialog.warning({
    title: '刪除對話',
    content: `確定要刪除「${conv.title || '未命名對話'}」嗎？`,
    positiveText: '刪除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await HrChatService.deleteConversationHrChatConversationsConversationIdDelete(conv.id)
        if (currentConversationId.value === conv.id) {
          startNewConversation()
        }
        fetchConversations()
      } catch {
        // ignore
      }
    }
  })
}

// 格式化時間
const formatTime = (dateStr?: string | null) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  return d.toLocaleDateString('zh-TW')
}

// 工具名稱對照
const toolLabels: Record<string, string> = {
  approve_request: '批准申請',
  reject_request: '拒絕申請',
  list_approvals: '查詢簽核',
  get_approval_detail: '查看詳情',
  list_pending: '查詢待審',
}

onMounted(() => {
  fetchConversations()
})
</script>

<template>
  <div class="chat-page">
    <!-- 頂部導航 -->
    <nav class="top-nav">
      <div class="nav-left">
        <NButton class="sidebar-toggle" text @click="showSidebar = !showSidebar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect y="3" width="20" height="2" rx="1" />
            <rect y="9" width="20" height="2" rx="1" />
            <rect y="15" width="20" height="2" rx="1" />
          </svg>
        </NButton>
        <div class="nav-brand">
          <svg viewBox="0 0 48 48" fill="none" class="nav-logo">
            <rect width="48" height="48" rx="12" fill="url(#hr-grad)"/>
            <path d="M24 12C18 12 14 16 14 22C14 26 16 29 20 31L20 36L24 34L28 36L28 31C32 29 34 26 34 22C34 16 30 12 24 12Z" stroke="white" stroke-width="2.5" stroke-linejoin="round" fill="none"/>
            <circle cx="20" cy="22" r="2" fill="white"/>
            <circle cx="28" cy="22" r="2" fill="white"/>
            <defs>
              <linearGradient id="hr-grad" x1="0" y1="0" x2="48" y2="48">
                <stop stop-color="var(--color-info)"/>
                <stop offset="1" stop-color="var(--color-primary)"/>
              </linearGradient>
            </defs>
          </svg>
          <span>HR 審核助理</span>
        </div>
      </div>
      <NSpace>
        <NButton size="small" @click="router.push('/approvals')">簽核管理</NButton>
        <NButton size="small" @click="router.push('/user')">個人頁面</NButton>
        <NButton size="small" @click="handleLogout">登出</NButton>
      </NSpace>
    </nav>

    <div class="chat-body">
      <!-- 左側 Sidebar -->
      <aside class="sidebar" :class="{ open: showSidebar }">
        <div class="sidebar-header">
          <NButton type="primary" block @click="startNewConversation">新對話</NButton>
        </div>

        <div class="conversation-list">
          <NSpin v-if="conversationsLoading" size="small" style="display: block; padding: 24px;" />
          <template v-else>
            <div
              v-for="conv in conversations"
              :key="conv.id"
              class="conversation-item"
              :class="{ active: conv.id === currentConversationId }"
              @click="loadConversation(conv.id)"
            >
              <div class="conv-info">
                <div class="conv-title">{{ conv.title || '未命名對話' }}</div>
                <div class="conv-time">{{ formatTime(conv.updated_at || conv.created_at) }}</div>
              </div>
              <NButton
                size="tiny"
                text
                class="conv-delete"
                @click.stop="handleDelete(conv)"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M5.5 1a.5.5 0 0 0-.5.5V2H2v1h1v8.5a1.5 1.5 0 0 0 1.5 1.5h5A1.5 1.5 0 0 0 11 11.5V3h1V2H9v-.5a.5.5 0 0 0-.5-.5h-3ZM4 3h6v8.5a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5V3Z"/>
                </svg>
              </NButton>
            </div>
            <div v-if="conversations.length === 0" class="empty-conversations">
              還沒有對話紀錄
            </div>
          </template>
        </div>
      </aside>

      <!-- 右側聊天區域 -->
      <div class="chat-area">
        <!-- 訊息列表 -->
        <div ref="messagesContainer" class="messages-container">
          <NSpin v-if="messagesLoading" style="display: block; padding: 48px;" />
          <template v-else>
            <div v-if="messages.length === 0" class="welcome-screen">
              <div class="welcome-icon">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke="var(--color-info)" stroke-width="2" fill="var(--color-muted)"/>
                  <path d="M24 14C19 14 16 17.5 16 21.5C16 24.5 17.5 27 20 28.5L20 32L24 30.5L28 32L28 28.5C30.5 27 32 24.5 32 21.5C32 17.5 29 14 24 14Z" stroke="var(--color-info)" stroke-width="2" stroke-linejoin="round" fill="none"/>
                  <circle cx="21" cy="22" r="1.5" fill="var(--color-info)"/>
                  <circle cx="27" cy="22" r="1.5" fill="var(--color-info)"/>
                </svg>
              </div>
              <h2>HR 審核助理</h2>
              <p>你可以用自然語言請我協助處理簽核與審核事務</p>
              <div class="welcome-examples">
                <div class="example-chip" @click="inputMessage = '幫我列出目前待審核的申請'">查詢待審核的申請</div>
                <div class="example-chip" @click="inputMessage = '幫我批准最新的請假申請'">批准請假申請</div>
                <div class="example-chip" @click="inputMessage = '拒絕這筆費用申請，原因是金額超出預算'">拒絕費用申請</div>
              </div>
            </div>

            <div v-for="(msg, idx) in messages" :key="idx" class="message" :class="msg.role">
              <div class="message-bubble">
                <div class="message-content">{{ msg.content }}</div>
                <div v-if="msg.role === 'assistant' && idx === messages.length - 1 && lastActions.length > 0" class="actions-list">
                  <div v-for="(action, aIdx) in lastActions" :key="aIdx" class="action-item">
                    <NTag :type="action.success ? 'success' : 'error'" size="small">
                      {{ toolLabels[action.tool] || action.tool }}
                    </NTag>
                    <span v-if="action.success" class="action-status">已執行</span>
                    <span v-else class="action-status action-failed">失敗</span>
                  </div>
                </div>
              </div>
              <div class="message-time">{{ formatTime(msg.created_at) }}</div>
            </div>

            <div v-if="sending" class="message assistant">
              <div class="message-bubble">
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- 輸入區域 -->
        <div class="input-area">
          <div class="input-wrapper">
            <NInput
              v-model:value="inputMessage"
              type="textarea"
              placeholder="輸入訊息... (Enter 送出, Shift+Enter 換行)"
              :rows="1"
              :autosize="{ minRows: 1, maxRows: 4 }"
              :disabled="sending"
              @keydown="handleKeydown"
            />
            <NButton
              type="primary"
              :loading="sending"
              :disabled="!inputMessage.trim()"
              @click="handleSend"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                <path d="M2.5 2.1a.5.5 0 0 1 .7-.4l12 5.5a.5.5 0 0 1 0 .9l-12 5.5a.5.5 0 0 1-.7-.6L4.2 9 2.5 4.7a.5.5 0 0 1 0-2.6ZM5.3 9.5l-1.4 3.5L13.3 9 3.9 5l1.4 3.5H8a.5.5 0 0 1 0 1H5.3Z"/>
              </svg>
            </NButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar overlay (手機版) -->
    <div v-if="showSidebar" class="sidebar-overlay" @click="showSidebar = false" />
  </div>
</template>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
}

/* 頂部導航 */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-strong);
  flex-shrink: 0;
  z-index: 10;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-toggle {
  display: none;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-foreground);
}

.nav-logo {
  width: 32px;
  height: 32px;
}

/* 主體 */
.chat-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border-strong);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--color-border-strong);
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.conversation-item:hover {
  background: var(--color-muted);
}

.conversation-item.active {
  background: var(--color-muted);
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-foreground);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-time {
  font-size: 12px;
  color: var(--color-foreground-muted);
  margin-top: 2px;
}

.conv-delete {
  opacity: 0;
  transition: opacity 0.15s;
  color: var(--color-foreground-muted);
}

.conversation-item:hover .conv-delete {
  opacity: 1;
}

.empty-conversations {
  text-align: center;
  padding: 32px 16px;
  color: var(--color-foreground-muted);
  font-size: 14px;
}

/* 聊天區域 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 歡迎畫面 */
.welcome-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
}

.welcome-screen h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-foreground);
  margin: 12px 0 0;
}

.welcome-screen p {
  font-size: 15px;
  color: var(--color-foreground-muted);
  margin: 0 0 16px;
}

.welcome-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 400px;
}

.example-chip {
  padding: 8px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: 20px;
  font-size: 13px;
  color: var(--color-foreground-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.example-chip:hover {
  border-color: var(--color-info);
  color: var(--color-info);
  background: var(--color-muted);
}

/* 訊息 */
.message {
  display: flex;
  flex-direction: column;
  max-width: 75%;
}

.message.user {
  align-self: flex-end;
  align-items: flex-end;
}

.message.assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.message.user .message-bubble {
  background: var(--color-info);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-bubble {
  background: var(--color-surface);
  color: var(--color-foreground);
  border: 1px solid var(--color-border-strong);
  border-bottom-left-radius: 4px;
}

.message-content {
  white-space: pre-wrap;
}

.message-time {
  font-size: 11px;
  color: var(--color-foreground-muted);
  margin-top: 4px;
  padding: 0 4px;
}

/* Actions */
.actions-list {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border-strong);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-status {
  font-size: 12px;
  color: var(--color-success);
}

.action-status.action-failed {
  color: var(--color-destructive);
}

/* Typing */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--color-foreground-muted);
  border-radius: 50%;
  animation: typing 1.2s ease-in-out infinite;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* 輸入區域 */
.input-area {
  padding: 16px 24px;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-strong);
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  max-width: 800px;
  margin: 0 auto;
}

.input-wrapper :deep(.n-input) {
  flex: 1;
}

/* Sidebar overlay */
.sidebar-overlay {
  display: none;
}

/* RWD */
@media (max-width: 768px) {
  .sidebar-toggle {
    display: block;
  }

  .sidebar {
    position: fixed;
    left: -280px;
    top: 0;
    bottom: 0;
    z-index: 100;
    transition: left 0.25s ease;
  }

  .sidebar.open {
    left: 0;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 99;
  }

  .message {
    max-width: 90%;
  }

  .input-area {
    padding: 12px 16px;
  }
}
</style>
