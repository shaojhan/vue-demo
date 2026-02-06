<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { EmployeeService, UserService, ApiError } from '@/api'
import { Department } from '@/api'
import type { AssignEmployeeResponse, UserListItem, EmployeeListItem, CsvUploadResponse } from '@/api'

const router = useRouter()
const authStore = useAuthStore()

// 指派員工
const userId = ref('')
const idno = ref('')
const department = ref<Department>(Department.IT)
const roleId = ref<number | ''>('')
const isLoading = ref(false)
const errorMessage = ref('')
const successResult = ref<AssignEmployeeResponse | null>(null)

// 會員列表
const users = ref<UserListItem[]>([])
const userTotal = ref(0)
const userPage = ref(1)
const userPageSize = 10
const userLoading = ref(false)
const userTotalPages = computed(() => Math.ceil(userTotal.value / userPageSize))

// 員工列表
const employees = ref<EmployeeListItem[]>([])
const employeeTotal = ref(0)
const employeePage = ref(1)
const employeePageSize = 10
const employeeLoading = ref(false)
const employeeTotalPages = computed(() => Math.ceil(employeeTotal.value / employeePageSize))

// CSV 上傳
const csvFile = ref<File | null>(null)
const csvUploading = ref(false)
const csvError = ref('')
const csvResult = ref<CsvUploadResponse | null>(null)

const departmentLabels: Record<Department, string> = {
  [Department.HR]: '人力資源部',
  [Department.IT]: '資訊科技部',
  [Department.PR]: '公關部',
  [Department.RD]: '研發部',
  [Department.BD]: '業務部'
}

const roleLabels: Record<string, string> = {
  ADMIN: '管理員',
  EMPLOYEE: '員工',
  NORMAL: '一般用戶'
}

const fetchUsers = async (page = 1) => {
  userLoading.value = true
  try {
    const res = await UserService.listUsers(page, userPageSize)
    users.value = res.items
    userTotal.value = res.total
    userPage.value = res.page
  } catch {
    users.value = []
  } finally {
    userLoading.value = false
  }
}

const fetchEmployees = async (page = 1) => {
  employeeLoading.value = true
  try {
    const res = await EmployeeService.listEmployees(page, employeePageSize)
    employees.value = res.items
    employeeTotal.value = res.total
    employeePage.value = res.page
  } catch {
    employees.value = []
  } finally {
    employeeLoading.value = false
  }
}

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
    roleId.value = ''
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

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
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

  try {
    const result = await EmployeeService.uploadEmployeesCsv({ file: csvFile.value })
    csvResult.value = result
    csvFile.value = null
    // 清空 file input
    const fileInput = document.getElementById('csvFile') as HTMLInputElement
    if (fileInput) fileInput.value = ''
    // 重新載入列表
    fetchUsers()
    fetchEmployees()
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
</script>

<template>
  <div class="admin-page">
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
        <span class="nav-badge">管理後台</span>
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

    <main class="admin-content">
      <div class="page-header">
        <h1>管理員後台</h1>
        <p>管理會員與員工資料</p>
      </div>

      <!-- 指派員工 -->
      <section class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <div>
            <h2>指派員工</h2>
            <p>將現有會員帳號指派為員工身份</p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="form">
          <Transition name="fade">
            <div v-if="errorMessage" class="error-alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              <span>{{ errorMessage }}</span>
            </div>
          </Transition>

          <Transition name="fade">
            <div v-if="successResult" class="success-alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <div>
                <span>員工指派成功！</span>
                <div class="success-detail">
                  員工編號: {{ successResult.idno }} ｜
                  部門: {{ departmentLabels[successResult.department] }} ｜
                  角色: {{ successResult.role?.name || '-' }}
                </div>
              </div>
            </div>
          </Transition>

          <div class="form-grid">
            <div class="input-group">
              <label for="userId">使用者 ID (UUID)</label>
              <div class="input-field">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="userId"
                  v-model="userId"
                  type="text"
                  placeholder="請輸入使用者 UUID"
                />
              </div>
            </div>

            <div class="input-group">
              <label for="idno">員工編號</label>
              <div class="input-field">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                <input
                  id="idno"
                  v-model="idno"
                  type="text"
                  placeholder="例如: EMP001"
                />
              </div>
            </div>

            <div class="input-group">
              <label for="department">部門</label>
              <div class="input-field">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <select id="department" v-model="department">
                  <option v-for="(label, key) in departmentLabels" :key="key" :value="key">
                    {{ label }} ({{ key }})
                  </option>
                </select>
              </div>
            </div>

            <div class="input-group">
              <label for="roleId">角色 ID</label>
              <div class="input-field">
                <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <input
                  id="roleId"
                  v-model="roleId"
                  type="number"
                  placeholder="請輸入角色 ID"
                  min="1"
                />
              </div>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="btn-loading">
              <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              處理中...
            </span>
            <span v-else>指派員工</span>
          </button>
        </form>
      </section>

      <!-- CSV 批次上傳 -->
      <section class="section-card">
        <div class="section-header">
          <div class="section-icon csv-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <div>
            <h2>CSV 批次建立員工</h2>
            <p>上傳 CSV 檔案批次建立員工帳號（若會員不存在將自動建立）</p>
          </div>
        </div>

        <div class="csv-format-hint">
          <div class="hint-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            CSV 格式說明
          </div>
          <code class="hint-code">idno,department,email,uid,role_id<br/>EMP001,IT,john@example.com,john,1<br/>EMP002,HR,jane@example.com,jane,2</code>
          <div class="hint-note">
            部門代碼：IT、HR、PR、RD、BD
          </div>
        </div>

        <div class="upload-area">
          <Transition name="fade">
            <div v-if="csvError" class="error-alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              <span>{{ csvError }}</span>
            </div>
          </Transition>

          <Transition name="fade">
            <div v-if="csvResult" class="upload-result">
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
                    :class="{ success: item.success, failure: !item.success }"
                  >
                    <span class="item-row">第 {{ item.row }} 行</span>
                    <span class="item-idno">{{ item.idno }}</span>
                    <span class="item-status">
                      <svg v-if="item.success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </span>
                    <span class="item-message">{{ item.message }}</span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>

          <div class="file-input-wrap">
            <input
              id="csvFile"
              type="file"
              accept=".csv"
              @change="handleFileChange"
              class="file-input"
            />
            <label for="csvFile" class="file-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span v-if="csvFile">{{ csvFile.name }}</span>
              <span v-else>選擇 CSV 檔案</span>
            </label>
          </div>

          <button
            type="button"
            class="upload-btn"
            :disabled="csvUploading || !csvFile"
            @click="handleCsvUpload"
          >
            <span v-if="csvUploading" class="btn-loading">
              <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              上傳中...
            </span>
            <span v-else>上傳並建立員工</span>
          </button>
        </div>
      </section>

      <!-- 會員列表 -->
      <section class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <h2>會員列表</h2>
            <p>共 {{ userTotal }} 位會員</p>
          </div>
        </div>

        <div v-if="userLoading" class="table-loading">
          <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
          載入中...
        </div>
        <template v-else>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>帳號</th>
                  <th>Email</th>
                  <th>角色</th>
                  <th>信箱驗證</th>
                  <th>建立時間</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td class="cell-bold">{{ user.uid }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="role-badge" :class="user.role.toLowerCase()">
                      {{ roleLabels[user.role] || user.role }}
                    </span>
                  </td>
                  <td>
                    <span :class="['verify-badge', user.email_verified ? 'verified' : 'unverified']">
                      {{ user.email_verified ? '已驗證' : '未驗證' }}
                    </span>
                  </td>
                  <td class="cell-muted">{{ user.created_at?.slice(0, 10) || '-' }}</td>
                  <td class="cell-mono">{{ user.id.slice(0, 8) }}...</td>
                </tr>
                <tr v-if="users.length === 0">
                  <td colspan="6" class="cell-empty">暫無資料</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="userTotalPages > 1" class="pagination">
            <button :disabled="userPage <= 1" @click="fetchUsers(userPage - 1)">上一頁</button>
            <span>第 {{ userPage }} / {{ userTotalPages }} 頁</span>
            <button :disabled="userPage >= userTotalPages" @click="fetchUsers(userPage + 1)">下一頁</button>
          </div>
        </template>
      </section>

      <!-- 員工列表 -->
      <section class="section-card">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
            </svg>
          </div>
          <div>
            <h2>員工列表</h2>
            <p>共 {{ employeeTotal }} 位員工</p>
          </div>
        </div>

        <div v-if="employeeLoading" class="table-loading">
          <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
          載入中...
        </div>
        <template v-else>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>員工編號</th>
                  <th>部門</th>
                  <th>角色</th>
                  <th>權限等級</th>
                  <th>建立時間</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="emp in employees" :key="emp.id">
                  <td class="cell-bold">{{ emp.idno }}</td>
                  <td>
                    <span class="dept-badge">{{ departmentLabels[emp.department] || emp.department }}</span>
                  </td>
                  <td>{{ emp.role?.name || '-' }}</td>
                  <td>Lv.{{ emp.role?.level ?? '-' }}</td>
                  <td class="cell-muted">{{ emp.created_at?.slice(0, 10) || '-' }}</td>
                </tr>
                <tr v-if="employees.length === 0">
                  <td colspan="5" class="cell-empty">暫無資料</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="employeeTotalPages > 1" class="pagination">
            <button :disabled="employeePage <= 1" @click="fetchEmployees(employeePage - 1)">上一頁</button>
            <span>第 {{ employeePage }} / {{ employeeTotalPages }} 頁</span>
            <button :disabled="employeePage >= employeeTotalPages" @click="fetchEmployees(employeePage + 1)">下一頁</button>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<style scoped>
.admin-page {
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
  background: #fef3c7;
  color: #b45309;
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
.admin-content {
  max-width: 800px;
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

/* 區塊卡片 */
.section-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 32px;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.section-icon {
  width: 48px;
  height: 48px;
  background: #eef2ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.section-icon svg {
  width: 24px;
  height: 24px;
  color: #6366f1;
}

.section-icon.muted {
  background: #f1f5f9;
}

.section-icon.muted svg {
  color: #94a3b8;
}

.section-icon.csv-icon {
  background: #ecfdf5;
}

.section-icon.csv-icon svg {
  color: #10b981;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px;
}

.section-header p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* 表單 */
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #dc2626;
  font-size: 14px;
}

.error-alert svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.success-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  color: #16a34a;
  font-size: 14px;
}

.success-alert svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.success-detail {
  margin-top: 4px;
  font-size: 13px;
  color: #15803d;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-field {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 14px;
  width: 20px;
  height: 20px;
  color: #94a3b8;
  pointer-events: none;
}

.input-field input,
.input-field select {
  width: 100%;
  padding: 14px 14px 14px 46px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  background: white;
  color: #1e293b;
  transition: all 0.2s;
  box-sizing: border-box;
}

.input-field input:focus,
.input-field select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-field input::placeholder {
  color: #94a3b8;
}

.submit-btn {
  padding: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -6px rgba(99, 102, 241, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spin {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
}

.hint-title svg {
  width: 18px;
  height: 18px;
  color: #6366f1;
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

.upload-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.file-label svg {
  width: 24px;
  height: 24px;
}

.file-input:focus + .file-label {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.upload-btn {
  padding: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -6px rgba(16, 185, 129, 0.4);
}

.upload-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

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

.result-stat.total .stat-value {
  color: #6366f1;
}

.result-stat.success .stat-value {
  color: #10b981;
}

.result-stat.failure .stat-value {
  color: #ef4444;
}

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

.result-item.success .item-status svg {
  color: #10b981;
}

.result-item.failure .item-status svg {
  color: #ef4444;
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

.item-status svg {
  width: 16px;
  height: 16px;
}

.item-message {
  flex: 1;
  color: #64748b;
}

/* 表格 */
.table-wrap {
  overflow-x: auto;
}

.table-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 0;
  color: #94a3b8;
  font-size: 14px;
}

.table-loading svg {
  width: 20px;
  height: 20px;
  color: #6366f1;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: #64748b;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

.data-table td {
  padding: 14px 16px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.cell-bold {
  font-weight: 600;
  color: #0f172a;
}

.cell-muted {
  color: #94a3b8;
  font-size: 13px;
}

.cell-mono {
  font-family: monospace;
  font-size: 13px;
  color: #64748b;
}

.cell-empty {
  text-align: center;
  color: #94a3b8;
  padding: 32px 16px !important;
}

.role-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
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

.verify-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.verify-badge.verified {
  background: #f0fdf4;
  color: #16a34a;
}

.verify-badge.unverified {
  background: #fef2f2;
  color: #dc2626;
}

.dept-badge {
  display: inline-block;
  padding: 3px 10px;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* 分頁 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
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

/* RWD */
@media (max-width: 640px) {
  .top-nav {
    padding: 12px 16px;
  }

  .nav-actions {
    gap: 8px;
  }

  .nav-link span,
  .logout-btn span {
    display: none;
  }

  .admin-content {
    padding: 32px 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .section-card {
    padding: 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
