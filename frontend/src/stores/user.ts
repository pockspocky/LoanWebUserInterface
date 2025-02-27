import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi, userApi } from '../api'
import type { User } from '../types/auth'
import { ElMessage } from 'element-plus'

// 从 localStorage 获取用户信息
const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const user = ref<User | null>(null)

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (newUser: User) => {
    user.value = newUser
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  const isLoggedIn = () => !!token.value
  const isAdmin = () => !!user.value?.isAdmin

  const login = async (token: string, user: User) => {
    setToken(token)
    setUser(user)
    localStorage.setItem('user', JSON.stringify(user))
  }

  const register = async (username: string, password: string) => {
    try {
      const response = await authApi.register({ username, password })
      if (response.code === 200) {
        ElMessage.success('注册成功')
        return true
      }
      ElMessage.error(response.message || '注册失败')
      return false
    } catch (error: any) {
      console.error('Registration failed:', error)
      ElMessage.error(error.message || '注册失败')
      return false
    }
  }

  const getUsers = async () => {
    try {
      const response = await userApi.getUsers()
      if (response.code === 200) {
        return response.data.users
      }
      ElMessage.error(response.message || '获取用户列表失败')
      return []
    } catch (error: any) {
      console.error('Get users failed:', error)
      ElMessage.error(error.message || '获取用户列表失败')
      return []
    }
  }

  const addUser = async (username: string, password: string, isAdmin: boolean) => {
    try {
      const response = await userApi.addUser({ username, password, isAdmin })
      if (response.code === 200) {
        ElMessage.success('添加用户成功')
        return true
      }
      ElMessage.error(response.message || '添加用户失败')
      return false
    } catch (error: any) {
      console.error('Add user failed:', error)
      ElMessage.error(error.message || '添加用户失败')
      return false
    }
  }

  const deleteUser = async (id: string) => {
    try {
      const response = await userApi.deleteUser(id)
      if (response.code === 200) {
        ElMessage.success('删除用户成功')
        return true
      }
      ElMessage.error(response.message || '删除用户失败')
      return false
    } catch (error: any) {
      console.error('Delete user failed:', error)
      ElMessage.error(error.message || '删除用户失败')
      return false
    }
  }

  return {
    token,
    user,
    setToken,
    setUser,
    logout,
    isLoggedIn,
    isAdmin,
    login,
    register,
    getUsers,
    addUser,
    deleteUser
  }
}) 