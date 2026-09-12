import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const PRODUCTION_API_URL = 'https://ner-logistics-backend.onrender.com'
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || (isLocalhost ? 'http://localhost:8000' : PRODUCTION_API_URL)
const api = axios.create({
  baseURL: rawBaseUrl.replace(/\/+$/, ''),
  headers: { 'Content-Type': 'application/json' },
})


// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
