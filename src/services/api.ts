import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8080/api'
})

// A MÁGICA: Interceptador de Requisições
api.interceptors.request.use((config) => {
  // 1. Vai ao cofre do navegador buscar o token
  const token = localStorage.getItem('@CoreFinancas:token')
  
  // 2. Se o token existir, injeta no cabeçalho (Header) da requisição
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
}, (error) => {
  return Promise.reject(error)
})

// (Opcional, mas recomendado) Interceptador de Respostas para tratar token expirado
api.interceptors.response.use((response) => {
  return response
}, (error) => {
  // Se o backend devolver 403 (Proibido), o token expirou ou é inválido
  if (error.response && error.response.status === 403) {
    localStorage.clear() // Limpa o cofre
    window.location.href = '/login' // Chuta o utilizador para a tela de login
  }
  return Promise.reject(error)
})