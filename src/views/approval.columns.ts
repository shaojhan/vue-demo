import type { ColDef } from 'ag-grid-community'
import type { ApprovalListItem } from '@/api'

interface ApprovalColumnDeps {
  typeLabels: Record<string, string>
  statusLabels: Record<string, string>
  formatDate: (dateStr: string | null | undefined) => string
}

/** 半透明底色 + 同色邊框的標籤，深淺色主題皆清晰；inline-flex 垂直置中避免 ag-grid 切角。 */
function badge(label: string, rgb: string): string {
  return `<span style="display:inline-flex;align-items:center;line-height:1;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:600;vertical-align:middle;color:rgb(${rgb});background:rgba(${rgb},0.15);border:1px solid rgba(${rgb},0.4);">${label}</span>`
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
        // LEAVE 請假 = 藍；其餘（EXPENSE 費用報銷）= 琥珀
        const rgb = params.value === 'LEAVE' ? '96,165,250' : '245,158,11'
        return badge(label, rgb)
      }
    },
    {
      headerName: '狀態',
      field: 'status',
      width: 110,
      cellRenderer: (params: { value: string }) => {
        const label = statusLabels[params.value] || params.value
        const rgbMap: Record<string, string> = {
          PENDING: '245,158,11',   // 審批中 = 琥珀
          APPROVED: '34,197,94',   // 已核准 = 綠
          REJECTED: '239,68,68',   // 已駁回 = 紅
          CANCELLED: '100,116,139' // 已取消 = 灰
        }
        return badge(label, rgbMap[params.value] || '100,116,139')
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
