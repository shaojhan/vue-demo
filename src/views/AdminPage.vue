<script setup lang="ts">
import { ref, onMounted, h, watch } from 'vue'
import { useRouter } from 'vue-router'
import { EmployeeService, UserService, ApiError } from '@/api'
import { Department } from '@/api'
import type { AssignEmployeeResponse, UserListItem, EmployeeListItem, CsvUploadResponse } from '@/api'
import {
  NButton, NCard, NSpin, NAlert, NInput, NInputNumber, NSelect,
  NSpace, NTag, NDataTable, NProgress
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { usePaginatedList } from '@/composables/usePaginatedList'
import { useTaskPolling } from '@/composables/useTaskPolling'
import PageLayout from '@/components/PageLayout.vue'
import PageHeader from '@/components/PageHeader.vue'
import PaginationBar from '@/components/PaginationBar.vue'
import FormField from '@/components/FormField.vue'

const router = useRouter()
// 指派員工
const userId = ref('')
const idno = ref('')
const department = ref<Department>(Department.IT)
const roleId = ref<number | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const successResult = ref<AssignEmployeeResponse | null>(null)

// 會員列表
const { items: users, total: userTotal, page: userPage, pageSize: userPageSize, loading: userLoading, fetch: fetchUsers } = usePaginatedList(
  (p) => UserService.listUsers(p, 10)
)

// 員工列表
const { items: employees, total: employeeTotal, page: employeePage, pageSize: employeePageSize, loading: employeeLoading, fetch: fetchEmployees } = usePaginatedList(
  (p) => EmployeeService.listEmployees(p, 10)
)

// CSV 上傳 (非同步)
const csvFile = ref<File | null>(null)
const csvUploading = ref(false)
const csvError = ref('')
const csvResult = ref<CsvUploadResponse | null>(null)
const { taskId: csvTaskId, status: csvTaskStatus, progress: csvTaskProgress, result: csvTaskResult, error: csvTaskError, isRunning: csvTaskRunning, start: startCsvTask, cancel: cancelCsvTask, reset: resetCsvTask } = useTaskPolling()

// 任務完成時更新結果
watch(csvTaskStatus, (s) => {
  if (s === 'SUCCESS' && csvTaskResult.value) {
    csvResult.value = csvTaskResult.value as CsvUploadResponse
    fetchUsers()
    fetchEmployees()
  }
})

const departmentLabels: Record<Department, string> = {
  [Department.HR]: '人力資源部',
  [Department.IT]: '資訊科技部',
  [Department.PR]: '公關部',
  [Department.RD]: '研發部',
  [Department.BD]: '業務部'
}

const departmentOptions = Object.entries(departmentLabels).map(([key, label]) => ({
  label: `${label} (${key})`,
  value: key
}))

const roleLabels: Record<string, string> = {
  ADMIN: '管理員',
  EMPLOYEE: '員工',
  NORMAL: '一般用戶'
}

const roleTagType = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'warning' as const
    case 'EMPLOYEE': return 'info' as const
    default: return 'default' as const
  }
}

// 會員表格欄位
const userColumns: DataTableColumns<UserListItem> = [
  { title: '帳號', key: 'uid', width: 120, render: (row) => h('strong', row.uid) },
  { title: 'Email', key: 'email' },
  {
    title: '角色', key: 'role', width: 100,
    render: (row) => h(NTag, { size: 'small', type: roleTagType(row.role), bordered: false }, () => roleLabels[row.role] || row.role)
  },
  {
    title: '信箱驗證', key: 'email_verified', width: 100,
    render: (row) => h(NTag, { size: 'small', type: row.email_verified ? 'success' : 'error', bordered: false }, () => row.email_verified ? '已驗證' : '未驗證')
  },
  {
    title: '建立時間', key: 'created_at', width: 120,
    render: (row) => row.created_at?.slice(0, 10) || '-'
  },
  {
    title: 'ID', key: 'id', width: 100,
    render: (row) => h('span', { style: 'font-family: monospace; font-size: 13px; color: #64748b;' }, row.id.slice(0, 8) + '...')
  }
]

// 員工表格欄位
const employeeColumns: DataTableColumns<EmployeeListItem> = [
  { title: '員工編號', key: 'idno', width: 120, render: (row) => h('strong', row.idno) },
  {
    title: '部門', key: 'department', width: 140,
    render: (row) => h(NTag, { size: 'small', type: 'info', bordered: false }, () => departmentLabels[row.department] || row.department)
  },
  { title: '角色', key: 'role_name', render: (row) => row.role?.name || '-' },
  { title: '權限等級', key: 'role_level', width: 100, render: (row) => `Lv.${row.role?.level ?? '-'}` },
  {
    title: '建立時間', key: 'created_at', width: 120,
    render: (row) => row.created_at?.slice(0, 10) || '-'
  }
]

onMounted(() => {
  fetchUsers()
  fetchEmployees()
})

const handleSubmit = async () => {
  if (!userId.value || !idno.value || !roleId.value) {
    errorMessage.value = '請填寫所有欄位'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successResult.value = null

  try {
    const result = await EmployeeService.assignUserAsEmployee({
      user_id: userId.value,
      idno: idno.value,
      department: department.value,
      role_id: Number(roleId.value)
    })
    successResult.value = result
    userId.value = ''
    idno.value = ''
    roleId.value = null
    fetchUsers()
    fetchEmployees()
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        errorMessage.value = '您沒有管理員權限'
      } else if (error.status === 404) {
        errorMessage.value = '找不到該使用者'
      } else if (error.status === 409) {
        errorMessage.value = '該使用者已為員工'
      } else if (error.status === 422) {
        errorMessage.value = '輸入資料格式有誤'
      } else {
        errorMessage.value = '操作失敗，請稍後再試'
      }
    } else {
      errorMessage.value = '網路連線錯誤，請檢查網路狀態'
    }
  } finally {
    isLoading.value = false
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  csvFile.value = target.files?.[0] || null
  csvError.value = ''
  csvResult.value = null
}

const handleCsvUpload = async () => {
  if (!csvFile.value) {
    csvError.value = '請先選擇 CSV 檔案'
    return
  }

  csvUploading.value = true
  csvError.value = ''
  csvResult.value = null
  resetCsvTask()

  try {
    const { task_id } = await EmployeeService.uploadEmployeesCsvAsync({ file: csvFile.value })
    csvFile.value = null
    const fileInput = document.getElementById('csvFile') as HTMLInputElement
    if (fileInput) fileInput.value = ''
    startCsvTask(task_id)
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 403) {
        csvError.value = '您沒有管理員權限'
      } else if (error.status === 422) {
        csvError.value = 'CSV 格式錯誤，請檢查檔案內容'
      } else {
        csvError.value = '上傳失敗，請稍後再試'
      }
    } else {
      csvError.value = '網路連線錯誤，請檢查網路狀態'
    }
  } finally {
    csvUploading.value = false
  }
}

const csvTaskStatusLabel: Record<string, string> = {
  PENDING: '排隊中',
  STARTED: '處理中',
  PROGRESS: '處理中',
  SUCCESS: '完成',
  FAILURE: '失敗',
  REVOKED: '已取消'
}
</script>

<template>
  <PageLayout badge="管理後台" max-width="900px">
    <template #nav>
      <NButton @click="router.push('/mqtt')">MQTT 管理</NButton>
      <NButton @click="router.push('/kafka')">Kafka 管理</NButton>
    </template>

    <PageHeader title="管理員後台" description="管理會員與員工資料" />

    <!-- 指派員工 -->
    <NCard title="指派員工" style="margin-bottom: 24px;">
      <template #header-extra>
        <span style="font-size: 14px; color: #64748b;">將現有會員帳號指派為員工身份</span>
      </template>

      <form @submit.prevent="handleSubmit">
        <NAlert v-if="errorMessage" type="error" :bordered="false" style="margin-bottom: 16px;">
          {{ errorMessage }}
        </NAlert>

        <NAlert v-if="successResult" type="success" :bordered="false" style="margin-bottom: 16px;">
          員工指派成功！員工編號: {{ successResult.idno }} ｜
          部門: {{ departmentLabels[successResult.department] }} ｜
          角色: {{ successResult.role?.name || '-' }}
        </NAlert>

        <div class="form-grid">
          <FormField label="使用者 ID (UUID)">
            <NInput v-model:value="userId" placeholder="請輸入使用者 UUID" />
          </FormField>

          <FormField label="員工編號">
            <NInput v-model:value="idno" placeholder="例如: EMP001" />
          </FormField>

          <FormField label="部門">
            <NSelect v-model:value="department" :options="departmentOptions" />
          </FormField>

          <FormField label="角色 ID">
            <NInputNumber v-model:value="roleId" placeholder="請輸入角色 ID" :min="1" style="width: 100%;" />
          </FormField>
        </div>

        <NButton
          type="primary"
          block
          :loading="isLoading"
          attr-type="submit"
          style="margin-top: 20px;"
        >
          指派員工
        </NButton>
      </form>
    </NCard>

    <!-- CSV 批次上傳 -->
    <NCard title="CSV 批次建立員工" style="margin-bottom: 24px;">
      <template #header-extra>
        <span style="font-size: 14px; color: #64748b;">上傳 CSV 檔案批次建立員工帳號</span>
      </template>

      <div class="csv-format-hint">
        <div class="hint-title">CSV 格式說明</div>
        <code class="hint-code">idno,department,email,uid,role_id<br/>EMP001,IT,john@example.com,john,1<br/>EMP002,HR,jane@example.com,jane,2</code>
        <div class="hint-note">部門代碼：IT、HR、PR、RD、BD</div>
      </div>

      <NAlert v-if="csvError" type="error" :bordered="false" style="margin-bottom: 16px;">
        {{ csvError }}
      </NAlert>

      <!-- 任務進度 -->
      <div v-if="csvTaskId" class="task-progress" style="margin-bottom: 16px;">
        <div class="task-progress-header">
          <div class="task-progress-info">
            <NTag :type="csvTaskStatus === 'SUCCESS' ? 'success' : csvTaskStatus === 'FAILURE' ? 'error' : csvTaskStatus === 'REVOKED' ? 'warning' : 'info'" size="small">
              {{ csvTaskStatusLabel[csvTaskStatus] || csvTaskStatus }}
            </NTag>
            <span class="task-id">{{ csvTaskId }}</span>
          </div>
          <NSpace>
            <NButton v-if="csvTaskRunning" size="small" type="error" secondary @click="cancelCsvTask">取消任務</NButton>
            <NButton v-if="!csvTaskRunning" size="small" secondary @click="resetCsvTask">清除</NButton>
          </NSpace>
        </div>

        <div v-if="csvTaskStatus === 'PENDING' || csvTaskStatus === 'STARTED'" class="task-progress-body">
          <NSpin size="small" />
          <span class="task-progress-text">等待處理中...</span>
        </div>

        <div v-else-if="csvTaskStatus === 'PROGRESS' && csvTaskProgress" class="task-progress-body">
          <NProgress
            type="line"
            :percentage="Math.round(csvTaskProgress.percent ?? 0)"
            :show-indicator="true"
            status="success"
          />
          <div class="task-progress-detail">
            <span>{{ csvTaskProgress.current ?? 0 }} / {{ csvTaskProgress.total ?? 0 }}</span>
            <span v-if="csvTaskProgress.current_idno" class="task-current-item">{{ csvTaskProgress.current_idno }}</span>
          </div>
        </div>

        <div v-else-if="csvTaskStatus === 'FAILURE'" class="task-progress-body">
          <NAlert type="error" :bordered="false">{{ csvTaskError || '任務執行失敗' }}</NAlert>
        </div>

        <div v-else-if="csvTaskStatus === 'REVOKED'" class="task-progress-body">
          <NAlert type="warning" :bordered="false">任務已取消</NAlert>
        </div>
      </div>

      <!-- CSV 上傳結果 -->
      <div v-if="csvResult" class="upload-result" style="margin-bottom: 16px;">
        <div class="result-summary">
          <div class="result-stat total">
            <span class="stat-value">{{ csvResult.total }}</span>
            <span class="stat-label">總筆數</span>
          </div>
          <div class="result-stat success">
            <span class="stat-value">{{ csvResult.success_count }}</span>
            <span class="stat-label">成功</span>
          </div>
          <div class="result-stat failure">
            <span class="stat-value">{{ csvResult.failure_count }}</span>
            <span class="stat-label">失敗</span>
          </div>
        </div>
        <div v-if="csvResult.results.length > 0" class="result-details">
          <div class="result-list">
            <div
              v-for="item in csvResult.results"
              :key="item.row"
              class="result-item"
            >
              <span class="item-row">第 {{ item.row }} 行</span>
              <span class="item-idno">{{ item.idno }}</span>
              <NTag :type="item.success ? 'success' : 'error'" size="small">
                {{ item.success ? '成功' : '失敗' }}
              </NTag>
              <span class="item-message">{{ item.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!csvTaskRunning" class="file-input-wrap">
        <input
          id="csvFile"
          type="file"
          accept=".csv"
          class="file-input"
          @change="handleFileChange"
        />
        <label for="csvFile" class="file-label">
          <span v-if="csvFile">{{ csvFile.name }}</span>
          <span v-else>選擇 CSV 檔案</span>
        </label>
      </div>

      <NButton
        v-if="!csvTaskRunning"
        type="success"
        block
        :loading="csvUploading"
        :disabled="!csvFile"
        style="margin-top: 16px;"
        @click="handleCsvUpload"
      >
        上傳並建立員工
      </NButton>
    </NCard>

    <!-- 會員列表 -->
    <NCard title="會員列表" style="margin-bottom: 24px;">
      <template #header-extra>
        <span style="font-size: 14px; color: #64748b;">共 {{ userTotal }} 位會員</span>
      </template>

      <NSpin :show="userLoading">
        <NDataTable
          :columns="userColumns"
          :data="users"
          :bordered="false"
          :single-line="false"
          size="small"
        />
      </NSpin>

      <PaginationBar :page="userPage" :page-size="userPageSize" :item-count="userTotal" @update:page="fetchUsers" />
    </NCard>

    <!-- 員工列表 -->
    <NCard title="員工列表">
      <template #header-extra>
        <span style="font-size: 14px; color: #64748b;">共 {{ employeeTotal }} 位員工</span>
      </template>

      <NSpin :show="employeeLoading">
        <NDataTable
          :columns="employeeColumns"
          :data="employees"
          :bordered="false"
          :single-line="false"
          size="small"
        />
      </NSpin>

      <PaginationBar :page="employeePage" :page-size="employeePageSize" :item-count="employeeTotal" @update:page="fetchEmployees" />
    </NCard>
  </PageLayout>
</template>

<style scoped>
/* 表單 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* CSV 上傳 */
.csv-format-hint {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.hint-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.hint-code {
  display: block;
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-family: monospace;
  line-height: 1.6;
  overflow-x: auto;
}

.hint-note {
  margin-top: 10px;
  font-size: 13px;
  color: #64748b;
}

.file-input-wrap {
  position: relative;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.file-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  background: #fafafa;
  color: #64748b;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-label:hover {
  border-color: #10b981;
  background: #ecfdf5;
  color: #10b981;
}

/* CSV 結果 */
.upload-result {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.result-summary {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
}

.result-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-right: 1px solid #e2e8f0;
}

.result-stat:last-child {
  border-right: none;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.result-stat.total .stat-value { color: #6366f1; }
.result-stat.success .stat-value { color: #10b981; }
.result-stat.failure .stat-value { color: #ef4444; }

.result-details {
  max-height: 240px;
  overflow-y: auto;
}

.result-list {
  padding: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
}

.result-item:hover {
  background: #f1f5f9;
}

.item-row {
  color: #94a3b8;
  min-width: 60px;
}

.item-idno {
  font-weight: 600;
  color: #0f172a;
  min-width: 80px;
}

.item-message {
  flex: 1;
  color: #64748b;
}

/* 任務進度 */
.task-progress {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}

.task-progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.task-progress-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-id {
  font-family: monospace;
  font-size: 12px;
  color: #94a3b8;
}

.task-progress-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-progress-text {
  font-size: 14px;
  color: #64748b;
}

.task-progress-detail {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #64748b;
}

.task-current-item {
  font-weight: 600;
  color: #475569;
}

/* RWD */
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
