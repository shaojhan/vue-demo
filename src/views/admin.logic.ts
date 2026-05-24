/** 網路（非 API）錯誤共用訊息。 */
export const NETWORK_ERROR_MESSAGE = '網路連線錯誤，請檢查網路狀態'

/** 指派員工 API 錯誤碼 → 使用者訊息。 */
export function assignEmployeeErrorMessage(status: number): string {
  switch (status) {
    case 403:
      return '您沒有管理員權限'
    case 404:
      return '找不到該使用者'
    case 409:
      return '該使用者已為員工'
    case 422:
      return '輸入資料格式有誤'
    default:
      return '操作失敗，請稍後再試'
  }
}

/** CSV 上傳 API 錯誤碼 → 使用者訊息。 */
export function csvUploadErrorMessage(status: number): string {
  switch (status) {
    case 403:
      return '您沒有管理員權限'
    case 422:
      return 'CSV 格式錯誤，請檢查檔案內容'
    default:
      return '上傳失敗，請稍後再試'
  }
}

/** CSV 任務狀態 label 對照。 */
export const csvTaskStatusLabel: Record<string, string> = {
  PENDING: '排隊中',
  STARTED: '處理中',
  PROGRESS: '處理中',
  SUCCESS: '完成',
  FAILURE: '失敗',
  REVOKED: '已取消',
}

type TaskTagType = 'success' | 'error' | 'warning' | 'info'

/** CSV 任務狀態對應的 NTag type。 */
export function csvTaskStatusTagType(status: string): TaskTagType {
  if (status === 'SUCCESS') return 'success'
  if (status === 'FAILURE') return 'error'
  if (status === 'REVOKED') return 'warning'
  return 'info'
}

/** 進度百分比四捨五入（空值視為 0）。 */
export function csvProgressPercent(progress: { percent?: number | null } | null | undefined): number {
  return Math.round(progress?.percent ?? 0)
}
