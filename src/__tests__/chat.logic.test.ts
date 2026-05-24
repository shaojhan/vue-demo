import { describe, it, expect } from 'vitest'
import {
  getToolLabel,
  shouldSendOnEnter,
  scheduleToolLabels,
  approvalToolLabels,
} from '@/views/chat.logic'

describe('getToolLabel', () => {
  it('已知工具轉中文', () => {
    expect(getToolLabel(scheduleToolLabels, 'create_schedule')).toBe('建立排程')
    expect(getToolLabel(approvalToolLabels, 'approve_request')).toBe('批准申請')
  })
  it('未知工具回退原名', () => {
    expect(getToolLabel(scheduleToolLabels, 'unknown_tool')).toBe('unknown_tool')
  })
})

describe('shouldSendOnEnter', () => {
  it('Enter 且未按 Shift → true', () => {
    expect(shouldSendOnEnter({ key: 'Enter', shiftKey: false })).toBe(true)
  })
  it('Shift+Enter → false（換行）', () => {
    expect(shouldSendOnEnter({ key: 'Enter', shiftKey: true })).toBe(false)
  })
  it('其他鍵 → false', () => {
    expect(shouldSendOnEnter({ key: 'a', shiftKey: false })).toBe(false)
  })
})
