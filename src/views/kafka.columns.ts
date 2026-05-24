import type { ColDef } from 'ag-grid-community'
import type { KafkaMessageItem } from '@/api'

const payloadCellStyle = {
  'font-family': 'monospace',
  'font-size': '13px',
  'white-space': 'pre-wrap',
  'line-height': '1.5',
  'padding-top': '8px',
  'padding-bottom': '8px',
}

/**
 * Kafka 訊息列表的 ag-grid 欄位定義。
 * formatTime 由 view 傳入，維持時間格式化單一來源。
 */
export function createKafkaColumns(
  formatTime: (dateStr: string) => string,
): ColDef<KafkaMessageItem>[] {
  return [
    { headerName: '主題', field: 'topic', flex: 2, minWidth: 150 },
    { headerName: 'Key', field: 'key', flex: 1, minWidth: 100 },
    {
      headerName: '訊息內容',
      field: 'value',
      flex: 3,
      minWidth: 200,
      autoHeight: true,
      wrapText: true,
      cellStyle: payloadCellStyle,
    },
    { headerName: 'Partition', field: 'partition', width: 100 },
    { headerName: 'Offset', field: 'offset', width: 100 },
    {
      headerName: '接收時間',
      field: 'received_at',
      flex: 1.5,
      minWidth: 160,
      valueFormatter: (params) => (params.value ? formatTime(params.value) : ''),
    },
  ]
}
