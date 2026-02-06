<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { MessageService, UserService, ApiError } from '@/api'
import type { MessageListItem, MessageThreadResponse, UserSearchItem } from '@/api'

const router = useRouter()
const authStore = useAuthStore()

// Tab 狀態
type TabType = 'inbox' | 'sent'
const activeTab = ref<TabType>('inbox')

// 訊息列表
const messages = ref<MessageListItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const loading = ref(false)
const totalPages = computed(() => Math.ceil(total.value / pageSize))

// 未讀數量
const unreadCount = ref(0)

// 撰寫訊息 Modal
const showComposeModal = ref(false)
const composeRecipientId = ref('')
const composeSubject = ref('')
const composeContent = ref('')
const composeSending = ref(false)
const composeError = ref('')
const composeSuccess = ref(false)

// 收件人搜尋
const recipientSearch = ref('')
const recipientOptions = ref<UserSearchItem[]>([])
const recipientLoading = ref(false)

// 訊息詳情 Modal
const showThreadModal = ref(false)
const currentThread = ref<MessageThreadResponse | null>(null)
const threadLoading = ref(false)
const replyContent = ref('')
const replySending = ref(false)

// 取得訊息列表
const fetchMessages = async (p = 1) => {
  loading.value = true
  try {
    const res = activeTab.value === 'inbox'
      ? await MessageService.getInbox(p, pageSize)
      : await MessageService.getSent(p, pageSize)
    messages.value = res.items
    total.value = res.total
    page.value = res.page
  } catch {
    messages.value = []
  } finally {
    loading.value = false
  }
}

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
const handleSendMessage = async () => {
  if (!composeRecipientId.value || !composeSubject.value.trim() || !composeContent.value.trim()) {
    composeError.value = '請填寫所有欄位'
    return
  }

  composeSending.value = true
  composeError.value = ''

  try {
    await MessageService.sendMessage({
      recipient_id: composeRecipientId.value,
      subject: composeSubject.value.trim(),
      content: composeContent.value.trim()
    })
    composeSuccess.value = true
    // 清空表單
    composeRecipientId.value = ''
    recipientSearch.value = ''
    composeSubject.value = ''
    composeContent.value = ''
    // 重新載入
    fetchMessages()
    fetchUnreadCount()
    // 延遲關閉
    setTimeout(() => {
      showComposeModal.value = false
      composeSuccess.value = false
    }, 1500)
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        composeError.value = '找不到該收件人'
      } else {
        composeError.value = '發送失敗，請稍後再試'
      }
    } else {
      composeError.value = '網路連線錯誤'
    }
  } finally {
    composeSending.value = false
  }
}

// 開啟訊息對話
const openThread = async (messageId: number) => {
  showThreadModal.value = true
  threadLoading.value = true
  currentThread.value = null

  try {
    const thread = await MessageService.getThread(messageId)
    currentThread.value = thread
    // 標記為已讀
    if (!thread.original_message.is_read && thread.original_message.recipient.user_id === authStore.user?.id) {
      await MessageService.markAsRead(messageId)
      fetchUnreadCount()
      // 更新列表中的已讀狀態
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
    // 重新載入對話
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
  if (!confirm('確定要刪除此訊息嗎？')) return

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

// 關閉 Modal
const closeComposeModal = () => {
  showComposeModal.value = false
  composeError.value = ''
  composeSuccess.value = false
}

const closeThreadModal = () => {
  showThreadModal.value = false
  currentThread.value = null
  replyContent.value = ''
}

// 登出
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
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

// 監聽 Tab 切換
watch(activeTab, () => {
  page.value = 1
  fetchMessages()
})

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
  <div class="messages-page">
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
        <span class="nav-badge">訊息中心</span>
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

    <main class="messages-content">
      <div class="page-header">
        <div>
          <h1>訊息中心</h1>
          <p>與其他用戶交流溝通</p>
        </div>
        <button class="compose-btn" @click="showComposeModal = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          撰寫訊息
        </button>
      </div>

      <div class="messages-card">
        <!-- Tabs -->
        <div class="tabs">
          <button
            :class="['tab', { active: activeTab === 'inbox' }]"
            @click="activeTab = 'inbox'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
              <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
            </svg>
            收件匣
            <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
          </button>
          <button
            :class="['tab', { active: activeTab === 'sent' }]"
            @click="activeTab = 'sent'"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            已發送
          </button>
        </div>

        <!-- 訊息列表 -->
        <div v-if="loading" class="loading-state">
          <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
          載入中...
        </div>

        <div v-else-if="messages.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <p>{{ activeTab === 'inbox' ? '收件匣是空的' : '尚未發送任何訊息' }}</p>
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                {{ msg.reply_count }}
              </span>
              <span v-if="!msg.is_read && activeTab === 'inbox'" class="unread-dot"></span>
            </div>
          </div>
        </div>

        <!-- 分頁 -->
        <div v-if="totalPages > 1" class="pagination">
          <button :disabled="page <= 1" @click="fetchMessages(page - 1)">上一頁</button>
          <span>第 {{ page }} / {{ totalPages }} 頁</span>
          <button :disabled="page >= totalPages" @click="fetchMessages(page + 1)">下一頁</button>
        </div>
      </div>
    </main>

    <!-- 撰寫訊息 Modal -->
    <Transition name="modal">
      <div v-if="showComposeModal" class="modal-overlay" @click.self="closeComposeModal">
        <div class="modal-content compose-modal">
          <div class="modal-header">
            <h3>撰寫新訊息</h3>
            <button class="close-btn" @click="closeComposeModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <Transition name="fade">
              <div v-if="composeError" class="error-alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4M12 16h.01"/>
                </svg>
                <span>{{ composeError }}</span>
              </div>
            </Transition>

            <Transition name="fade">
              <div v-if="composeSuccess" class="success-alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>訊息已成功發送！</span>
              </div>
            </Transition>

            <div class="form-group">
              <label>收件人</label>
              <div class="recipient-input">
                <input
                  v-model="recipientSearch"
                  type="text"
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
            </div>

            <div class="form-group">
              <label>主旨</label>
              <input
                v-model="composeSubject"
                type="text"
                placeholder="輸入訊息主旨..."
              />
            </div>

            <div class="form-group">
              <label>內容</label>
              <textarea
                v-model="composeContent"
                placeholder="輸入訊息內容..."
                rows="6"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="cancel-btn" @click="closeComposeModal">取消</button>
            <button class="send-btn" :disabled="composeSending" @click="handleSendMessage">
              <span v-if="composeSending" class="btn-loading">
                <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                發送中...
              </span>
              <span v-else>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                發送
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 訊息對話 Modal -->
    <Transition name="modal">
      <div v-if="showThreadModal" class="modal-overlay" @click.self="closeThreadModal">
        <div class="modal-content thread-modal">
          <div class="modal-header">
            <h3>{{ currentThread?.original_message.subject || '載入中...' }}</h3>
            <button class="close-btn" @click="closeThreadModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body thread-body">
            <div v-if="threadLoading" class="loading-state">
              <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              載入中...
            </div>

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
                <button
                  v-if="currentThread.original_message.sender.user_id === authStore.user?.id"
                  class="delete-btn"
                  @click="handleDelete(currentThread.original_message.id)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                </button>
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
          </div>

          <div v-if="currentThread" class="modal-footer reply-footer">
            <textarea
              v-model="replyContent"
              placeholder="輸入回覆內容..."
              rows="2"
            ></textarea>
            <button class="reply-btn" :disabled="replySending || !replyContent.trim()" @click="handleReply">
              <span v-if="replySending">
                <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
              </span>
              <span v-else>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                回覆
              </span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.messages-page {
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
  background: #dbeafe;
  color: #1d4ed8;
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
.messages-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.compose-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.compose-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
}

.compose-btn svg {
  width: 20px;
  height: 20px;
}

/* 訊息卡片 */
.messages-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

/* Tabs */
.tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
}

.tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.tab:hover {
  color: #6366f1;
  background: #f8fafc;
}

.tab.active {
  color: #6366f1;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #6366f1;
}

.tab svg {
  width: 20px;
  height: 20px;
}

.unread-badge {
  padding: 2px 8px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
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
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #94a3b8;
}

.reply-count svg {
  width: 16px;
  height: 16px;
}

.unread-dot {
  width: 10px;
  height: 10px;
  background: #6366f1;
  border-radius: 50%;
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
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.compose-modal {
  max-width: 560px;
}

.thread-modal {
  max-width: 640px;
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
  min-height: 120px;
}

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

/* Alerts */
.error-alert,
.success-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 14px;
  margin-bottom: 20px;
}

.error-alert {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.success-alert {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
}

.error-alert svg,
.success-alert svg {
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

.send-btn,
.reply-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled),
.reply-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.send-btn:disabled,
.reply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-btn svg,
.reply-btn svg {
  width: 18px;
  height: 18px;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-loading svg {
  width: 18px;
  height: 18px;
}

/* Thread */
.thread-body {
  max-height: 400px;
}

.thread-message {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
  position: relative;
}

.thread-message:last-child {
  border-bottom: none;
}

.thread-message.original {
  background: #f8fafc;
  margin: -24px -24px 0;
  padding: 24px;
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

.delete-btn {
  position: absolute;
  top: 16px;
  right: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 6px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.delete-btn svg {
  width: 18px;
  height: 18px;
}

.reply-footer {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.reply-footer textarea {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #1e293b;
  background: white;
  resize: none;
  box-sizing: border-box;
}

.reply-footer textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

  .messages-content {
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

  .compose-btn {
    width: 100%;
    justify-content: center;
  }

  .message-item {
    padding: 12px 16px;
  }

  .message-avatar {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .modal-content {
    margin: 16px;
    max-height: calc(100vh - 32px);
  }
}
</style>
