import { describe, it, expect } from 'vitest'
import { shouldSearchRecipient, validateComposeForm } from '@/views/messages.logic'

describe('shouldSearchRecipient', () => {
  it('長度 >= 2 才查詢', () => {
    expect(shouldSearchRecipient('ab')).toBe(true)
    expect(shouldSearchRecipient('abc')).toBe(true)
  })
  it('空值或少於 2 字不查詢', () => {
    expect(shouldSearchRecipient('')).toBe(false)
    expect(shouldSearchRecipient('a')).toBe(false)
    expect(shouldSearchRecipient(null)).toBe(false)
    expect(shouldSearchRecipient(undefined)).toBe(false)
  })
})

describe('validateComposeForm', () => {
  it('任一欄位缺漏回錯誤', () => {
    expect(validateComposeForm({ recipientId: null, subject: '主旨', content: '內容' })).toBe('請填寫所有欄位')
    expect(validateComposeForm({ recipientId: 'u1', subject: '  ', content: '內容' })).toBe('請填寫所有欄位')
    expect(validateComposeForm({ recipientId: 'u1', subject: '主旨', content: '   ' })).toBe('請填寫所有欄位')
  })
  it('全部填寫回 null', () => {
    expect(validateComposeForm({ recipientId: 'u1', subject: '主旨', content: '內容' })).toBeNull()
  })
})
