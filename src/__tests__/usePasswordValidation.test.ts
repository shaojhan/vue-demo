import { describe, it, expect } from 'vitest'
import { validatePassword } from '../composables/usePasswordValidation'

describe('validatePassword', () => {
  it('密碼相同且長度足夠時應返回 null', () => {
    expect(validatePassword('password123', 'password123')).toBeNull()
  })

  it('兩次密碼不一致時應返回錯誤訊息', () => {
    expect(validatePassword('abc123', 'abc456')).toBe('兩次輸入的密碼不一致')
  })

  it('密碼長度不足 6 字元時應返回錯誤訊息', () => {
    expect(validatePassword('abc', 'abc')).toBe('密碼長度至少需要 6 個字元')
  })

  it('密碼剛好 6 字元時應通過', () => {
    expect(validatePassword('abcdef', 'abcdef')).toBeNull()
  })
})
