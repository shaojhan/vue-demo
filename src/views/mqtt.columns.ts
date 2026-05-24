import type { ColDef } from 'ag-grid-community'
import type { MQTTMessageItem } from '@/api'

const payloadCellStyle = {
  'font-family': 'monospace',
  'font-size': '13px',
  'white-space': 'pre-wrap',
  'line-height': '1.5',
  'padding-top': '8px',
  'padding-bottom': '8px',
}

/**
 * MQTT 訊息列表的 ag-grid 欄位定義。
 * formatTime 由 view 傳入，維持時間格式化單一來源。
 */
export function createMqttColumns(
  formatTime: (dateStr: string) => string,
): ColDef<MQTTMessageItem>[] {
  return [
    { headerName: '主題', field: 'topic', flex: 2, minWidth: 150 },
    {
      headerName: '訊息內容',
      field: 'payload',
      flex: 3,
      minWidth: 200,
      autoHeight: true,
      wrapText: true,
      cellStyle: payloadCellStyle,
    },
    { headerName: 'QoS', field: 'qos', width: 80 },
    {
      headerName: '接收時間',
      field: 'received_at',
      flex: 1.5,
      minWidth: 160,
      valueFormatter: (params) => (params.value ? formatTime(params.value) : ''),
    },
  ]
}
