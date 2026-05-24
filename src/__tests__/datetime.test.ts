import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDateTime,
  formatRelativeTime,
  DATETIME_MINUTE,
  DATETIME_SECOND,
} from '../utils/datetime'

describe('formatDateTime', () => {
  it('空值（null/undefined/空字串）回傳 -', () => {
    expect(formatDateTime(null)).toBe('-')
    expect(formatDateTime(undefined)).toBe('-')
    expect(formatDateTime('')).toBe('-')
  })

  it('分鐘精度含年月日時分、不含秒', () => {
    const out = formatDateTime('2026-05-24T13:45:30', DATETIME_MINUTE)
    expect(out).toContain('2026')
    expect(out).toContain('45') // 分
    expect(out).not.toMatch(/45[:：]30/) // 不應帶秒
  })

  it('秒精度含秒', () => {
    const out = formatDateTime('2026-05-24T13:45:30', DATETIME_SECOND)
    expect(out).toMatch(/45[:：]30/)
  })

  it('合法日期回傳非空字串', () => {
    expect(formatDateTime('2026-05-24T00:00:00').length).toBeGreaterThan(0)
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 固定「現在」為 2026-05-24 12:00
    vi.setSystemTime(new Date('2026-05-24T12:00:00'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('空值回傳空字串', () => {
    expect(formatRelativeTime(null)).toBe('')
    expect(formatRelativeTime(undefined)).toBe('')
    expect(formatRelativeTime('')).toBe('')
  })

  it('今天顯示 HH:mm（不含昨天/天前字樣）', () => {
    const out = formatRelativeTime('2026-05-24T09:30:00')
    expect(out).not.toBe('昨天')
    expect(out).not.toContain('天前')
    expect(out).toContain('09')
  })

  it('昨天顯示「昨天」', () => {
    expect(formatRelativeTime('2026-05-23T09:00:00')).toBe('昨天')
  })

  it('2~6 天前顯示「N 天前」', () => {
    expect(formatRelativeTime('2026-05-21T12:00:00')).toBe('3 天前')
    expect(formatRelativeTime('2026-05-18T12:00:00')).toBe('6 天前')
  })

  it('滿 7 天改顯示日期（非「N 天前」）', () => {
    const out = formatRelativeTime('2026-05-17T12:00:00')
    expect(out).not.toContain('天前')
    expect(out).toContain('2026')
  })
})
