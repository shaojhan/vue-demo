/** 收件人搜尋條件：至少 2 個字元才查詢。 */
export function shouldSearchRecipient(keyword: string | null | undefined): boolean {
  return !!keyword && keyword.length >= 2
}

/** 寄信表單驗證（收件人、主旨、內容皆必填）；通過回 null，否則回錯誤訊息。 */
export function validateComposeForm(form: {
  recipientId: string | null | undefined
  subject: string
  content: string
}): string | null {
  if (!form.recipientId || !form.subject.trim() || !form.content.trim()) {
    return '請填寫所有欄位'
  }
  return null
}
