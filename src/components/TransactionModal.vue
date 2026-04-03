<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Account, Category, TransactionFormData, TransactionType } from '../types'
import { useFormValidation } from '../composables/useFormValidation'

const props = defineProps<{
  isOpen: boolean
  type: 'income' | 'expense'
  accounts: Account[]
  categories: Category[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: TransactionFormData): void
}>()

const { errors, clearErrors, validatePositiveAmount, validateRequired } = useFormValidation()

const description = ref('')
const amount = ref<number | null>(null)
const date = ref('')
const categoryId = ref('')
const accountId = ref('')

const isExpense = () => props.type === 'expense'

const title = () => (isExpense() ? 'Nova Despesa' : 'Nova Receita')
const accountPlaceholder = () =>
  isExpense() ? 'Selecione de onde saiu o dinheiro...' : 'Selecione para onde o dinheiro entrou...'
const saveLabel = () => (isExpense() ? 'Salvar Despesa' : 'Salvar Receita')

const resetForm = () => {
  description.value = ''
  amount.value = null
  date.value = ''
  categoryId.value = ''
  accountId.value = ''
  clearErrors()
}

const submitForm = () => {
  clearErrors()

  const descOk = validateRequired(description.value, 'description', 'Descrição')
  const amountOk = validatePositiveAmount(amount.value)
  const dateOk = validateRequired(date.value, 'date', 'Data')
  const accountOk = validateRequired(accountId.value, 'accountId', 'Conta bancária')
  const categoryOk = validateRequired(categoryId.value, 'categoryId', 'Categoria')

  if (!descOk || !amountOk || !dateOk || !accountOk || !categoryOk) return

  const data: TransactionFormData = {
    description: description.value,
    amount: amount.value,
    date: date.value,
    categoryId: categoryId.value,
    accountId: accountId.value,
    type: (isExpense() ? 'EXPENSE' : 'INCOME') as TransactionType,
  }

  emit('save', data)
  resetForm()
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) handleClose()
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <div
    v-if="isOpen"
    class="modal-overlay"
    @click.self="handleClose"
    role="dialog"
    :aria-label="title()"
    aria-modal="true"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h2 :class="isExpense() ? 'expense-title' : 'income-title'">{{ title() }}</h2>
        <button class="btn-close-icon" @click="handleClose" aria-label="Fechar modal">×</button>
      </div>

      <form @submit.prevent="submitForm" class="transaction-form" novalidate>
        <div class="form-group">
          <label for="t-description">Descrição</label>
          <input
            id="t-description"
            type="text"
            v-model="description"
            :placeholder="isExpense() ? 'Ex: Conta de Luz...' : 'Ex: Salário...'"
            :aria-invalid="!!errors.description"
          />
          <span v-if="errors.description" class="field-error" role="alert">{{ errors.description }}</span>
        </div>

        <div class="form-group row">
          <div class="col">
            <label for="t-amount">Valor (R$)</label>
            <input
              id="t-amount"
              type="number"
              step="0.01"
              min="0.01"
              v-model="amount"
              placeholder="0.00"
              :aria-invalid="!!errors.amount"
            />
            <span v-if="errors.amount" class="field-error" role="alert">{{ errors.amount }}</span>
          </div>
          <div class="col">
            <label for="t-date">Data</label>
            <input
              id="t-date"
              type="date"
              v-model="date"
              :aria-invalid="!!errors.date"
            />
            <span v-if="errors.date" class="field-error" role="alert">{{ errors.date }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="t-account">Conta Bancária</label>
          <select
            id="t-account"
            v-model="accountId"
            :aria-invalid="!!errors.accountId"
          >
            <option value="" disabled>{{ accountPlaceholder() }}</option>
            <option v-for="account in accounts" :key="account.id" :value="account.id">
              {{ account.name }}
            </option>
          </select>
          <span v-if="errors.accountId" class="field-error" role="alert">{{ errors.accountId }}</span>
        </div>

        <div class="form-group">
          <label for="t-category">Categoria</label>
          <select
            id="t-category"
            v-model="categoryId"
            :aria-invalid="!!errors.categoryId"
          >
            <option value="" disabled>Selecione a categoria...</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <span v-if="errors.categoryId" class="field-error" role="alert">{{ errors.categoryId }}</span>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="handleClose">Cancelar</button>
          <button
            type="submit"
            class="btn-save"
            :class="isExpense() ? 'btn-expense' : 'btn-income'"
          >
            {{ saveLabel() }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 { margin: 0; }
.expense-title { color: #ff4757; }
.income-title  { color: #2ed573; }

.btn-close-icon {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.transaction-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  text-align: left;
}

.row { display: flex; gap: 1rem; }
.col { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }

label { font-size: 0.9rem; font-weight: 600; color: #57606f; }

input, select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

input[aria-invalid="true"],
select[aria-invalid="true"] {
  border-color: #ff4757;
}

.field-error {
  font-size: 0.8rem;
  color: #ff4757;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  background: white;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}

.btn-save {
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.btn-expense { background: #ff4757; }
.btn-expense:hover { background: #e84118; }

.btn-income { background: #2ed573; }
.btn-income:hover { background: #27ae60; }
</style>
