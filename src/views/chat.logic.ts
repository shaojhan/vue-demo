/** ChatPage（排程助手）工具名稱對照。 */
export const scheduleToolLabels: Record<string, string> = {
  create_schedule: '建立排程',
  update_schedule: '更新排程',
  delete_schedule: '刪除排程',
  list_schedules: '查詢排程',
}

/** HrChatPage（簽核助手）工具名稱對照。 */
export const approvalToolLabels: Record<string, string> = {
  approve_request: '批准申請',
  reject_request: '拒絕申請',
  list_approvals: '查詢簽核',
  get_approval_detail: '查看詳情',
  list_pending: '查詢待審',
}

/** 工具名稱 → 中文 label，找不到時回退原名。 */
export function getToolLabel(labels: Record<string, string>, tool: string): string {
  return labels[tool] || tool
}

/** 是否應在此 keydown 觸發送出：Enter 且未按 Shift。 */
export function shouldSendOnEnter(e: Pick<KeyboardEvent, 'key' | 'shiftKey'>): boolean {
  return e.key === 'Enter' && !e.shiftKey
}
