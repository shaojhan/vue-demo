import { describe, it, expect } from 'vitest'
import {
  getAvatarFilename,
  resolveAvatarUrl,
  roleTagType,
  validateAvatarFile,
  avatarUploadErrorMessage,
  MAX_AVATAR_SIZE,
} from '@/views/user.logic'

describe('getAvatarFilename', () => {
  it('從 API 端點路徑取檔名', () => {
    expect(getAvatarFilename('/api/users/avatar/abc.png')).toBe('abc.png')
  })
  it('從一般 URL 取最後一段', () => {
    expect(getAvatarFilename('https://minio/bucket/xyz.jpg')).toBe('xyz.jpg')
  })
  it('空字串回 null', () => {
    expect(getAvatarFilename('')).toBeNull()
  })
})

describe('resolveAvatarUrl', () => {
  it('空值回 null', () => {
    expect(resolveAvatarUrl(null, 1)).toBeNull()
    expect(resolveAvatarUrl(undefined, 1)).toBeNull()
  })
  it('外部 http URL 直接使用', () => {
    expect(resolveAvatarUrl('https://oauth.example.com/a.png', 1)).toBe('https://oauth.example.com/a.png')
  })
  it('MinIO 直連（localhost:9000）改走 API 端點並帶 cache key', () => {
    expect(resolveAvatarUrl('http://localhost:9000/bucket/a.png', 123)).toBe('/api/users/avatar/a.png?t=123')
  })
  it('API 路徑改帶 cache key', () => {
    expect(resolveAvatarUrl('/api/users/avatar/a.png', 99)).toBe('/api/users/avatar/a.png?t=99')
  })
})

describe('roleTagType', () => {
  it('對應角色', () => {
    expect(roleTagType('ADMIN')).toBe('warning')
    expect(roleTagType('EMPLOYEE')).toBe('info')
    expect(roleTagType('NORMAL')).toBe('default')
    expect(roleTagType(undefined)).toBe('default')
  })
})

describe('validateAvatarFile', () => {
  it('不支援的型別回錯誤', () => {
    expect(validateAvatarFile({ type: 'application/pdf', size: 100 })).toBe(
      '不支援的檔案格式，請上傳 jpg, png, gif 或 webp 格式',
    )
  })
  it('超過大小上限回錯誤', () => {
    expect(validateAvatarFile({ type: 'image/png', size: MAX_AVATAR_SIZE + 1 })).toBe('檔案大小超過 5MB 限制')
  })
  it('合法檔案回 null（含邊界）', () => {
    expect(validateAvatarFile({ type: 'image/jpeg', size: MAX_AVATAR_SIZE })).toBeNull()
    expect(validateAvatarFile({ type: 'image/webp', size: 1 })).toBeNull()
  })
})

describe('avatarUploadErrorMessage', () => {
  it('有 detail 時帶出', () => {
    expect(avatarUploadErrorMessage(400, '檔案損毀')).toBe('上傳失敗：檔案損毀')
  })
  it('無 detail 回退含 status', () => {
    expect(avatarUploadErrorMessage(500, null)).toBe('上傳失敗（錯誤 500），請稍後再試')
  })
})
