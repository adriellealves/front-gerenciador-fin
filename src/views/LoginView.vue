<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useAuth } from '../composables/useAuth'
import { useFormValidation } from '../composables/useFormValidation'

const router = useRouter()
const { saveSession } = useAuth()
const { errors, clearErrors, validateEmail, validatePassword } = useFormValidation()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  clearErrors()
  const emailOk = validateEmail(email.value)
  const passOk = validatePassword(password.value)
  if (!emailOk || !passOk) return

  try {
    isLoading.value = true

    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })

    const { token, userId, name } = response.data
    saveSession(token, userId, name)
    router.push('/')
  } catch {
    errors.value['form'] = 'E-mail ou senha incorretos. Tente novamente.'
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

      <form @submit.prevent="handleLogin" class="login-form" novalidate>
        <div class="form-group">
          <label for="login-email">E-mail</label>
          <input
            id="login-email"
            type="email"
            v-model="email"
            placeholder="seu@email.com"
            :aria-invalid="!!errors.email"
            autocomplete="email"
          />
          <span v-if="errors.email" class="field-error" role="alert">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="login-password">Senha</label>
          <input
            id="login-password"
            type="password"
            v-model="password"
            placeholder="••••••••"
            :aria-invalid="!!errors.password"
            autocomplete="current-password"
          />
          <span v-if="errors.password" class="field-error" role="alert">{{ errors.password }}</span>
        </div>

        <div v-if="errors.form" class="error-message" role="alert">
          {{ errors.form }}
        </div>

        <button type="submit" class="btn-login" :disabled="isLoading" :aria-busy="isLoading">
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
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f2f6;
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
.form-group { display: flex; flex-direction: column; gap: 0.4rem; text-align: left; }
.form-group label { font-weight: bold; color: #57606f; font-size: 0.9rem; }
.form-group input { padding: 0.75rem; border: 1px solid #dfe4ea; border-radius: 6px; font-size: 1rem; transition: border-color 0.2s; }
.form-group input:focus { outline: none; border-color: #3742fa; }
.form-group input[aria-invalid="true"] { border-color: #ff4757; }

.field-error { font-size: 0.8rem; color: #ff4757; }
.error-message { background-color: #ffcccc; color: #ff4757; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem; text-align: center; }

.btn-login { background: #3742fa; color: white; border: none; padding: 0.85rem; border-radius: 6px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: background 0.2s; margin-top: 0.5rem; }
.btn-login:hover:not(:disabled) { background: #2f3542; }
.btn-login:disabled { background: #a4b0be; cursor: not-allowed; }

.login-footer { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #747d8c; }
.login-footer a { color: #3742fa; text-decoration: none; font-weight: bold; }
.login-footer a:hover { text-decoration: underline; }
</style>