import { h } from 'vue'
import { NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { LoginRecordItem } from '@/api'

/**
 * 「我的登入紀錄」表格欄位。formatTime 由 view 傳入，維持時間格式化單一來源。
 */
export function createMyLoginColumns(
  formatTime: (iso: string) => string,
): DataTableColumns<LoginRecordItem> {
  return [
    {
      title: '登入時間',
      key: 'created_at',
      width: 180,
      render: (row) => formatTime(row.created_at),
    },
    { title: 'IP 位址', key: 'ip_address', width: 140 },
    {
      title: '結果',
      key: 'success',
      width: 80,
      render: (row) =>
        h(
          NTag,
          { size: 'small', type: row.success ? 'success' : 'error', bordered: false },
          () => (row.success ? '成功' : '失敗'),
        ),
    },
    {
      title: '失敗原因',
      key: 'failure_reason',
      render: (row) => row.failure_reason || '-',
    },
    {
      title: 'User Agent',
      key: 'user_agent',
      ellipsis: { tooltip: true },
      render: (row) => row.user_agent || '-',
    },
  ]
}

/**
 * 「所有使用者登入紀錄」表格欄位（管理員）：在「我的」欄位前加上使用者欄。
 */
export function createAllLoginColumns(
  formatTime: (iso: string) => string,
): DataTableColumns<LoginRecordItem> {
  return [
    {
      title: '使用者',
      key: 'username',
      width: 120,
      render: (row) => h('strong', row.username),
    },
    ...createMyLoginColumns(formatTime),
  ]
}
