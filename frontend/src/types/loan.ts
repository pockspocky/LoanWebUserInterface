// 贷款类型
export type LoanType = 'house' | 'car' | 'consumer' | 'business' | 'other'

// 贷款银行
export type BankType = 'ICBC' | 'CCB' | 'ABC' | 'BOC' | 'BOCOM' | 'other'

// 还款方式
export type RepaymentMethodType = 'equalPayment' | 'equalPrincipal'

// 贷款状态
export type LoanStatus = 'processing' | 'completed'

// 还款状态
export type PaymentStatus = 'overdue' | 'pending' | 'paid'

// 还款记录
export interface Payment {
  month: number
  paidAmount: number
  status: PaymentStatus
}

// 贷款记录
export interface LoanRecord {
  loanId: string
  payments: Payment[]
  createdAt: string
  updatedAt: string
}

// 贷款申请请求
export interface LoanRequest {
  name: string
  amount: number
  monthlyInterestRate: number
  term: number
  type: LoanType
  customType?: string
  bank: BankType
  customBank?: string
  repaymentMethod: RepaymentMethodType
  customRepaymentMethod?: string
}

// 贷款信息
export interface Loan {
  _id: string
  userId: string
  name: string
  amount: number
  monthlyInterestRate: number
  term: number
  totalRepayment: number
  monthlyRepayment: number
  repaidAmount: number
  type: LoanType
  customType?: string
  bank: BankType
  customBank?: string
  repaymentMethod: RepaymentMethodType
  customRepaymentMethod?: string
  status: LoanStatus
  createdAt: string
  updatedAt: string
}

// 审核历史记录
export interface ReviewHistory {
  status: LoanStatus
  comment: string
  reviewerId: string
  createdAt: string
}

// 贷款详情
export interface LoanDetail extends Loan {
  reviewHistory: ReviewHistory[]
}

// 贷款详情响应
export interface LoanDetailResponse {
  loan: Loan
  record: LoanRecord
}

// 贷款列表响应
export interface LoanListResponse {
  loans: Loan[]
}

// 贷款类型选项
export const loanTypeOptions = [
  { value: 'house', label: '房贷' },
  { value: 'car', label: '车贷' },
  { value: 'consumer', label: '消费贷' },
  { value: 'business', label: '经营贷' },
  { value: 'other', label: '其他' }
] as const

// 银行选项
export const bankOptions = [
  { value: 'ICBC', label: '工商银行' },
  { value: 'CCB', label: '建设银行' },
  { value: 'ABC', label: '农业银行' },
  { value: 'BOC', label: '中国银行' },
  { value: 'BOCOM', label: '交通银行' },
  { value: 'other', label: '其他银行' }
] as const

// 还款方式选项
export const repaymentMethodOptions = [
  { value: 'equalPayment', label: '等额本息' },
  { value: 'equalPrincipal', label: '等额本金' }
] as const

// 贷款状态选项
export const loanStatusOptions = [
  { value: 'processing', label: '处理中' },
  { value: 'completed', label: '已完成' }
] as const

// 还款状态选项
export const paymentStatusOptions = [
  { value: 'overdue', label: '逾期' },
  { value: 'pending', label: '待还' },
  { value: 'paid', label: '已还' }
] as const

// 还款状态标签类型
export const paymentStatusTypes: Record<PaymentStatus, 'error' | 'warning' | 'success'> = {
  overdue: 'error',
  pending: 'warning',
  paid: 'success'
} 