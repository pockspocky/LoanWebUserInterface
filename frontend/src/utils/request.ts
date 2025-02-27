import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useUserStore } from '@/stores/user'

const instance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
    }
    return Promise.reject(error)
  }
)

const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => {
    return instance.get<T, T>(url, config)
  },

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return instance.post<T, T>(url, data, config)
  },

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return instance.put<T, T>(url, data, config)
  },

  delete: <T = any>(url: string, config?: AxiosRequestConfig) => {
    return instance.delete<T, T>(url, config)
  }
}

export default request 