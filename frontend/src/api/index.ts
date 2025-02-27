import axios from 'axios'
import type { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  AddUserRequest,
  UserListResponse,
  LoanRequest,
  Loan,
  LoanListResponse,
  LoanDetail,
  ErrorResponse
} from '../types/api'
import type { AdminLoanListResponse } from '../types/loan'
import { ElMessage } from 'element-plus'

// 设置全局默认值
axios.defaults.withCredentials = false

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加更详细的请求日志
    console.log('Request Config:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    })
    
    return config
  },
  error => {
    console.error('Request error:', error)
    ElMessage.error('请求发送失败，请检查网络连接')
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200 || res.code === 201) {
      return res
    }
    // 非 200/201 状态码也当作错误处理
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(res)
  },
  error => {
    console.error('Response error:', error)
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      ElMessage.error('请求超时，请重试')
      return Promise.reject({
        code: 408,
        message: '请求超时，请重试',
        data: null
      } as ErrorResponse)
    }
    
    if (error.response?.status === 401) {
      // token 过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject({
        code: 401,
        message: '登录已过期，请重新登录',
        data: null
      } as ErrorResponse)
    }
    
    // 处理其他错误
    const errorResponse: ErrorResponse = {
      code: error.response?.status || 500,
      message: error.response?.data?.message || '服务器错误，请稍后重试',
      data: null
    }
    
    ElMessage.error(errorResponse.message)
    return Promise.reject(errorResponse)
  }
)

export const authApi = {
  // 登录
  login: (data: LoginRequest) => 
    api.post<any, ApiResponse<LoginResponse>>('/api/users/login', data),

  // 注册
  register: (data: RegisterRequest) =>
    api.post<any, ApiResponse<RegisterResponse>>('/api/users/register', data)
}

export const userApi = {
  // 获取用户列表（管理员）
  getUsers: () => 
    api.get<any, ApiResponse<UserListResponse>>('/api/users/all'),

  // 删除用户（管理员）
  deleteUser: (id: string) =>
    api.delete<any, ApiResponse<User>>(`/api/users/${id}`),

  // 添加用户（管理员）
  addUser: (data: AddUserRequest) =>
    api.post<any, ApiResponse<User>>(`/api/users/add`, data)
}

export const loanApi = {
  // 创建贷款申请
  createLoan: (data: LoanRequest) =>
    api.post<any, ApiResponse<Loan>>('/api/loans', data),

  // 获取个人贷款列表
  getMyLoans: () =>
    api.get<any, ApiResponse<LoanListResponse>>('/api/loans/my'),

  // 获取所有贷款（管理员）
  getAllLoans: () =>
    api.get<any, ApiResponse<AdminLoanListResponse>>('/api/loans/all'),

  // 更新贷款
  updateLoan: (id: string, data: LoanRequest) =>
    api.put<any, ApiResponse<Loan>>(`/api/loans/${id}`, data),

  // 取消贷款申请
  completeLoan: (id: string) =>
    api.post<any, ApiResponse<Loan>>(`/api/loans/${id}/complete`)
}

export default api 