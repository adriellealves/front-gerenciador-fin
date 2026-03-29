<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

const router = useRouter()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  try {
    isLoading.value = true
    errorMessage.value = '' // Limpa erros anteriores

    // 1. Envia as credenciais para o Java
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })

    // 2. Se o Java aprovar, recebemos o Token e os dados do usuário
    const { token, userId, name } = response.data

    // 3. Guardamos o "crachá" no cofre do navegador (LocalStorage)
    localStorage.setItem('@CoreFinancas:token', token)
    localStorage.setItem('@CoreFinancas:userId', userId)
    localStorage.setItem('@CoreFinancas:userName', name)

    // 4. Redireciona o usuário para o Dashboard
    router.push('/')
  } catch (error: any) {
    console.error("Erro no login:", error)
    // Se o Java devolver 400 (Bad Request), a senha ou email estão errados
    errorMessage.value = "E-mail ou senha incorretos. Tente novamente."
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Core Finanças 💰</h1>
        <p>Faça login para gerir o seu dinheiro.</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>E-mail</label>
          <input type="email" v-model="email" required placeholder="seu@email.com" />
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input type="password" v-model="password" required placeholder="••••••••" />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-login" :disabled="isLoading">
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>
      
      <div class="login-footer">
        <p>Ainda não tem conta? <router-link to="/register">Registre-se</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Um design limpo e centralizado para a tela de login */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f2f6; /* Fundo cinza clarinho */
  font-family: sans-serif;
}

.login-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  width: 100%;
  max-width: 400px;
}

.login-header { text-align: center; margin-bottom: 2rem; }
.login-header h1 { margin: 0; color: #2f3542; font-size: 1.8rem; }
.login-header p { color: #747d8c; margin-top: 0.5rem; }

.login-form { display: flex; flex-direction: column; gap: 1.2rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; text-align: left; }
.form-group label { font-weight: bold; color: #57606f; font-size: 0.9rem; }
.form-group input { padding: 0.75rem; border: 1px solid #dfe4ea; border-radius: 6px; font-size: 1rem; transition: border-color 0.2s; }
.form-group input:focus { outline: none; border-color: #3742fa; }

.error-message { background-color: #ffcccc; color: #ff4757; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem; text-align: center; }

.btn-login { background: #3742fa; color: white; border: none; padding: 0.85rem; border-radius: 6px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: background 0.2s; margin-top: 0.5rem; }
.btn-login:hover:not(:disabled) { background: #2f3542; }
.btn-login:disabled { background: #a4b0be; cursor: not-allowed; }

.login-footer { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #747d8c; }
.login-footer a { color: #3742fa; text-decoration: none; font-weight: bold; }
.login-footer a:hover { text-decoration: underline; }
</style>