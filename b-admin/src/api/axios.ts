import axios from "axios"

const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 30000,
})

axiosInstance.interceptors.request.use(
  (config) => {
    // 从 localStorage 取 token 自动加到请求头
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"]
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 时清除 token，跳转登录页
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    console.error("API Error:", error)
    return Promise.reject(error)
  }
)

export default axiosInstance