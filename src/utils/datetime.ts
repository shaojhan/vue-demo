/**
 * 共用日期/時間格式化。
 *
 * 取代散落在各 view 的內嵌實作，分兩類：
 * - formatDateTime：完整時間，精度由 options 決定（預設為瀏覽器 locale 完整字串，含秒）。
 * - formatRelativeTime：相對時間（今天 HH:mm / 昨天 / N 天前 / 日期）。
 */

/** 年月日時分（不含秒）。ApprovalPage、SchedulePage 使用。 */
export const DATETIME_MINUTE: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
}

/** 年月日時分秒。LoginRecordsPage 使用。 */
export const DATETIME_SECOND: Intl.DateTimeFormatOptions = {
  ...DATETIME_MINUTE,
  second: '2-digit',
}

/**
 * 完整日期時間字串。空值回傳 '-'。
 * 不傳 options 時等同 `toLocaleString('zh-TW')`（含秒），對應 Kafka/Mqtt 既有行為。
 */
export function formatDateTime(
  dateStr: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-TW', options)
}

/**
 * 相對時間：今天顯示 HH:mm、昨天顯示「昨天」、7 天內顯示「N 天前」、其餘顯示日期。
 * 空值回傳 ''。供 Messages / Chat / HrChat 共用。
 */
export function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (days === 0) return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return '昨天'
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString('zh-TW')
}
