import { describe, it, expect } from 'vitest'
import { isAllowedRedirectUrl } from '../utils/urlValidation'

describe('isAllowedRedirectUrl', () => {
  it('同源路徑應允許', () => {
    expect(isAllowedRedirectUrl('/dashboard')).toBe(true)
    expect(isAllowedRedirectUrl('/login?next=/home')).toBe(true)
  })

  it('允許白名單中的 HTTPS 外部網域', () => {
    expect(isAllowedRedirectUrl('https://accounts.google.com/o/oauth2/auth')).toBe(true)
    expect(isAllowedRedirectUrl('https://oauth2.googleapis.com/token')).toBe(true)
  })

  it('拒絕非白名單的外部網域', () => {
    expect(isAllowedRedirectUrl('https://evil.com')).toBe(false)
    expect(isAllowedRedirectUrl('https://malicious.example.com')).toBe(false)
  })

  it('拒絕外部 HTTP 網址（非 HTTPS）', () => {
    expect(isAllowedRedirectUrl('http://accounts.google.com')).toBe(false)
  })

  it('拒絕 javascript: 協議（XSS 風險）', () => {
    // javascript: 不是 HTTPS，且不屬於同源，應被拒絕
    expect(isAllowedRedirectUrl('javascript:alert(1)')).toBe(false)
  })
})
