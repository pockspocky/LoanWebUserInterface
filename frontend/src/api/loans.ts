import request from '@/utils/request'
import type { Loan, LoanRequest, LoanDetailResponse } from '@/types/loan'

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export const getLoanById = (id: string) => {
  return request.get<ApiResponse<LoanDetailResponse>>(`/api/loans/${id}`)
}

export const getMyLoans = () => {
  return request.get<ApiResponse<Loan[]>>('/api/loans/my')
}

export const createLoan = (data: LoanRequest) => {
  return request.post<ApiResponse<Loan>>('/api/loans', data)
}

export const updateLoan = (id: string, data: Partial<LoanRequest>) => {
  return request.put<ApiResponse<Loan>>(`/api/loans/${id}`, data)
}

export const completeLoan = (id: string) => {
  return request.put<ApiResponse<Loan>>(`/api/loans/${id}/complete`)
}

export const updatePayment = (loanId: string, month: number, data: { paidAmount?: number, status?: 'paid' | 'pending' | 'overdue' }) => {
  return request.put<ApiResponse<void>>(`/api/loans/${loanId}/payment/${month}`, data)
}

export const updatePaymentBatch = (loanId: string, payments: Array<{ month: number, paidAmount: number, status: 'paid' | 'pending' | 'overdue' }>) => {
  return request.put<ApiResponse<LoanDetailResponse>>(`/api/loans/${loanId}/payments/batch`, { payments })
}

export const deleteLoan = (id: string) => {
  return request.delete<ApiResponse<void>>(`/api/loans/${id}`)
} 