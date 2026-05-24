import type { ColDef } from 'ag-grid-community'
import type { ApprovalListItem } from '@/api'

interface ApprovalColumnDeps {
  typeLabels: Record<string, string>
  statusLabels: Record<string, string>
  formatDate: (dateStr: string | null | undefined) => string
}

/**
 * 簽核列表（我的申請 / 待我審批共用）的 ag-grid 欄位定義。
 * label 對照表與日期格式化由 view 傳入，與詳情 Modal 共用單一來源。
 */
export function createApprovalColumns({
  typeLabels,
  statusLabels,
  formatDate,
}: ApprovalColumnDeps): ColDef<ApprovalListItem>[] {
  return [
    {
      headerName: '類型',
      field: 'type',
      width: 110,
      cellRenderer: (params: { value: string }) => {
        const label = typeLabels[params.value] || params.value
        const bg = params.value === 'LEAVE' ? 'var(--color-border)' : '#fef3c7'
        const color = params.value === 'LEAVE' ? 'var(--color-primary-hover)' : '#92400e'
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
          APPROVED: { bg: '#dcfce7', color: 'var(--color-success)' },
          REJECTED: { bg: '#fef2f2', color: 'var(--color-destructive)' },
          CANCELLED: { bg: 'var(--color-muted)', color: 'var(--color-foreground-muted)' }
        }
        const { bg, color } = colorMap[params.value] || { bg: 'var(--color-muted)', color: 'var(--color-foreground-muted)' }
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
}
