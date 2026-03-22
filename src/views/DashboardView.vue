<script setup lang="ts">
import { ref } from 'vue'
import ExpenseModal from '../components/ExpenseModal.vue' // Importa o componente filho

// Dados do Dashboard (Mock)
const userName = ref('Adrielle')
const currentBalance = ref(6500.50)
const monthlyIncome = ref(5000.00)
const monthlyExpense = ref(1200.00)

// Estado para controlar o modal
const isExpenseModalOpen = ref(false)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// Função que será chamada quando o modal emitir o evento 'save'
const handleSaveExpense = (expenseData: any) => {
  console.log('Despesa recebida do modal:', expenseData)
  
  // Simula a adição da despesa na interface (subtrai do saldo e soma na despesa)
  currentBalance.value -= expenseData.amount
  monthlyExpense.value += expenseData.amount
  
  // Fecha o modal após salvar
  isExpenseModalOpen.value = false
}
</script>

<template>
  <div class="dashboard-container">
    <header class="header">
      <div>
        <h1>Olá, {{ userName }}! 👋</h1>
        <br>
        <p>Aqui está o resumo das suas finanças.</p>
      </div>
      <button class="btn-logout">Sair</button>
    </header>

    <section class="summary-cards">
      <div class="card balance-card">
        <h3>Saldo Atual</h3>
        <h2 class="amount">{{ formatCurrency(currentBalance) }}</h2>
      </div>

      <div class="card income-card">
        <h3>Receitas do Mês</h3>
        <h2 class="amount income">{{ formatCurrency(monthlyIncome) }}</h2>
      </div>

      <div class="card expense-card">
        <h3>Despesas do Mês</h3>
        <h2 class="amount expense">{{ formatCurrency(monthlyExpense) }}</h2>
      </div>
    </section>

    <section class="actions-section">
      <div class="action-buttons">
        <button class="btn-action btn-expense" @click="isExpenseModalOpen = true">
          - Nova Despesa
        </button>
      </div>
    </section>

    <ExpenseModal 
      :isOpen="isExpenseModalOpen" 
      @close="isExpenseModalOpen = false"
      @save="handleSaveExpense"
    />
  </div>
</template>

<style scoped>
/* Estilos para deixar o Dashboard com cara de App Profissional */
.dashboard-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: sans-serif;
  color: #333;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
}

.btn-logout {
  background: none;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #ff4757;
  color: white;
  border-color: #ff4757;
}

/* Usando CSS Grid para colocar os cartões lado a lado */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(58, 58, 58, 0.05);
  border: 1px solid #eaeaea;
}

.balance-card {
  background: #2c3e50;
  color: white;
}

.card h3 {
  margin-top: 0;
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.9;
}

.amount {
  margin: 0;
  font-size: 2rem;
}

/* Cores específicas para Receita (Verde) e Despesa (Vermelho) */
.income { color: #2ed573; }
.expense { color: #ff4757; }

.actions-section {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
}
.action-buttons { display: flex; gap: 1rem; justify-content: center; }
.btn-action { padding: 1rem 2rem; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; border: none; color: white; transition: transform 0.2s; }
.btn-action:active { transform: scale(0.95); }
.btn-expense { background-color: #ff4757; box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4); }
</style>