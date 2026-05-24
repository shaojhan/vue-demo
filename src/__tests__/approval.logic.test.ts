import { describe, it, expect } from 'vitest'
import type { ApprovalRequestResponse, ApprovalStepResponse } from '@/api'
import { ApprovalStatus } from '@/api/models/ApprovalStatus'
import { ApprovalType } from '@/api/models/ApprovalType'
import {
  isCurrentApprover,
  isMyRequest,
  validateLeaveForm,
  validateExpenseForm,
  getDetailInfo,
  getStepStatusLabel,
  getStepStatusType,
} from '@/views/approval.logic'

function makeDetail(overrides: Partial<ApprovalRequestResponse> = {}): ApprovalRequestResponse {
  return {
    id: 'r1',
    type: ApprovalType.LEAVE,
    status: ApprovalStatus.PENDING,
    requester_id: 'user-1',
    current_step_order: 1,
    steps: [
      { step_order: 1, approver_id: 'approver-1', status: ApprovalStatus.PENDING } as ApprovalStepResponse,
    ],
    detail: {},
    ...overrides,
  } as ApprovalRequestResponse
}

describe('isCurrentApprover', () => {
  it('PENDING 且當前步驟審批人相符且步驟為 PENDING → true', () => {
    expect(isCurrentApprover(makeDetail(), 'approver-1')).toBe(true)
  })

  it('申請非 PENDING → false', () => {
    expect(isCurrentApprover(makeDetail({ status: ApprovalStatus.APPROVED }), 'approver-1')).toBe(false)
  })

  it('審批人不相符 → false', () => {
    expect(isCurrentApprover(makeDetail(), 'someone-else')).toBe(false)
  })

  it('當前步驟狀態非 PENDING → false', () => {
    const detail = makeDetail({
      steps: [{ step_order: 1, approver_id: 'approver-1', status: ApprovalStatus.APPROVED } as ApprovalStepResponse],
    })
    expect(isCurrentApprover(detail, 'approver-1')).toBe(false)
  })

  it('找不到對應 step_order → false', () => {
    expect(isCurrentApprover(makeDetail({ current_step_order: 99 }), 'approver-1')).toBe(false)
  })
})

describe('isMyRequest', () => {
  it('requester_id 相符 → true', () => {
    expect(isMyRequest(makeDetail(), 'user-1')).toBe(true)
  })
  it('不相符或 undefined → false', () => {
    expect(isMyRequest(makeDetail(), 'user-2')).toBe(false)
    expect(isMyRequest(makeDetail(), undefined)).toBe(false)
  })
})

describe('validateLeaveForm', () => {
  it('缺日期回錯誤', () => {
    expect(validateLeaveForm({ startDate: null, endDate: 1, reason: 'x' })).toBe('請選擇請假日期')
    expect(validateLeaveForm({ startDate: 1, endDate: null, reason: 'x' })).toBe('請選擇請假日期')
  })
  it('缺原因（含純空白）回錯誤', () => {
    expect(validateLeaveForm({ startDate: 1, endDate: 2, reason: '   ' })).toBe('請輸入請假原因')
  })
  it('完整填寫回 null', () => {
    expect(validateLeaveForm({ startDate: 1, endDate: 2, reason: '休假' })).toBeNull()
  })
})

describe('validateExpenseForm', () => {
  it('金額無效回錯誤', () => {
    expect(validateExpenseForm({ amount: null, category: 'a', description: 'b' })).toBe('請輸入有效金額')
    expect(validateExpenseForm({ amount: 0, category: 'a', description: 'b' })).toBe('請輸入有效金額')
    expect(validateExpenseForm({ amount: -5, category: 'a', description: 'b' })).toBe('請輸入有效金額')
  })
  it('缺類別回錯誤', () => {
    expect(validateExpenseForm({ amount: 10, category: ' ', description: 'b' })).toBe('請輸入費用類別')
  })
  it('缺說明回錯誤', () => {
    expect(validateExpenseForm({ amount: 10, category: 'a', description: '' })).toBe('請輸入費用說明')
  })
  it('完整填寫回 null', () => {
    expect(validateExpenseForm({ amount: 10, category: 'a', description: 'b' })).toBeNull()
  })
})

describe('getDetailInfo', () => {
  it('LEAVE：假別轉中文 label、缺欄位以 - 補', () => {
    const detail = makeDetail({
      type: ApprovalType.LEAVE,
      detail: { leave_type: 'ANNUAL', start_date: '2026-05-01', reason: '出國' },
    })
    const items = getDetailInfo(detail).items
    expect(items[0]).toEqual({ label: '假別', value: '特休' })
    expect(items[1]).toEqual({ label: '開始日期', value: '2026-05-01' })
    expect(items[2]).toEqual({ label: '結束日期', value: '-' })
    expect(items[3]).toEqual({ label: '原因', value: '出國' })
  })

  it('EXPENSE：金額加 $ 與千分位、缺欄位以 - 補', () => {
    const detail = makeDetail({
      type: ApprovalType.EXPENSE,
      detail: { amount: 12345, category: '差旅' },
    })
    const items = getDetailInfo(detail).items
    expect(items[0]).toEqual({ label: '金額', value: '$12,345' })
    expect(items[1]).toEqual({ label: '類別', value: '差旅' })
    expect(items[2]).toEqual({ label: '說明', value: '-' })
    expect(items[3]).toEqual({ label: '收據連結', value: '-' })
  })
})

describe('getStepStatus*', () => {
  const step = { status: ApprovalStatus.APPROVED } as ApprovalStepResponse
  it('label 轉中文', () => {
    expect(getStepStatusLabel(step)).toBe('已核准')
  })
  it('type 對應 NTag', () => {
    expect(getStepStatusType(step)).toBe('success')
    expect(getStepStatusType({ status: 'UNKNOWN' } as unknown as ApprovalStepResponse)).toBe('default')
  })
})
