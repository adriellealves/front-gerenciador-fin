<script setup lang="ts">
import { ref } from 'vue'

// 1. Recebe a ordem do Dashboard se deve aparecer ou não
defineProps<{ isOpen: boolean }>()

// 2. Define os eventos que este modal pode emitir para o Dashboard
const emit = defineEmits(['close', 'save'])

// 3. Estado (variáveis) do formulário
const description = ref('')
const amount = ref<number | null>(null)
const date = ref('')
const categoryId = ref('') // Usando Mock por enquanto

const submitForm = () => {
  // Monta o "DTO" do Frontend para enviar ao Dashboard
  const expenseData = {
    description: description.value,
    amount: amount.value,
    date: date.value,
    categoryId: categoryId.value,
    type: 'EXPENSE'
  }
  
  // Emite o evento 'save' enviando os dados junto
  emit('save', expenseData)
  
  // Limpa o formulário para a próxima vez
  description.value = ''
  amount.value = null
  date.value = ''
  categoryId.value = ''
}
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Nova Despesa</h2>
        <button class="btn-close-icon" @click="emit('close')">×</button>
      </div>

      <form @submit.prevent="submitForm" class="expense-form">
        <div class="form-group">
          <label>Descrição</label>
          <input type="text" v-model="description" required placeholder="Ex: Conta de Luz, Mercado..." />
        </div>

        <div class="form-group row">
          <div class="col">
            <label>Valor (R$)</label>
            <input type="number" step="0.01" v-model="amount" required placeholder="0.00" />
          </div>
          <div class="col">
            <label>Data</label>
            <input type="date" v-model="date" required />
          </div>
        </div>

        <div class="form-group">
          <label>Categoria (Simulada)</label>
          <select v-model="categoryId" required>
            <option value="" disabled>Selecione...</option>
            <option value="1">Alimentação</option>
            <option value="2">Moradia</option>
            <option value="3">Transporte</option>
          </select>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="emit('close')">Cancelar</button>
          <button type="submit" class="btn-save">Salvar Despesa</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Fundo escuro transparente */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Caixa branca do modal */
.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 { margin: 0; color: #ff4757; } /* Vermelho para despesa */

.btn-close-icon {
  background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;
}

.expense-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; text-align: left; }
.row { display: flex; gap: 1rem; }
.col { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }

input, select {
  padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;
}

.modal-actions {
  display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;
}

.btn-cancel { background: white; border: 1px solid #ccc; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
.btn-save { background: #ff4757; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-save:hover { background: #e84118; }
</style>