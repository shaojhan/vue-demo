import { describe, it, expect } from 'vitest'
import { validateScheduleForm } from '@/views/schedule.logic'

describe('validateScheduleForm', () => {
  it('缺標題（含純空白）回錯誤', () => {
    expect(validateScheduleForm({ title: '   ', startTime: 1, endTime: 2 })).toBe('請輸入標題')
  })
  it('缺開始或結束時間回錯誤', () => {
    expect(validateScheduleForm({ title: '會議', startTime: null, endTime: 2 })).toBe('請選擇開始和結束時間')
    expect(validateScheduleForm({ title: '會議', startTime: 1, endTime: null })).toBe('請選擇開始和結束時間')
  })
  it('完整填寫回 null', () => {
    expect(validateScheduleForm({ title: '會議', startTime: 1, endTime: 2 })).toBeNull()
  })
})
