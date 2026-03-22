<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Inicializa o roteador para podermos mudar de página via código
const router = useRouter()

// Variáveis reativas fortemente tipadas (inferidas como string)
const email = ref('')
const password = ref('')

// Função disparada quando o formulário é enviado
const handleLogin = () => {
  // Como ainda não ligamos o Axios/Fetch (Tarefa 7), vamos apenas simular!
  console.log('Tentativa de login com:', email.value, password.value)
  
  // Aqui no futuro chamaremos a API Java. 
  // Por enquanto, apenas redirecionamos o utilizador para o Dashboard:
  router.push('/')
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h2>Acesso ao Sistema</h2>
      <p>Gerencie suas finanças com inteligência</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">E-mail</label>
          <input type="email" id="email" v-model="email" placeholder="adrielle@teste.com" required />
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input type="password" id="password" v-model="password" placeholder="Sua senha secreta" required />
        </div>

        <button type="submit" class="btn-login">Entrar</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Um CSS básico para a tela não ficar feia enquanto não usamos um framework de UI */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f7f6;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
  gap: 0.5rem;
}

input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.btn-login {
  background-color: #42b883; /* Verde padrão do Vue */
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}


.btn-login:hover {
  background-color: #33a06f;
}
</style>