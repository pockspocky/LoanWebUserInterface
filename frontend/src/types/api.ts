import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User } from './auth'
import type { LoanRequest, Loan, LoanDetail, LoanListResponse } from './loan'

// API 响应基础接口
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

// 错误响应
export interface ErrorResponse {
  code: number;
  message: string;
  data: null;
}

// 导出认证相关类型
export type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, User }

// 导出贷款相关类型
export type { LoanRequest, Loan, LoanDetail, LoanListResponse } 