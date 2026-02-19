<script setup lang="ts">
import { ref, h, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { UserService } from '@/api'
import type { LoginRecordItem } from '@/api'
import {
  NButton, NCard, NSpin, NTag, NSpace, NInput,
  NDataTable, NPagination
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { useLogout } from '@/composables/useLogout'

const router = useRouter()
const authStore = useAuthStore()
const { logout: handleLogout } = useLogout()
const isAdmin = computed(() => authStore.user?.role === 'ADMIN')

// 我的登入紀錄
const {
  items: myRecords,
  total: myTotal,
  page: myPage,
  pageSize: myPageSize,
  loading: myLoading,
  fetch: fetchMyRecords
} = usePaginatedList(
  (p) => UserService.getMyLoginRecords(p, 10),
  { pageSize: 10 }
)

// 管理員：所有紀錄
const filterUserId = ref('')
const {
  items: allRecords,
  total: allTotal,
  page: allPage,
  pageSize: allPageSize,
  loading: allLoading,
  fetch: fetchAllRecords
} = usePaginatedList(
  (p) => UserService.getAllLoginRecords(p, 10, filterUserId.value || undefined),
  { pageSize: 10 }
)

const formatTime = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const myColumns: DataTableColumns<LoginRecordItem> = [
  {
    title: '登入時間',
    key: 'created_at',
    width: 180,
    render: (row) => formatTime(row.created_at)
  },
  { title: 'IP 位址', key: 'ip_address', width: 140 },
  {
    title: '結果',
    key: 'success',
    width: 80,
    render: (row) => h(NTag, {
      size: 'small',
      type: row.success ? 'success' : 'error',
      bordered: false
    }, () => row.success ? '成功' : '失敗')
  },
  {
    title: '失敗原因',
    key: 'failure_reason',
    render: (row) => row.failure_reason || '-'
  },
  {
    title: 'User Agent',
    key: 'user_agent',
    ellipsis: { tooltip: true },
    render: (row) => row.user_agent || '-'
  }
]

const allColumns: DataTableColumns<LoginRecordItem> = [
  {
    title: '使用者',
    key: 'username',
    width: 120,
    render: (row) => h('strong', row.username)
  },
  ...myColumns
]

const handleFilterSearch = () => {
  fetchAllRecords(1)
}

onMounted(() => {
  fetchMyRecords()
  if (isAdmin.value) {
    fetchAllRecords()
  }
})
</script>

<template>
  <div class="login-records-page">
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
      <NSpace>
        <NButton @click="router.push('/user')">個人頁面</NButton>
        <NButton @click="handleLogout" quaternary>登出</NButton>
      </NSpace>
    </nav>

    <main class="page-content">
      <div class="page-header">
        <h1>登入紀錄</h1>
        <p>查看帳號的登入歷史記錄</p>
      </div>

      <!-- 我的登入紀錄 -->
      <NCard title="我的登入紀錄" style="margin-bottom: 24px;">
        <template #header-extra>
          <span style="font-size: 14px; color: #64748b;">共 {{ myTotal }} 筆</span>
        </template>

        <NSpin :show="myLoading">
          <NDataTable
            :columns="myColumns"
            :data="myRecords"
            :bordered="false"
            :single-line="false"
            size="small"
          />
        </NSpin>

        <div v-if="myTotal > myPageSize" class="pagination-wrapper">
          <NPagination
            :page="myPage"
            :page-size="myPageSize"
            :item-count="myTotal"
            @update:page="fetchMyRecords"
          />
        </div>
      </NCard>

      <!-- 管理員：所有使用者紀錄 -->
      <NCard v-if="isAdmin" title="所有使用者登入紀錄">
        <template #header-extra>
          <span style="font-size: 14px; color: #64748b;">共 {{ allTotal }} 筆</span>
        </template>

        <div class="filter-bar">
          <NInput
            v-model:value="filterUserId"
            placeholder="依使用者 ID 篩選"
            clearable
            style="max-width: 320px;"
            @clear="handleFilterSearch"
          />
          <NButton type="primary" @click="handleFilterSearch">搜尋</NButton>
        </div>

        <NSpin :show="allLoading">
          <NDataTable
            :columns="allColumns"
            :data="allRecords"
            :bordered="false"
            :single-line="false"
            size="small"
          />
        </NSpin>

        <div v-if="allTotal > allPageSize" class="pagination-wrapper">
          <NPagination
            :page="allPage"
            :page-size="allPageSize"
            :item-count="allTotal"
            @update:page="fetchAllRecords"
          />
        </div>
      </NCard>
    </main>
  </div>
</template>

<style scoped>
.login-records-page {
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

.page-content {
  max-width: 960px;
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

.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0 0;
}

@media (max-width: 640px) {
  .top-nav {
    padding: 12px 16px;
  }

  .page-content {
    padding: 32px 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }
}
</style>
