<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChatService } from '@/api'
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
    const res = await ChatService.listConversationsChatConversationsGet(1, 50)
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
    const res = await ChatService.getConversationChatConversationsConversationIdGet(id)
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
    const res = await ChatService.sendMessageChatPost({
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
        await ChatService.deleteConversationChatConversationsConversationIdDelete(conv.id)
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
  create_schedule: '建立排程',
  update_schedule: '更新排程',
  delete_schedule: '刪除排程',
  list_schedules: '查詢排程'
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
          <span>AI 排程助理</span>
        </div>
      </div>
      <NSpace>
        <NButton size="small" @click="router.push('/schedules')">排程管理</NButton>
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
                  <circle cx="24" cy="24" r="22" stroke="#6366f1" stroke-width="2" fill="#eef2ff"/>
                  <path d="M16 22a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm12 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" fill="#6366f1"/>
                  <path d="M16 30c0 0 2 4 8 4s8-4 8-4" stroke="#6366f1" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <h2>AI 排程助理</h2>
              <p>你可以用自然語言請我幫你管理排程</p>
              <div class="welcome-examples">
                <div class="example-chip" @click="inputMessage = '幫我明天下午2點到3點安排一個會議'">幫我安排一個會議</div>
                <div class="example-chip" @click="inputMessage = '查看我這週的排程'">查看本週排程</div>
                <div class="example-chip" @click="inputMessage = '取消明天的會議'">取消明天的會議</div>
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
  background: #f8fafc;
}

/* 頂部導航 */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
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
  color: #0f172a;
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
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
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
  background: #f1f5f9;
}

.conversation-item.active {
  background: #eef2ff;
}

.conv-info {
  flex: 1;
  min-width: 0;
}

.conv-title {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conv-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.conv-delete {
  opacity: 0;
  transition: opacity 0.15s;
  color: #94a3b8;
}

.conversation-item:hover .conv-delete {
  opacity: 1;
}

.empty-conversations {
  text-align: center;
  padding: 32px 16px;
  color: #94a3b8;
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
  color: #0f172a;
  margin: 12px 0 0;
}

.welcome-screen p {
  font-size: 15px;
  color: #64748b;
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
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s;
}

.example-chip:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #eef2ff;
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
  background: #6366f1;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-bubble {
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 4px;
}

.message-content {
  white-space: pre-wrap;
}

.message-time {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
  padding: 0 4px;
}

/* Actions */
.actions-list {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
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
  color: #10b981;
}

.action-status.action-failed {
  color: #ef4444;
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
  background: #94a3b8;
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
  background: white;
  border-top: 1px solid #e2e8f0;
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