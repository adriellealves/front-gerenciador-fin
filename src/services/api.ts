import axios from 'axios'
import { useToast } from '../composables/useToast'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@CoreFinancas:token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}, (error) => {
  return Promise.reject(error)
})

api.interceptors.response.use((response) => {
  return response
}, (error) => {
  const { showToast } = useToast()

  if (error.response) {
    const status = error.response.status

    if (status === 401 || status === 403) {
      localStorage.clear()
      window.location.href = '/login'
    } else if (status >= 500) {
      showToast('Erro interno no servidor. Tente novamente mais tarde.', 'error')
    }
  }

  return Promise.reject(error)
})