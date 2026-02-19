<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ApprovalService } from '@/api'
import { ApprovalStatus } from '@/api/models/ApprovalStatus'
import { ApprovalType } from '@/api/models/ApprovalType'
import { LeaveType } from '@/api/models/LeaveType'
import type { ApprovalListItem, ApprovalRequestResponse, ApprovalStepResponse } from '@/api'
import {
  NButton, NCard, NSpin, NAlert, NInput, NInputNumber, NModal,
  NPagination, NSpace, NTag, NTabs, NTabPane, NSelect, NDatePicker,
  NDescriptions, NDescriptionsItem, useDialog
} from 'naive-ui'
import { AgGridVue } from 'ag-grid-vue3'
import type { ColDef, RowClickedEvent } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { useFormSubmit } from '@/composables/useFormSubmit'
import { useLogout } from '@/composables/useLogout'
import { useModal } from '@/composables/useModal'

const router = useRouter()
const authStore = useAuthStore()
const dialog = useDialog()
const { logout: handleLogout } = useLogout()

// === 我的申請列表 ===
const myStatusFilter = ref<ApprovalStatus | null>(null)
const { items: myRequests, total: myTotal, page: myPage, pageSize: myPageSize, loading: myLoading, fetch: fetchMyRequests, reset: resetMyRequests } = usePaginatedList(
  async (p) => ApprovalService.getMyApprovalRequests(p, 10, myStatusFilter.value || undefined)
)

// === 待我審批列表 ===
const { items: pendingRequests, total: pendingTotal, page: pendingPage, pageSize: pendingPageSize, loading: pendingLoading, fetch: fetchPending } = usePaginatedList(
  async (p) => ApprovalService.getPendingApprovals(p, 10)
)

// === 建立申請 Modal ===
const { show: showCreateModal, open: openCreateModal, close: closeCreateModal } = useModal()
const createType = ref<ApprovalType>(ApprovalType.LEAVE)

// 請假表單
const leaveType = ref<LeaveType>(LeaveType.ANNUAL)
const leaveStartDate = ref<number | null>(null)
const leaveEndDate = ref<number | null>(null)
const leaveReason = ref('')

// 費用報銷表單
const expenseAmount = ref<number | null>(null)
const expenseCategory = ref('')
const expenseDescription = ref('')
const expenseReceiptUrl = ref('')

const resetCreateForm = () => {
  leaveType.value = LeaveType.ANNUAL
  leaveStartDate.value = null
  leaveEndDate.value = null
  leaveReason.value = ''
  expenseAmount.value = null
  expenseCategory.value = ''
  expenseDescription.value = ''
  expenseReceiptUrl.value = ''
  createFormError.value = ''
}

const handleOpenCreate = () => {
  resetCreateForm()
  openCreateModal()
}

const { loading: createSubmitting, error: createFormError, submit: submitCreate } = useFormSubmit(async () => {
  if (createType.value === ApprovalType.LEAVE) {
    await ApprovalService.createLeaveRequest({
      leave_type: leaveType.value,
      start_date: new Date(leaveStartDate.value!).toISOString().slice(0, 10),
      end_date: new Date(leaveEndDate.value!).toISOString().slice(0, 10),
      reason: leaveReason.value.trim()
    })
  } else {
    await ApprovalService.createExpenseRequest({
      amount: expenseAmount.value!,
      category: expenseCategory.value.trim(),
      description: expenseDescription.value.trim(),
      receipt_url: expenseReceiptUrl.value.trim() || null
    })
  }
  closeCreateModal()
  fetchMyRequests(1)
})

const handleCreate = () => submitCreate(() => {
  if (createType.value === ApprovalType.LEAVE) {
    if (!leaveStartDate.value || !leaveEndDate.value) return '請選擇請假日期'
    if (!leaveReason.value.trim()) return '請輸入請假原因'
  } else {
    if (!expenseAmount.value || expenseAmount.value <= 0) return '請輸入有效金額'
    if (!expenseCategory.value.trim()) return '請輸入費用類別'
    if (!expenseDescription.value.trim()) return '請輸入費用說明'
  }
  return null
})

// === 詳情 Modal ===
const { show: showDetailModal, close: closeDetailModal } = useModal()
const currentDetail = ref<ApprovalRequestResponse | null>(null)
const detailLoading = ref(false)

const openDetail = async (id: string) => {
  showDetailModal.value = true
  detailLoading.value = true
  currentDetail.value = null
  try {
    currentDetail.value = await ApprovalService.getApprovalDetail(id)
  } catch {
    closeDetailModal()
  } finally {
    detailLoading.value = false
  }
}

// === 審批操作 ===
const actionComment = ref('')
const actionLoading = ref(false)

const handleApprove = (id: string) => {
  dialog.success({
    title: '確認核准',
    content: '確定要核准此申請嗎？',
    positiveText: '核准',
    negativeText: '取消',
    onPositiveClick: async () => {
      actionLoading.value = true
      try {
        currentDetail.value = await ApprovalService.approveRequest(id, { comment: actionComment.value.trim() || null })
        actionComment.value = ''
        fetchPending(pendingPage.value)
        fetchMyRequests(myPage.value)
      } catch { /* ignore */ } finally {
        actionLoading.value = false
      }
    }
  })
}

const handleReject = (id: string) => {
  dialog.warning({
    title: '確認駁回',
    content: '確定要駁回此申請嗎？',
    positiveText: '駁回',
    negativeText: '取消',
    onPositiveClick: async () => {
      actionLoading.value = true
      try {
        currentDetail.value = await ApprovalService.rejectRequest(id, { comment: actionComment.value.trim() || null })
        actionComment.value = ''
        fetchPending(pendingPage.value)
        fetchMyRequests(myPage.value)
      } catch { /* ignore */ } finally {
        actionLoading.value = false
      }
    }
  })
}

const handleCancel = (id: string) => {
  dialog.warning({
    title: '確認取消',
    content: '確定要取消此申請嗎？',
    positiveText: '取消申請',
    negativeText: '返回',
    onPositiveClick: async () => {
      actionLoading.value = true
      try {
        currentDetail.value = await ApprovalService.cancelRequest(id)
        fetchMyRequests(myPage.value)
      } catch { /* ignore */ } finally {
        actionLoading.value = false
      }
    }
  })
}

// === 格式化 ===
const typeLabels: Record<string, string> = {
  LEAVE: '請假',
  EXPENSE: '費用報銷'
}

const statusLabels: Record<string, string> = {
  PENDING: '審批中',
  APPROVED: '已核准',
  REJECTED: '已駁回',
  CANCELLED: '已取消'
}

const statusColors: Record<string, string> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default'
}

const leaveTypeLabels: Record<string, string> = {
  ANNUAL: '特休',
  SICK: '病假',
  PERSONAL: '事假',
  OTHER: '其他'
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

// === 判斷當前用戶是否為待審批人 ===
const isCurrentApprover = (detail: ApprovalRequestResponse) => {
  if (detail.status !== ApprovalStatus.PENDING) return false
  const currentStep = detail.steps.find(s => s.step_order === detail.current_step_order)
  return currentStep?.approver_id === authStore.user?.id && currentStep?.status === ApprovalStatus.PENDING
}

const isMyRequest = (detail: ApprovalRequestResponse) => {
  return detail.requester_id === authStore.user?.id
}

// === AG Grid 欄位 ===
const commonColumnDefs: ColDef<ApprovalListItem>[] = [
  {
    headerName: '類型',
    field: 'type',
    width: 110,
    cellRenderer: (params: { value: string }) => {
      const label = typeLabels[params.value] || params.value
      const bg = params.value === 'LEAVE' ? '#dbeafe' : '#fef3c7'
      const color = params.value === 'LEAVE' ? '#1d4ed8' : '#92400e'
      return `<span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:12px;font-weight:600;color:${color};background:${bg};">${label}</span>`
    }
  },
  {
    headerName: '狀態',
    field: 'status',
    width: 110,
    cellRenderer: (params: { value: string }) => {
      const label = statusLabels[params.value] || params.value
      const colorMap: Record<string, { bg: string; color: string }> = {
        PENDING: { bg: '#fef9c3', color: '#854d0e' },
        APPROVED: { bg: '#dcfce7', color: '#16a34a' },
        REJECTED: { bg: '#fef2f2', color: '#dc2626' },
        CANCELLED: { bg: '#f1f5f9', color: '#64748b' }
      }
      const { bg, color } = colorMap[params.value] || { bg: '#f1f5f9', color: '#64748b' }
      return `<span style="display:inline-block;padding:2px 10px;border-radius:4px;font-size:12px;font-weight:600;color:${color};background:${bg};">${label}</span>`
    }
  },
  {
    headerName: '建立時間',
    field: 'created_at',
    flex: 1,
    minWidth: 160,
    valueFormatter: (params) => formatDate(params.value)
  },
  {
    headerName: '當前步驟',
    field: 'current_step_order',
    width: 100,
    valueFormatter: (params) => params.value != null ? `第 ${params.value} 步` : '-'
  }
]

const myColumnDefs = ref<ColDef<ApprovalListItem>[]>([...commonColumnDefs])
const pendingColumnDefs = ref<ColDef<ApprovalListItem>[]>([...commonColumnDefs])

const defaultColDef: ColDef = {
  sortable: true,
  resizable: true
}

const onMyRowClicked = (event: RowClickedEvent<ApprovalListItem>) => {
  if (event.data) openDetail(event.data.id)
}

const onPendingRowClicked = (event: RowClickedEvent<ApprovalListItem>) => {
  if (event.data) openDetail(event.data.id)
}

// === 狀態篩選選項 ===
const statusFilterOptions = [
  { label: '全部', value: '' },
  { label: '審批中', value: ApprovalStatus.PENDING },
  { label: '已核准', value: ApprovalStatus.APPROVED },
  { label: '已駁回', value: ApprovalStatus.REJECTED },
  { label: '已取消', value: ApprovalStatus.CANCELLED }
]

const handleStatusFilter = (val: string) => {
  myStatusFilter.value = val ? (val as ApprovalStatus) : null
  resetMyRequests()
}

// === 建立類型選項 ===
const typeOptions = [
  { label: '請假', value: ApprovalType.LEAVE },
  { label: '費用報銷', value: ApprovalType.EXPENSE }
]

const leaveTypeOptions = [
  { label: '特休', value: LeaveType.ANNUAL },
  { label: '病假', value: LeaveType.SICK },
  { label: '事假', value: LeaveType.PERSONAL },
  { label: '其他', value: LeaveType.OTHER }
]

// === 詳情中顯示 detail 資訊 ===
const getDetailInfo = (detail: ApprovalRequestResponse) => {
  if (detail.type === ApprovalType.LEAVE) {
    const d = detail.detail as { leave_type?: string; start_date?: string; end_date?: string; reason?: string }
    return {
      items: [
        { label: '假別', value: leaveTypeLabels[d.leave_type || ''] || d.leave_type || '-' },
        { label: '開始日期', value: d.start_date || '-' },
        { label: '結束日期', value: d.end_date || '-' },
        { label: '原因', value: d.reason || '-' }
      ]
    }
  } else {
    const d = detail.detail as { amount?: number; category?: string; description?: string; receipt_url?: string }
    return {
      items: [
        { label: '金額', value: d.amount != null ? `$${d.amount.toLocaleString()}` : '-' },
        { label: '類別', value: d.category || '-' },
        { label: '說明', value: d.description || '-' },
        { label: '收據連結', value: d.receipt_url || '-' }
      ]
    }
  }
}

const getStepStatusLabel = (step: ApprovalStepResponse) => {
  return statusLabels[step.status] || step.status
}

const getStepStatusType = (step: ApprovalStepResponse): 'default' | 'success' | 'warning' | 'error' | 'info' => {
  const map: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
    CANCELLED: 'default'
  }
  return map[step.status] || 'default'
}

onMounted(() => {
  fetchMyRequests()
  fetchPending()
})
</script>

<template>
  <div class="approval-page">
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
        <span class="nav-badge">簽核管理</span>
      </div>
      <NSpace>
        <NButton @click="router.push('/user')">個人頁面</NButton>
        <NButton @click="handleLogout">登出</NButton>
      </NSpace>
    </nav>

    <main class="approval-content">
      <div class="page-header">
        <div>
          <h1>簽核管理</h1>
          <p>管理您的請假與費用報銷申請</p>
        </div>
        <NButton type="success" @click="handleOpenCreate">建立申請</NButton>
      </div>

      <NTabs type="line" animated>
        <!-- Tab 1: 我的申請 -->
        <NTabPane name="my-requests" tab="我的申請">
          <NCard size="small" style="margin-bottom: 16px;">
            <NSpace align="center">
              <span style="font-size: 13px; color: #64748b;">狀態篩選：</span>
              <NSelect
                :value="myStatusFilter || ''"
                :options="statusFilterOptions"
                style="width: 140px;"
                @update:value="handleStatusFilter"
              />
            </NSpace>
          </NCard>

          <div v-if="myLoading" class="center-state">
            <NSpin size="large" />
          </div>
          <template v-else>
            <div v-if="myRequests.length === 0" class="empty-state">
              <p>尚無申請紀錄</p>
            </div>
            <template v-else>
              <ag-grid-vue
                class="ag-theme-quartz approval-grid"
                :rowData="myRequests"
                :columnDefs="myColumnDefs"
                :defaultColDef="defaultColDef"
                :pagination="false"
                :domLayout="'autoHeight'"
                @row-clicked="onMyRowClicked"
              />
              <div v-if="myTotal > myPageSize" class="pagination-wrapper">
                <NPagination
                  :page="myPage"
                  :page-size="myPageSize"
                  :item-count="myTotal"
                  @update:page="fetchMyRequests"
                />
              </div>
            </template>
          </template>
        </NTabPane>

        <!-- Tab 2: 待我審批 -->
        <NTabPane name="pending" tab="待我審批">
          <div v-if="pendingLoading" class="center-state">
            <NSpin size="large" />
          </div>
          <template v-else>
            <div v-if="pendingRequests.length === 0" class="empty-state">
              <p>目前沒有待審批項目</p>
            </div>
            <template v-else>
              <ag-grid-vue
                class="ag-theme-quartz approval-grid"
                :rowData="pendingRequests"
                :columnDefs="pendingColumnDefs"
                :defaultColDef="defaultColDef"
                :pagination="false"
                :domLayout="'autoHeight'"
                @row-clicked="onPendingRowClicked"
              />
              <div v-if="pendingTotal > pendingPageSize" class="pagination-wrapper">
                <NPagination
                  :page="pendingPage"
                  :page-size="pendingPageSize"
                  :item-count="pendingTotal"
                  @update:page="fetchPending"
                />
              </div>
            </template>
          </template>
        </NTabPane>
      </NTabs>
    </main>

    <!-- 建立申請 Modal -->
    <NModal
      v-model:show="showCreateModal"
      preset="card"
      title="建立申請"
      style="max-width: 520px;"
      :mask-closable="true"
    >
      <NAlert v-if="createFormError" type="error" :bordered="false" style="margin-bottom: 16px;">
        {{ createFormError }}
      </NAlert>

      <div class="form-group">
        <label>申請類型</label>
        <NSelect v-model:value="createType" :options="typeOptions" />
      </div>

      <!-- 請假表單 -->
      <template v-if="createType === ApprovalType.LEAVE">
        <div class="form-group">
          <label>假別 *</label>
          <NSelect v-model:value="leaveType" :options="leaveTypeOptions" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>開始日期 *</label>
            <NDatePicker v-model:value="leaveStartDate" type="date" clearable style="width: 100%;" />
          </div>
          <div class="form-group">
            <label>結束日期 *</label>
            <NDatePicker v-model:value="leaveEndDate" type="date" clearable style="width: 100%;" />
          </div>
        </div>
        <div class="form-group">
          <label>請假原因 *</label>
          <NInput v-model:value="leaveReason" type="textarea" placeholder="請輸入請假原因..." :rows="3" />
        </div>
      </template>

      <!-- 費用報銷表單 -->
      <template v-else>
        <div class="form-row">
          <div class="form-group">
            <label>金額 *</label>
            <NInputNumber v-model:value="expenseAmount" :min="0" placeholder="輸入金額" style="width: 100%;" />
          </div>
          <div class="form-group">
            <label>類別 *</label>
            <NInput v-model:value="expenseCategory" placeholder="例如：交通、餐飲、辦公用品" />
          </div>
        </div>
        <div class="form-group">
          <label>說明 *</label>
          <NInput v-model:value="expenseDescription" type="textarea" placeholder="請輸入費用說明..." :rows="3" />
        </div>
        <div class="form-group">
          <label>收據連結</label>
          <NInput v-model:value="expenseReceiptUrl" placeholder="選填，貼上收據圖片連結" />
        </div>
      </template>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="closeCreateModal">取消</NButton>
          <NButton type="success" :loading="createSubmitting" @click="handleCreate">送出申請</NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 詳情 Modal -->
    <NModal
      v-model:show="showDetailModal"
      preset="card"
      :title="currentDetail ? `${typeLabels[currentDetail.type] || currentDetail.type}申請` : '載入中...'"
      style="max-width: 560px;"
      :mask-closable="true"
    >
      <div v-if="detailLoading" class="center-state">
        <NSpin size="large" />
      </div>

      <template v-else-if="currentDetail">
        <!-- 狀態標籤 -->
        <div style="margin-bottom: 16px;">
          <NTag :type="(statusColors[currentDetail.status] as any)" size="medium">
            {{ statusLabels[currentDetail.status] || currentDetail.status }}
          </NTag>
          <span style="margin-left: 12px; font-size: 13px; color: #64748b;">
            建立時間：{{ formatDate(currentDetail.created_at) }}
          </span>
        </div>

        <!-- 申請內容 -->
        <NDescriptions :column="1" label-placement="left" bordered size="small" style="margin-bottom: 20px;">
          <NDescriptionsItem
            v-for="item in getDetailInfo(currentDetail).items"
            :key="item.label"
            :label="item.label"
          >
            {{ item.value }}
          </NDescriptionsItem>
        </NDescriptions>

        <!-- 審批鏈 -->
        <h4 style="margin: 0 0 12px; font-size: 14px; color: #374151;">審批鏈</h4>
        <div class="approval-steps">
          <div v-for="step in currentDetail.steps" :key="step.step_order" class="approval-step">
            <div class="step-indicator" :class="step.status.toLowerCase()">
              {{ step.step_order }}
            </div>
            <div class="step-info">
              <div class="step-header">
                <span class="step-approver">審批人：{{ step.approver_id }}</span>
                <NTag :type="getStepStatusType(step)" size="tiny">
                  {{ getStepStatusLabel(step) }}
                </NTag>
              </div>
              <div v-if="step.comment" class="step-comment">{{ step.comment }}</div>
              <div v-if="step.decided_at" class="step-time">{{ formatDate(step.decided_at) }}</div>
            </div>
          </div>
        </div>

        <!-- 審批備註輸入 -->
        <div v-if="isCurrentApprover(currentDetail)" style="margin-top: 20px;">
          <div class="form-group">
            <label>審批備註</label>
            <NInput v-model:value="actionComment" type="textarea" placeholder="選填，輸入審批備註..." :rows="2" />
          </div>
        </div>
      </template>

      <template v-if="currentDetail && !detailLoading" #footer>
        <NSpace justify="end">
          <!-- 申請人可取消 -->
          <NButton
            v-if="isMyRequest(currentDetail) && currentDetail.status === ApprovalStatus.PENDING"
            type="error"
            :loading="actionLoading"
            @click="handleCancel(currentDetail.id)"
          >
            取消申請
          </NButton>
          <!-- 審批人可核准/駁回 -->
          <template v-if="isCurrentApprover(currentDetail)">
            <NButton
              type="error"
              :loading="actionLoading"
              @click="handleReject(currentDetail.id)"
            >
              駁回
            </NButton>
            <NButton
              type="success"
              :loading="actionLoading"
              @click="handleApprove(currentDetail.id)"
            >
              核准
            </NButton>
          </template>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<style scoped>
.approval-page {
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
  background: #ede9fe;
  color: #7c3aed;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.approval-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 48px 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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

.center-state {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #94a3b8;
  font-size: 15px;
}

.approval-grid {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.approval-grid :deep(.ag-row) {
  cursor: pointer;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px 0;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* 審批鏈 */
.approval-steps {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.approval-step {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.approval-step:last-child {
  border-bottom: none;
}

.step-indicator {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  background: #f1f5f9;
  color: #64748b;
}

.step-indicator.approved {
  background: #dcfce7;
  color: #16a34a;
}

.step-indicator.rejected {
  background: #fef2f2;
  color: #dc2626;
}

.step-indicator.pending {
  background: #fef9c3;
  color: #854d0e;
}

.step-info {
  flex: 1;
  min-width: 0;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.step-approver {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.step-comment {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.step-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

/* RWD */
@media (max-width: 640px) {
  .top-nav {
    padding: 12px 16px;
  }

  .approval-content {
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

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
