<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { UserService } from '@/api'
import {
  NCard, NSpin
} from 'naive-ui'
import { NDataTable } from 'naive-ui'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { formatDateTime, DATETIME_SECOND } from '@/utils/datetime'
import { createMyLoginColumns, createAllLoginColumns } from '@/views/loginRecords.columns'
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

const formatTime = (iso: string) => formatDateTime(iso, DATETIME_SECOND)

const myColumns = createMyLoginColumns(formatTime)
const allColumns = createAllLoginColumns(formatTime)

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
  <PageLayout>
    <PageHeader title="登入紀錄" description="查看帳號的登入歷史記錄" />

    <!-- 我的登入紀錄 -->
    <NCard title="我的登入紀錄" style="margin-bottom: 24px;">
      <template #header-extra>
        <span style="font-size: 14px; color: var(--color-foreground-muted);">共 {{ myTotal }} 筆</span>
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
        <span style="font-size: 14px; color: var(--color-foreground-muted);">共 {{ allTotal }} 筆</span>
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
