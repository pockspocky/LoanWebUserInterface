export interface User {
  id: string
  username: string
  isAdmin: boolean
  createdAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface RegisterResponse {
  message: string
}

export interface AddUserRequest {
  username: string
  password: string
  isAdmin?: boolean
}

export type UserListResponse = User[] 