import type { ColDef } from 'ag-grid-community'
import type { ScheduleListItem } from '@/api'

/**
 * 排程列表的 ag-grid 欄位定義。formatDateTime 由 view 傳入，
 * 讓時間格式化邏輯維持單一來源（詳情 Modal 也用同一函式）。
 */
export function createScheduleColumns(
  formatDateTime: (dateStr: string) => string
): ColDef<ScheduleListItem>[] {
  return [
    { headerName: '標題', field: 'title', flex: 2, minWidth: 120 },
    { headerName: '地點', field: 'location', flex: 1, minWidth: 100 },
    {
      headerName: '開始時間',
      field: 'start_time',
      flex: 1.5,
      minWidth: 150,
      valueFormatter: (params) => params.value ? formatDateTime(params.value) : ''
    },
    {
      headerName: '結束時間',
      field: 'end_time',
      flex: 1.5,
      minWidth: 150,
      valueFormatter: (params) => params.value ? formatDateTime(params.value) : ''
    },
    {
      headerName: '全天',
      field: 'all_day',
      width: 80,
      valueFormatter: (params) => params.value ? '是' : '否'
    },
    {
      headerName: '建立者',
      valueGetter: (params) => params.data?.creator?.username || '',
      flex: 1,
      minWidth: 80
    },
    {
      headerName: '同步狀態',
      field: 'is_synced',
      width: 110,
      cellRenderer: (params: { value: boolean }) => {
        const synced = params.value
        const color = synced ? 'var(--color-success)' : 'var(--color-warning)'
        const bg = synced ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)'
        const border = synced ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'
        const text = synced ? '已同步' : '未同步'
        return `<span style="display:inline-flex;align-items:center;line-height:1;padding:3px 10px;border-radius:6px;font-size:12px;font-weight:600;color:${color};background:${bg};border:1px solid ${border};vertical-align:middle;">${text}</span>`
      }
    }
  ]
}
