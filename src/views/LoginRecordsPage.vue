<script setup lang="ts">
import { ref, h, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { UserService } from '@/api'
import type { LoginRecordItem } from '@/api'
import {
  NCard, NSpin, NTag
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { NDataTable } from 'naive-ui'
import { usePaginatedList } from '@/composables/usePaginatedList'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import PaginationBar from '@/components/PaginationBar.vue'
import FilterBar from '@/components/FilterBar.vue'

const authStore = useAuthStore()
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
  <PageLayout max-width="960px">
    <PageHeader title="登入紀錄" description="查看帳號的登入歷史記錄" />

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

      <PaginationBar :page="myPage" :page-size="myPageSize" :item-count="myTotal" @update:page="fetchMyRecords" />
    </NCard>

    <!-- 管理員：所有使用者紀錄 -->
    <NCard v-if="isAdmin" title="所有使用者登入紀錄">
      <template #header-extra>
        <span style="font-size: 14px; color: #64748b;">共 {{ allTotal }} 筆</span>
      </template>

      <FilterBar
        v-model="filterUserId"
        placeholder="依使用者 ID 篩選"
        max-width="320px"
        show-button
        @search="handleFilterSearch"
      />

      <NSpin :show="allLoading">
        <NDataTable
          :columns="allColumns"
          :data="allRecords"
          :bordered="false"
          :single-line="false"
          size="small"
        />
      </NSpin>

      <PaginationBar :page="allPage" :page-size="allPageSize" :item-count="allTotal" @update:page="fetchAllRecords" />
    </NCard>
  </PageLayout>
</template>
