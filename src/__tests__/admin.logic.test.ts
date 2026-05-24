import { describe, it, expect } from 'vitest'
import {
  assignEmployeeErrorMessage,
  csvUploadErrorMessage,
  csvTaskStatusTagType,
  csvProgressPercent,
  csvTaskStatusLabel,
} from '@/views/admin.logic'

describe('assignEmployeeErrorMessage', () => {
  it('對應各 status', () => {
    expect(assignEmployeeErrorMessage(403)).toBe('您沒有管理員權限')
    expect(assignEmployeeErrorMessage(404)).toBe('找不到該使用者')
    expect(assignEmployeeErrorMessage(409)).toBe('該使用者已為員工')
    expect(assignEmployeeErrorMessage(422)).toBe('輸入資料格式有誤')
  })
  it('未知 status 回通用訊息', () => {
    expect(assignEmployeeErrorMessage(500)).toBe('操作失敗，請稍後再試')
  })
})

describe('csvUploadErrorMessage', () => {
  it('對應 403/422 與通用', () => {
    expect(csvUploadErrorMessage(403)).toBe('您沒有管理員權限')
    expect(csvUploadErrorMessage(422)).toBe('CSV 格式錯誤，請檢查檔案內容')
    expect(csvUploadErrorMessage(500)).toBe('上傳失敗，請稍後再試')
  })
})

describe('csvTaskStatusTagType', () => {
  it('對應 NTag type', () => {
    expect(csvTaskStatusTagType('SUCCESS')).toBe('success')
    expect(csvTaskStatusTagType('FAILURE')).toBe('error')
    expect(csvTaskStatusTagType('REVOKED')).toBe('warning')
    expect(csvTaskStatusTagType('PROGRESS')).toBe('info')
    expect(csvTaskStatusTagType('PENDING')).toBe('info')
  })
})

describe('csvProgressPercent', () => {
  it('四捨五入、空值視為 0', () => {
    expect(csvProgressPercent({ percent: 49.6 })).toBe(50)
    expect(csvProgressPercent({ percent: null })).toBe(0)
    expect(csvProgressPercent(null)).toBe(0)
    expect(csvProgressPercent(undefined)).toBe(0)
  })
})

describe('csvTaskStatusLabel', () => {
  it('含主要狀態', () => {
    expect(csvTaskStatusLabel.SUCCESS).toBe('完成')
    expect(csvTaskStatusLabel.FAILURE).toBe('失敗')
    expect(csvTaskStatusLabel.PROGRESS).toBe('處理中')
  })
})
