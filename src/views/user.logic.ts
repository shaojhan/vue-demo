/** 允許的頭像檔案型別。 */
export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

/** 頭像檔案大小上限（5MB）。 */
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024

/** 頭像上傳網路錯誤訊息。 */
export const AVATAR_NETWORK_ERROR_MESSAGE = '網路連線錯誤，請確認連線狀態'

/** 角色 label 對照。 */
export const roleLabel: Record<string, string> = {
  ADMIN: '管理員',
  EMPLOYEE: '員工',
  NORMAL: '一般用戶',
}

/** 從各種格式的 avatar 值中提取純檔名。 */
export function getAvatarFilename(avatar: string): string | null {
  if (avatar.startsWith('/api/users/avatar/')) {
    return avatar.slice('/api/users/avatar/'.length) || null
  }
  // MinIO 直連 URL 或其他路徑：取最後一段
  return avatar.split('/').pop() || null
}

/**
 * 計算完整頭像 URL。外部 URL（OAuth 頭像）直接使用；
 * 其餘統一走 /api/users/avatar 端點並附加 cache-busting。空值回 null。
 */
export function resolveAvatarUrl(
  avatar: string | null | undefined,
  cacheKey: number | string,
): string | null {
  if (!avatar) return null
  if (avatar.startsWith('http') && !avatar.includes('localhost:9000/')) {
    return avatar
  }
  const filename = getAvatarFilename(avatar)
  if (!filename) return null
  return `/api/users/avatar/${filename}?t=${cacheKey}`
}

/** 角色對應的 NTag type。 */
export function roleTagType(role: string | null | undefined): 'warning' | 'info' | 'default' {
  if (role === 'ADMIN') return 'warning'
  if (role === 'EMPLOYEE') return 'info'
  return 'default'
}

/** 頭像檔案驗證（型別 + 大小）；通過回 null，否則回錯誤訊息。 */
export function validateAvatarFile(file: { type: string; size: number }): string | null {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return '不支援的檔案格式，請上傳 jpg, png, gif 或 webp 格式'
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return '檔案大小超過 5MB 限制'
  }
  return null
}

/** 頭像上傳 API 錯誤訊息：有 detail 時帶出，否則回退含 status 的通用訊息。 */
export function avatarUploadErrorMessage(status: number, detail: string | null): string {
  return detail
    ? `上傳失敗：${detail}`
    : `上傳失敗（錯誤 ${status}），請稍後再試`
}
