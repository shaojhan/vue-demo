import { h } from 'vue'
import { NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { Department } from '@/api'
import type { UserListItem, EmployeeListItem } from '@/api'

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

// 會員表格欄位（角色 label/顏色為此表格專用，故與欄位定義同處）
export function createUserColumns(): DataTableColumns<UserListItem> {
  return [
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
      render: (row) => h('span', { style: 'font-family: monospace; font-size: 13px; color: var(--color-foreground-muted);' }, row.id.slice(0, 8) + '...')
    }
  ]
}

// 員工表格欄位。departmentLabels 由 view 傳入（同時用於部門下拉選項，維持單一來源）
export function createEmployeeColumns(
  departmentLabels: Record<Department, string>
): DataTableColumns<EmployeeListItem> {
  return [
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
}
