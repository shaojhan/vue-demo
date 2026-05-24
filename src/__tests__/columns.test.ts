import { describe, it, expect } from 'vitest'
import type { ColDef } from 'ag-grid-community'
import { createKafkaColumns } from '@/views/kafka.columns'
import { createMqttColumns } from '@/views/mqtt.columns'
import { createMyLoginColumns, createAllLoginColumns } from '@/views/loginRecords.columns'
import type { LoginRecordItem } from '@/api'

const stubFormat = (s: string) => `T(${s})`

// 由 headerName 取出指定欄位的 valueFormatter 並以 value 呼叫
function formatValue(cols: ColDef[], headerName: string, value: unknown): string {
  const col = cols.find((c) => c.headerName === headerName)
  if (!col?.valueFormatter || typeof col.valueFormatter !== 'function') {
    throw new Error(`no valueFormatter for ${headerName}`)
  }
  return col.valueFormatter({ value } as never) as string
}

describe('createKafkaColumns', () => {
  const cols = createKafkaColumns(stubFormat)

  it('包含主題/Key/訊息內容/Partition/Offset/接收時間', () => {
    expect(cols.map((c) => c.headerName)).toEqual([
      '主題', 'Key', '訊息內容', 'Partition', 'Offset', '接收時間',
    ])
  })

  it('接收時間有值時走 formatTime、無值回空字串', () => {
    expect(formatValue(cols, '接收時間', '2026-05-24')).toBe('T(2026-05-24)')
    expect(formatValue(cols, '接收時間', null)).toBe('')
  })
})

describe('createMqttColumns', () => {
  const cols = createMqttColumns(stubFormat)

  it('包含主題/訊息內容/QoS/接收時間', () => {
    expect(cols.map((c) => c.headerName)).toEqual(['主題', '訊息內容', 'QoS', '接收時間'])
  })

  it('接收時間格式化', () => {
    expect(formatValue(cols, '接收時間', '2026-05-24')).toBe('T(2026-05-24)')
    expect(formatValue(cols, '接收時間', '')).toBe('')
  })
})

describe('login records 欄位', () => {
  const cols = createMyLoginColumns(stubFormat)
  type RenderCol = { key: string; render: (r: LoginRecordItem) => unknown }
  const renderOf = (key: string) =>
    (cols.find((c) => (c as RenderCol).key === key) as unknown as RenderCol).render
  const row = (o: Record<string, unknown>) => o as unknown as LoginRecordItem

  it('登入時間 render 走 formatTime', () => {
    expect(renderOf('created_at')(row({ created_at: '2026-05-24' }))).toBe('T(2026-05-24)')
  })

  it('失敗原因/User Agent 空值回退 -', () => {
    expect(renderOf('failure_reason')(row({ failure_reason: null }))).toBe('-')
    expect(renderOf('user_agent')(row({ user_agent: null }))).toBe('-')
    expect(renderOf('failure_reason')(row({ failure_reason: '密碼錯誤' }))).toBe('密碼錯誤')
  })

  it('all 欄位在 my 欄位前加上「使用者」', () => {
    const all = createAllLoginColumns(stubFormat)
    expect(all.length).toBe(cols.length + 1)
    expect((all[0] as unknown as RenderCol).key).toBe('username')
  })
})
