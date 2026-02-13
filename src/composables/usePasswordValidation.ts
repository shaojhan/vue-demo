export function validatePassword(password: string, confirmPassword: string): string | null {
  if (password !== confirmPassword) {
    return '兩次輸入的密碼不一致'
  }
  if (password.length < 6) {
    return '密碼長度至少需要 6 個字元'
  }
  return null
}
