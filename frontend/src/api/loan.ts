import api from '.'
import type { ApiResponse } from '../types/api'
import type {
  LoanRequest,
  Loan,
  LoanDetail,
  LoanListResponse,
  LoanStatus
} from '../types/loan'

interface GetLoanListParams {
  page?: number
  pageSize?: number
  status?: LoanStatus
}

export const loanApi = {
  // 创建贷款申请
  createLoan: (data: LoanRequest) =>
    api.post<any, ApiResponse<Loan>>('/loans', data),

  // 获取贷款列表
  getLoanList: (params?: GetLoanListParams) =>
    api.get<any, ApiResponse<LoanListResponse>>('/api/loans/my', { params }),

  // 获取贷款详情
  getLoanDetail: (id: string) =>
    api.get<any, ApiResponse<LoanDetail>>(`/loans/${id}`),

  // 取消贷款申请
  cancelLoan: (id: string) =>
    api.post<any, ApiResponse<null>>(`/loans/${id}/cancel`),

  // 更新贷款信息
  updateLoan: (id: string, data: LoanRequest) =>
    api.put<any, ApiResponse<Loan>>(`/loans/${id}`, data)
} 