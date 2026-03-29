<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const handleRegister = async () => {
  // 1. Validação simples no Frontend: As senhas batem?
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "As senhas não coincidem. Verifique e tente novamente."
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    // 2. Envia os dados para o Java criar o usuário
    await api.post('/users', {
      name: name.value,
      email: email.value,
      password: password.value
    })

    // 3. Sucesso! Avisa o usuário e manda para o login
    alert("Conta criada com sucesso! Faça login para continuar.")
    router.push('/login')

  } catch (error: any) {
    console.error("Erro no registo:", error)
    // Se o Java devolver erro (ex: E-mail já cadastrado)
    if (error.response && error.response.status === 400) {
      errorMessage.value = "Este e-mail já está registado ou os dados são inválidos."
    } else {
      errorMessage.value = "Erro ao criar conta. Tente novamente mais tarde."
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

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label>Nome Completo</label>
          <input type="text" v-model="name" required placeholder="Seu nome" />
        </div>

        <div class="form-group">
          <label>E-mail</label>
          <input type="email" v-model="email" required placeholder="seu@email.com" />
        </div>

        <div class="form-group">
          <label>Senha</label>
          <input type="password" v-model="password" required placeholder="Mínimo 6 caracteres" minlength="6" />
        </div>

        <div class="form-group">
          <label>Confirmar Senha</label>
          <input type="password" v-model="confirmPassword" required placeholder="Repita a senha" minlength="6" />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-register" :disabled="isLoading">
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
/* O CSS é praticamente idêntico ao do Login para manter a identidade visual */
.register-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f1f2f6; font-family: sans-serif; padding: 2rem; }
.register-card { background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 450px; }
.register-header { text-align: center; margin-bottom: 2rem; }
.register-header h1 { margin: 0; color: #2f3542; font-size: 1.8rem; }
.register-header p { color: #747d8c; margin-top: 0.5rem; }
.register-form { display: flex; flex-direction: column; gap: 1.2rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; text-align: left; }
.form-group label { font-weight: bold; color: #57606f; font-size: 0.9rem; }
.form-group input { padding: 0.75rem; border: 1px solid #dfe4ea; border-radius: 6px; font-size: 1rem; transition: border-color 0.2s; }
.form-group input:focus { outline: none; border-color: #3742fa; }
.error-message { background-color: #ffcccc; color: #ff4757; padding: 0.75rem; border-radius: 6px; font-size: 0.9rem; text-align: center; }
.btn-register { background: #2ed573; color: white; border: none; padding: 0.85rem; border-radius: 6px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: background 0.2s; margin-top: 0.5rem; }
.btn-register:hover:not(:disabled) { background: #27ae60; }
.btn-register:disabled { background: #a4b0be; cursor: not-allowed; }
.register-footer { text-align: center; margin-top: 1.5rem; font-size: 0.9rem; color: #747d8c; }
.register-footer a { color: #3742fa; text-decoration: none; font-weight: bold; }
.register-footer a:hover { text-decoration: underline; }
</style>