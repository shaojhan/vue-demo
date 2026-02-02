<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserService, ApiError } from '@/api'
import type { CurrentUserResponse } from '@/api'

const router = useRouter()
const authStore = useAuthStore()

const currentUser = ref<CurrentUserResponse | null>(null)
const isLoading = ref(true)

const roleLabel: Record<string, string> = {
  ADMIN: '管理員',
  EMPLOYEE: '員工',
  NORMAL: '一般用戶'
}

const fetchUser = async () => {
  try {
    currentUser.value = await UserService.getCurrentUser()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchUser)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="user-page">
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
      </div>
      <button class="logout-btn" @click="handleLogout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        登出
      </button>
    </nav>

    <main class="user-content">
      <div v-if="isLoading" class="loading-state">
        <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
        <span>載入中...</span>
      </div>

      <template v-else>
        <div class="welcome-section">
          <div class="avatar">
            <span>{{ (currentUser?.profile?.name || currentUser?.uid || '?').charAt(0).toUpperCase() }}</span>
          </div>
          <h1>歡迎回來，{{ currentUser?.profile?.name || currentUser?.uid }}</h1>
          <p class="welcome-sub">這是您的個人資訊頁面</p>
        </div>

        <div class="info-cards">
          <div class="info-card">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-label">帳號</span>
              <span class="card-value">{{ currentUser?.uid }}</span>
            </div>
          </div>

          <div class="info-card" v-if="currentUser?.profile?.name">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-label">姓名</span>
              <span class="card-value">{{ currentUser.profile.name }}</span>
            </div>
          </div>

          <div class="info-card">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="M22 6l-10 7L2 6"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-label">電子郵件</span>
              <span class="card-value">{{ currentUser?.email }}</span>
            </div>
          </div>

          <div class="info-card">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-label">角色</span>
              <span class="card-value">
                <span class="role-badge" :class="currentUser?.role?.toLowerCase()">
                  {{ roleLabel[currentUser?.role || ''] || currentUser?.role }}
                </span>
              </span>
            </div>
          </div>

          <div class="info-card" v-if="currentUser?.profile?.birthdate">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-label">出生日期</span>
              <span class="card-value">{{ currentUser.profile.birthdate }}</span>
            </div>
          </div>

          <div class="info-card" v-if="currentUser?.profile?.description">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="17" y1="10" x2="3" y2="10"/>
                <line x1="21" y1="6" x2="3" y2="6"/>
                <line x1="21" y1="14" x2="3" y2="14"/>
                <line x1="17" y1="18" x2="3" y2="18"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-label">自我介紹</span>
              <span class="card-value">{{ currentUser.profile.description }}</span>
            </div>
          </div>

          <div class="info-card">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <div class="card-body">
              <span class="card-label">使用者 ID</span>
              <span class="card-value id-value">{{ currentUser?.id }}</span>
            </div>
          </div>
        </div>

        <div class="action-section">
          <RouterLink v-if="authStore.user?.role === 'ADMIN'" to="/admin" class="admin-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            管理員後台
          </RouterLink>
          <RouterLink to="/change-password" class="change-pwd-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            修改密碼
          </RouterLink>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.user-page {
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
.user-content {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 24px;
}

/* 載入狀態 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 0;
  color: #94a3b8;
  font-size: 15px;
}

.loading-state svg {
  width: 32px;
  height: 32px;
  color: #6366f1;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 歡迎區 */
.welcome-section {
  text-align: center;
  margin-bottom: 48px;
}

.avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
}

.avatar span {
  font-size: 32px;
  font-weight: 700;
  color: white;
}

.welcome-section h1 {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.welcome-sub {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

/* 資訊卡片 */
.info-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.info-card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
}

.card-icon {
  width: 48px;
  height: 48px;
  background: #eef2ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon svg {
  width: 24px;
  height: 24px;
  color: #6366f1;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.card-label {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.id-value {
  font-size: 13px;
  font-family: monospace;
  color: #64748b;
  word-break: break-all;
}

/* 角色標籤 */
.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.role-badge.admin {
  background: #fef3c7;
  color: #b45309;
}

.role-badge.employee {
  background: #dbeafe;
  color: #1d4ed8;
}

.role-badge.normal {
  background: #e0e7ff;
  color: #4338ca;
}

/* 操作區 */
.action-section {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.change-pwd-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.change-pwd-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #eef2ff;
}

.change-pwd-btn svg {
  width: 20px;
  height: 20px;
}

.change-pwd-btn {
  text-decoration: none;
}

.admin-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.admin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
}

.admin-btn svg {
  width: 20px;
  height: 20px;
}

/* RWD */
@media (max-width: 640px) {
  .top-nav {
    padding: 12px 16px;
  }

  .user-content {
    padding: 32px 16px;
  }

  .welcome-section h1 {
    font-size: 22px;
  }

  .info-card {
    padding: 18px;
  }
}
</style>
