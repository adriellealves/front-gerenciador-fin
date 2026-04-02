<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import TransactionModal from '../components/TransactionModal.vue'
import { useAuth } from '../composables/useAuth'
import { useTransactions } from '../composables/useTransactions'
import { useAccounts } from '../composables/useAccounts'
import { useCategories } from '../composables/useCategories'
import { useToast } from '../composables/useToast'
import type { TransactionFormData } from '../types'

const { getUserId, getUserName, logout } = useAuth()
const { showToast } = useToast()

const userId = getUserId()
const userName = ref(getUserName())
const activeTab = ref('REALIZADAS')
const isExpenseModalOpen = ref(false)
const isIncomeModalOpen = ref(false)

const { accounts, fetchAccounts, calcTotalBalance, formatCurrency } = useAccounts(userId)
const { categories, fetchCategories } = useCategories(userId)
const {
  transactions,
  fetchTransactions,
  calcMonthlyTotals,
  determineStatus,
  createTransaction,
  formatDate,
} = useTransactions(userId)

const currentBalance = computed(() => calcTotalBalance(accounts.value))
const monthlyTotals = computed(() => calcMonthlyTotals(transactions.value))

const filteredTransactions = computed(() =>
  transactions.value.filter(t =>
    activeTab.value === 'REALIZADAS' ? t.status === 'PAID' : t.status === 'PENDING'
  )
)

const loadDashboardData = async () => {
  try {
    await Promise.all([fetchAccounts(), fetchCategories(), fetchTransactions()])
  } catch {
    showToast('Erro ao carregar dados do dashboard.', 'error')
  }
}

const handleSaveTransaction = async (data: TransactionFormData, type: 'EXPENSE' | 'INCOME') => {
  try {
    await createTransaction({
      userId,
      accountId: data.accountId,
      categoryId: data.categoryId,
      type,
      amount: data.amount,
      description: data.description,
      transactionDate: data.date,
      status: determineStatus(data.date),
    })
    isExpenseModalOpen.value = false
    isIncomeModalOpen.value = false
    await loadDashboardData()
    showToast(
      type === 'EXPENSE' ? 'Despesa registrada com sucesso!' : 'Receita registrada com sucesso!',
      'success'
    )
  } catch {
    showToast(
      type === 'EXPENSE'
        ? 'Erro ao salvar despesa. Verifique o saldo ou tente novamente.'
        : 'Erro ao salvar receita. Tente novamente.',
      'error'
    )
  }
}

onMounted(loadDashboardData)
</script>

<template>
  <div class="dashboard-container">
    <header class="header">
      <div>
        <h1>Olá, {{ userName }}! 👋</h1>
        <br>
        <p>Aqui está o resumo das suas finanças.</p>
      </div>
      <button class="btn-logout" @click="logout" aria-label="Sair da conta">Sair</button>
    </header>

    <section class="summary-cards" aria-label="Resumo financeiro">
      <div class="card balance-card">
        <h3>Saldo Atual</h3>
        <h2 class="amount">{{ formatCurrency(currentBalance) }}</h2>
      </div>

      <div class="card income-card">
        <h3>Receitas do Mês</h3>
        <h2 class="amount income">{{ formatCurrency(monthlyTotals.income) }}</h2>
      </div>

      <div class="card expense-card">
        <h3>Despesas do Mês</h3>
        <h2 class="amount expense">{{ formatCurrency(monthlyTotals.expense) }}</h2>
      </div>
    </section>

    <section class="actions-section" aria-label="Ações rápidas">
      <div class="action-buttons">
        <button class="btn-action btn-income" @click="isIncomeModalOpen = true">+ Nova Receita</button>
        <button class="btn-action btn-expense" @click="isExpenseModalOpen = true">- Nova Despesa</button>
        <button class="btn-action btn-manage" @click="$router.push('/accounts')">⚙️ Gerir Contas</button>
        <button class="btn-action btn-manage-cat" @click="$router.push('/categories')">🏷️ Categorias</button>
      </div>
    </section>

    <section class="transactions-section" aria-label="Lista de transações">
      <div class="section-header">
        <h2>Transações</h2>
      </div>

      <div class="tabs-container" role="tablist" aria-label="Filtro de transações">
        <button
          class="tab-button"
          role="tab"
          :aria-selected="activeTab === 'REALIZADAS'"
          :class="{ active: activeTab === 'REALIZADAS' }"
          @click="activeTab = 'REALIZADAS'"
        >
          Realizadas
        </button>
        <button
          class="tab-button"
          role="tab"
          :aria-selected="activeTab === 'PENDENTES'"
          :class="{ active: activeTab === 'PENDENTES' }"
          @click="activeTab = 'PENDENTES'"
        >
          Pendentes
        </button>
      </div>

      <div v-if="filteredTransactions.length === 0" class="empty-state">
        <p>Nenhuma transação {{ activeTab === 'REALIZADAS' ? 'realizada' : 'pendente' }} encontrada.</p>
        <button
          class="btn-action btn-income btn-add-transaction"
          @click="isIncomeModalOpen = true"
        >
          + Adicionar transação
        </button>
      </div>

      <div class="transaction-list" v-else role="list">
        <div
          v-for="t in filteredTransactions"
          :key="t.id"
          class="transaction-item"
          role="listitem"
        >
          <div class="t-info">
            <strong>{{ t.description }}</strong>
            <span>{{ formatDate(t.transactionDate) }}</span>
            <span v-if="t.status === 'PENDING'" class="badge-pending" aria-label="Pendente">Pendente</span>
          </div>

          <div class="t-amount" :class="t.type.toLowerCase()" :aria-label="`${t.type === 'INCOME' ? 'Receita' : 'Despesa'}: ${formatCurrency(t.amount)}`">
            {{ t.type === 'INCOME' ? '+' : '-' }} {{ formatCurrency(t.amount) }}
          </div>
        </div>
      </div>
    </section>

    <TransactionModal
      type="expense"
      :isOpen="isExpenseModalOpen"
      :accounts="accounts"
      :categories="categories.filter(c => c.type === 'EXPENSE')"
      @close="isExpenseModalOpen = false"
      @save="(data) => handleSaveTransaction(data, 'EXPENSE')"
    />

    <TransactionModal
      type="income"
      :isOpen="isIncomeModalOpen"
      :accounts="accounts"
      :categories="categories.filter(c => c.type === 'INCOME')"
      @close="isIncomeModalOpen = false"
      @save="(data) => handleSaveTransaction(data, 'INCOME')"
    />
  </div>
</template>

<style scoped>
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

.income { color: #2ed573; }
.expense { color: #ff4757; }

.actions-section {
  text-align: center;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  color: #666;
}

.action-buttons { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.btn-action { padding: 1rem 2rem; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; border: none; color: white; transition: transform 0.2s; }
.btn-action:active { transform: scale(0.95); }
.btn-expense { background-color: #ff4757; box-shadow: 0 4px 15px rgba(255, 71, 87, 0.4); }
.btn-income { background-color: #2ed573; box-shadow: 0 4px 15px rgba(46, 213, 115, 0.4); }
.btn-manage { background-color: #3742fa; box-shadow: 0 4px 15px rgba(55, 66, 250, 0.4); }
.btn-manage-cat { background-color: #ffa502; box-shadow: 0 4px 15px rgba(255, 165, 2, 0.4); }

.transactions-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  margin-top: 2rem;
}

.section-header h2 {
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  color: #2c3e50;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
  border-left: 4px solid #ddd;
  transition: transform 0.2s;
}

.transaction-item:hover {
  transform: translateX(5px);
}

.t-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  text-align: left;
  align-items: flex-start;
}

.t-info strong {
  font-size: 1rem;
  color: #333;
}

.t-info span {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.t-amount {
  font-size: 1.1rem;
  font-weight: bold;
}

.t-amount.income { color: #2ed573; }
.t-amount.expense { color: #ff4757; }

.badge-pending {
  background: #f1c40f;
  color: #fff !important;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem !important;
  font-weight: bold;
  width: fit-content;
}

.empty-state {
  text-align: center;
  color: #95a5a6;
  padding: 2rem;
  font-style: italic;
}

.tabs-container {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f1f2f6;
  padding-bottom: 0.5rem;
}

.tab-button {
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: #a4b0be;
  cursor: pointer;
  padding: 0.5rem 0.5rem;
  position: relative;
  transition: color 0.2s;
}

.tab-button:hover {
  color: #2f3542;
}

.tab-button.active {
  color: #2f3542;
}

.btn-add-transaction {
  margin-top: 1rem;
  font-size: 0.95rem;
  padding: 0.6rem 1.2rem;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -0.65rem;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #3742fa;
  border-radius: 3px 3px 0 0;
}
</style>