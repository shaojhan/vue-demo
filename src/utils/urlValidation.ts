/**
 * 驗證 redirect URL 是否屬於允許的網域
 * 防止 Open Redirect 攻擊
 */

const ALLOWED_REDIRECT_HOSTS: string[] = [
  'accounts.google.com',
  'oauth2.googleapis.com',
]

/**
 * 檢查 URL 是否為允許的外部 redirect 目標
 * - 僅允許 HTTPS 協議
 * - 僅允許白名單中的網域
 * - 同源 URL 一律允許
 */
export function isAllowedRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin)

    // 同源 URL 一律允許
    if (parsed.origin === window.location.origin) {
      return true
    }

    // 外部 URL 必須使用 HTTPS
    if (parsed.protocol !== 'https:') {
      return false
    }

    // 檢查是否在白名單中
    return ALLOWED_REDIRECT_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith('.' + host)
    )
  } catch {
    return false
  }
}
