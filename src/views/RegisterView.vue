<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import { useToast } from '../composables/useToast'
import { useFormValidation } from '../composables/useFormValidation'

const router = useRouter()
const { showToast } = useToast()
const {
  errors,
  clearErrors,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
} = useFormValidation()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)

const handleRegister = async () => {
  clearErrors()

  const nameOk = validateRequired(name.value, 'name', 'Nome')
  const emailOk = validateEmail(email.value)
  const passOk = validatePassword(password.value)
  const matchOk = validatePasswordMatch(password.value, confirmPassword.value)

  if (!nameOk || !emailOk || !passOk || !matchOk) return

  try {
    isLoading.value = true

    await api.post('/users', {
      name: name.value,
      email: email.value,
      password: password.value
    })

    showToast('Conta criada com sucesso! Faça login para continuar.', 'success')
    router.push('/login')
  } catch (err: unknown) {
    const error = err as { response?: { status?: number } }
    if (error.response && error.response.status === 400) {
      errors.value['form'] = 'Este e-mail já está registado ou os dados são inválidos.'
    } else {
      errors.value['form'] = 'Erro ao criar conta. Tente novamente mais tarde.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>Criar Conta 🚀</h1>
        <p>Junte-se ao Core Finanças e assuma o controle.</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form" novalidate>
        <div class="form-group">
          <label for="reg-name">Nome Completo</label>
          <input
            id="reg-name"
            type="text"
            v-model="name"
            placeholder="Seu nome"
            :aria-invalid="!!errors.name"
            autocomplete="name"
          />
          <span v-if="errors.name" class="field-error" role="alert">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="reg-email">E-mail</label>
          <input
            id="reg-email"
            type="email"
            v-model="email"
            placeholder="seu@email.com"
            :aria-invalid="!!errors.email"
            autocomplete="email"
          />
          <span v-if="errors.email" class="field-error" role="alert">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="reg-password">Senha</label>
          <input
            id="reg-password"
            type="password"
            v-model="password"
            placeholder="Mínimo 6 caracteres"
            :aria-invalid="!!errors.password"
            autocomplete="new-password"
          />
          <span v-if="errors.password" class="field-error" role="alert">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="reg-confirm">Confirmar Senha</label>
          <input
            id="reg-confirm"
            type="password"
            v-model="confirmPassword"
            placeholder="Repita a senha"
            :aria-invalid="!!errors.confirmPassword"
            autocomplete="new-password"
          />
          <span v-if="errors.confirmPassword" class="field-error" role="alert">{{ errors.confirmPassword }}</span>
        </div>

        <div v-if="errors.form" class="error-message" role="alert">
          {{ errors.form }}
        </div>

        <button type="submit" class="btn-register" :disabled="isLoading" :aria-busy="isLoading">
          {{ isLoading ? 'A criar conta...' : 'Registrar' }}
        </button>
      </form>

      <div class="register-footer">
        <p>Já tem uma conta? <router-link to="/login">Faça Login</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f1f2f6; font-family: sans-serif; padding: 2rem; }
.register-card { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 450px; }
.register-header { text-align: center; margin-bottom: 2rem; }
.register-header h1 { margin: 0; color: #2f3542; font-size: 1.8rem; }
.register-header p { color: #747d8c; margin-top: 0.5rem; }
.register-form { display: flex; flex-direction: column; gap: 1.2rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; text-align: left; }
.form-group label { font-weight: bold; color: #57606f; font-size: 0.9rem; }
.form-group input { padding: 0.75rem; border: 1px solid #dfe4ea; border-radius: 6px; font-size: 1rem; transition: border-color 0.2s; }
.form-group input:focus { outline: none; border-color: #3742fa; }
.form-group input[aria-invalid="true"] { border-color: #ff4757; }
.field-error { font-size: 0.8rem; color: #ff4757; }
.error-message { background-color: #ffcccc; color: #ff4757; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem; text-align: center; }
.btn-register { background: #2ed573; color: white; border: none; padding: 0.85rem; border-radius: 6px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: background 0.2s; margin-top: 0.5rem; }
.btn-register:hover:not(:disabled) { background: #27ae60; }
.btn-register:disabled { background: #a4b0be; cursor: not-allowed; }
.register-footer { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #747d8c; }
.register-footer a { color: #3742fa; text-decoration: none; font-weight: bold; }
.register-footer a:hover { text-decoration: underline; }
</style>