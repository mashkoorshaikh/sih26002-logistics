import api from './api'
import { useAuthStore } from '../store/authStore'

export const authService = {
  async register({ fullName, email, password, organization }) {
    const res = await api.post('/api/v1/auth/register', {
      full_name: fullName,
      email,
      password,
      organization,
    })
    return res.data
  },

  async login({ email, password }) {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    const res = await api.post('/api/v1/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const { access_token, user } = res.data
    useAuthStore.getState().login(user, access_token)
    return res.data
  },

  logout() {
    useAuthStore.getState().logout()
  },

  async getMe() {
    const res = await api.get('/api/v1/auth/me')
    return res.data
  },
}
