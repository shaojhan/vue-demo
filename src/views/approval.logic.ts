import type { ApprovalRequestResponse, ApprovalStepResponse } from '@/api'
import { ApprovalStatus } from '@/api/models/ApprovalStatus'
import { ApprovalType } from '@/api/models/ApprovalType'

/** 簽核類型 label 對照。 */
export const typeLabels: Record<string, string> = {
  LEAVE: '請假',
  EXPENSE: '費用報銷',
}

/** 簽核狀態 label 對照。 */
export const statusLabels: Record<string, string> = {
  PENDING: '審批中',
  APPROVED: '已核准',
  REJECTED: '已駁回',
  CANCELLED: '已取消',
}

/** 假別 label 對照。 */
export const leaveTypeLabels: Record<string, string> = {
  ANNUAL: '特休',
  SICK: '病假',
  PERSONAL: '事假',
  OTHER: '其他',
}

type StepStatusType = 'default' | 'success' | 'warning' | 'error'

const stepStatusTypeMap: Record<string, StepStatusType> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
}

/** 判斷當前用戶是否為這筆申請當前步驟的待審批人。 */
export function isCurrentApprover(
  detail: ApprovalRequestResponse,
  currentUserId: string | undefined,
): boolean {
  if (detail.status !== ApprovalStatus.PENDING) return false
  const currentStep = detail.steps.find((s) => s.step_order === detail.current_step_order)
  return currentStep?.approver_id === currentUserId && currentStep?.status === ApprovalStatus.PENDING
}

/** 判斷這筆申請是否為當前用戶所提。 */
export function isMyRequest(
  detail: ApprovalRequestResponse,
  currentUserId: string | undefined,
): boolean {
  return detail.requester_id === currentUserId
}

/** 請假表單驗證；通過回 null，否則回錯誤訊息。 */
export function validateLeaveForm(form: {
  startDate: number | null
  endDate: number | null
  reason: string
}): string | null {
  if (!form.startDate || !form.endDate) return '請選擇請假日期'
  if (!form.reason.trim()) return '請輸入請假原因'
  return null
}

/** 費用報銷表單驗證；通過回 null，否則回錯誤訊息。 */
export function validateExpenseForm(form: {
  amount: number | null
  category: string
  description: string
}): string | null {
  if (!form.amount || form.amount <= 0) return '請輸入有效金額'
  if (!form.category.trim()) return '請輸入費用類別'
  if (!form.description.trim()) return '請輸入費用說明'
  return null
}

export interface DetailItem {
  label: string
  value: string
}

/** 依申請類型把 detail 解析成詳情 Modal 顯示用的條目。 */
export function getDetailInfo(detail: ApprovalRequestResponse): { items: DetailItem[] } {
  if (detail.type === ApprovalType.LEAVE) {
    const d = detail.detail as {
      leave_type?: string
      start_date?: string
      end_date?: string
      reason?: string
    }
    return {
      items: [
        { label: '假別', value: leaveTypeLabels[d.leave_type || ''] || d.leave_type || '-' },
        { label: '開始日期', value: d.start_date || '-' },
        { label: '結束日期', value: d.end_date || '-' },
        { label: '原因', value: d.reason || '-' },
      ],
    }
  }
  const d = detail.detail as {
    amount?: number
    category?: string
    description?: string
    receipt_url?: string
  }
  return {
    items: [
      { label: '金額', value: d.amount != null ? `$${d.amount.toLocaleString()}` : '-' },
      { label: '類別', value: d.category || '-' },
      { label: '說明', value: d.description || '-' },
      { label: '收據連結', value: d.receipt_url || '-' },
    ],
  }
}

/** 步驟狀態 label。 */
export function getStepStatusLabel(step: ApprovalStepResponse): string {
  return statusLabels[step.status] || step.status
}

/** 步驟狀態對應的 NTag type。 */
export function getStepStatusType(step: ApprovalStepResponse): StepStatusType {
  return stepStatusTypeMap[step.status] || 'default'
}
