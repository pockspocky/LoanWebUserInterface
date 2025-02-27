import api from '../api'
import type { ApiResponse } from '../types/api'
import type { LoginRequest, LoginResponse, User } from '../types/auth'

export const authApi = {
  // 登录
  login: (data: LoginRequest) =>
    api.post<any, ApiResponse<LoginResponse>>('/api/users/login', data),

  // 注册
  register: (data: LoginRequest) =>
    api.post<any, ApiResponse<User>>('/api/users/register', data),

  // 获取用户列表
  getUsers: () =>
    api.get<any, ApiResponse<{ users: User[] }>>('/api/users/all'),

  // 添加用户
  addUser: (data: LoginRequest) =>
    api.post<any, ApiResponse<User>>('/api/users', data),

  // 删除用户
  deleteUser: (id: string) =>
    api.delete<any, ApiResponse<void>>(`/api/users/${id}`)
} 