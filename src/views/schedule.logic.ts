/** 建立/編輯排程表單驗證；通過回 null，否則回錯誤訊息。 */
export function validateScheduleForm(form: {
  title: string
  startTime: number | null
  endTime: number | null
}): string | null {
  if (!form.title.trim()) return '請輸入標題'
  if (!form.startTime || !form.endTime) return '請選擇開始和結束時間'
  return null
}
