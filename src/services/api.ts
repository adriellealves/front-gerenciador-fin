import axios from 'axios'

// Cria uma instância do Axios pré-configurada
export const api = axios.create({
  baseURL: 'http://localhost:8080/api', // O endereço do seu Java
  headers: {
    'Content-Type': 'application/json'
  }
})