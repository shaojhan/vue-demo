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
  getApproverDisplay,
  isActiveStep,
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

describe('getApproverDisplay', () => {
  const base = { step_order: 1, approver_id: 'b3d65aa3-9c2e-4c32-bcb0-85fed366fdcb', status: ApprovalStatus.PENDING }

  it('完整：姓名 + 部門中文 · 角色', () => {
    const r = getApproverDisplay({ ...base, approver_name: '王小明', approver_department: 'RD', approver_role_name: '經理' } as ApprovalStepResponse)
    expect(r).toEqual({ name: '王小明', title: '研發部 · 經理' })
  })

  it('缺姓名：以 approver_id 前 8 碼 fallback', () => {
    const r = getApproverDisplay({ ...base, approver_department: 'HR', approver_role_name: '專員' } as ApprovalStepResponse)
    expect(r.name).toBe('審批人 b3d65aa3')
    expect(r.title).toBe('人力資源部 · 專員')
  })

  it('缺部門：title 只含角色', () => {
    const r = getApproverDisplay({ ...base, approver_name: '李四', approver_role_name: '組長' } as ApprovalStepResponse)
    expect(r.title).toBe('組長')
  })

  it('缺角色：title 只含部門中文', () => {
    const r = getApproverDisplay({ ...base, approver_name: '李四', approver_department: 'IT' } as ApprovalStepResponse)
    expect(r.title).toBe('資訊科技部')
  })

  it('職位皆缺：title 為空字串', () => {
    const r = getApproverDisplay({ ...base, approver_name: '李四' } as ApprovalStepResponse)
    expect(r.title).toBe('')
  })

  it('未知部門代碼：退回原代碼', () => {
    const r = getApproverDisplay({ ...base, approver_name: '李四', approver_department: 'XX' } as unknown as ApprovalStepResponse)
    expect(r.title).toBe('XX')
  })
})

describe('isActiveStep', () => {
  const step1 = { step_order: 1, approver_id: 'a1', status: ApprovalStatus.PENDING } as ApprovalStepResponse
  it('PENDING 申請 + 當前步驟 + 步驟 PENDING → true', () => {
    expect(isActiveStep(makeDetail({ current_step_order: 1, steps: [step1] }), step1)).toBe(true)
  })
  it('申請非 PENDING → false', () => {
    expect(isActiveStep(makeDetail({ status: ApprovalStatus.APPROVED, current_step_order: 1 }), step1)).toBe(false)
  })
  it('非當前步驟 → false', () => {
    expect(isActiveStep(makeDetail({ current_step_order: 2 }), step1)).toBe(false)
  })
  it('步驟已決議 → false', () => {
    const done = { ...step1, status: ApprovalStatus.APPROVED } as ApprovalStepResponse
    expect(isActiveStep(makeDetail({ current_step_order: 1 }), done)).toBe(false)
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
