import { Department } from '@/api'

/** 部門代碼對中文名稱。單一來源，供員工管理與審批鏈共用。 */
export const departmentLabels: Record<Department, string> = {
  [Department.HR]: '人力資源部',
  [Department.IT]: '資訊科技部',
  [Department.PR]: '公關部',
  [Department.RD]: '研發部',
  [Department.BD]: '業務部',
}
