<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue'
  import { api } from '../services/api'
  import { useRouter } from 'vue-router'
  import ExpenseModal from '../components/ExpenseModal.vue'
  import IncomeModal from '../components/IncomeModal.vue'

  
  const router = useRouter()
const USER_ID = localStorage.getItem('@CoreFinancas:userId')
  
   // Estado inicial zerado (ou carregando)
  // Pega o nome do banco, ou usa 'Usuário' como fallback
const userName = ref(localStorage.getItem('@CoreFinancas:userName') || 'Usuário')
  const currentBalance = ref(0)
  const monthlyIncome = ref(0)
  const monthlyExpense = ref(0)
  const activeTab = ref('REALIZADAS')

  const isExpenseModalOpen = ref(false)
  const isIncomeModalOpen = ref(false)

  const accountsList = ref<any[]>([])
  const categoriesList = ref<any[]>([])
  const recentTransactions = ref<any[]>([])

  const handleLogout = () => {
  localStorage.clear() // Limpa tudo (token, id, nome)
  router.push('/login') // Manda de volta para o login
}

// NOVA FUNÇÃO COMPUTADA: Filtra as transações na hora, dependendo da aba clicada!
const filteredTransactions = computed(() => {
  if (activeTab.value === 'REALIZADAS') {
    // Filtra só o que tem status PAID
    return recentTransactions.value.filter(t => t.status === 'PAID')
  } else {
    // Filtra só o que tem status PENDING
    return recentTransactions.value.filter(t => t.status === 'PENDING')
  }
})

  // Função que formata o dinheiro
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }
  const formatDate = (dateString: string) => {
  // Como a data vem como YYYY-MM-DD, a gente divide e inverte
  const [ano, mes, dia] = dateString.split('-')
  return `${dia}/${mes}/${ano}`
}

// NOVA FUNÇÃO: Decide se a transação está Paga ou Pendente com base na data
const determineTransactionStatus = (transactionDate: string) => {
  // Pega a data de hoje e formata para "YYYY-MM-DD" igual vem do calendário do HTML
  const today = new Date().toISOString().split('T')[0];
  
  // No formato ISO (YYYY-MM-DD), podemos comparar strings diretamente!
  // Se a data da transação for maior que hoje (futuro), é pendente.
  if (transactionDate > today) {
    return 'PENDING';
  }
  return 'PAID';
}

  // ATENÇÃO AQUI: Não há mais IDs chumbados. Usamos o que vem do 'expenseData' emitido pelo Modal!
const handleSaveExpense = async (expenseData: any) => {
  try {
    const payload = {
      userId: USER_ID,
      accountId: expenseData.accountId,
      categoryId: expenseData.categoryId,
      type: 'EXPENSE',
      amount: expenseData.amount,
      description: expenseData.description,
      transactionDate: expenseData.date,
      // 👇 AQUI ACONTECE A MÁGICA 👇
      status: determineTransactionStatus(expenseData.date) 
    }

    await api.post('/transactions', payload)
    isExpenseModalOpen.value = false
    await loadDashboardData() 
  } catch (error) {
    console.error("Erro ao salvar despesa:", error)
    alert("Erro: O Saldo pode ser insuficiente ou houve falha na conexão.")
  }
}

const handleSaveIncome = async (incomeData: any) => {
  try {
    const payload = {
      userId: USER_ID,
      accountId: incomeData.accountId,
      categoryId: incomeData.categoryId,
      type: 'INCOME',
      amount: incomeData.amount,
      description: incomeData.description,
      transactionDate: incomeData.date,
      // 👇 AQUI ACONTECE A MÁGICA 👇
      status: determineTransactionStatus(incomeData.date)
    }

    await api.post('/transactions', payload)
    isIncomeModalOpen.value = false
    await loadDashboardData()
  } catch (error) {
    console.error("Erro ao salvar receita:", error)
  }
}

 const loadDashboardData = async () => {
  try {
    // 1. Busca Contas
    const accountsResponse = await api.get(`/accounts/user/${USER_ID}`)
    accountsList.value = accountsResponse.data
    currentBalance.value = accountsList.value.reduce((acc: number, c: any) => acc + c.balance, 0)

    // 2. Busca TODAS as Categorias
    const categoriesResponse = await api.get(`/categories/user/${USER_ID}`)
    categoriesList.value = categoriesResponse.data

    // 3. Busca Transações para o somatório
    const transactionsResponse = await api.get(`/transactions/user/${USER_ID}`)

    // Pega todas as transações
    const allTransactions = transactionsResponse.data
    
    // ORDENAÇÃO: Coloca as transações mais recentes (datas maiores) no topo da lista
    allTransactions.sort((a: any, b: any) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
    
    // Guarda na variável da tela!
    recentTransactions.value = allTransactions
    let incomeTotal = 0
    let expenseTotal = 0

    
    // Descobre qual é o mês e ano em que estamos AGORA (no mundo real)
    const dataAtual = new Date()
    const mesAtual = dataAtual.getMonth() + 1 // No JS, Janeiro é 0, então somamos 1
    const anoAtual = dataAtual.getFullYear()

    transactionsResponse.data.forEach((t: any) => {
      // A data vem do Java no formato "YYYY-MM-DD" (Ex: "2026-06-15")
      // Vamos fatiar (split) essa string para pegar o Ano e o Mês
      const [anoTransacao, mesTransacao] = t.transactionDate.split('-')

      // Só entra na soma se o ano E o mês forem iguais aos de hoje!
      if (parseInt(anoTransacao) === anoAtual && parseInt(mesTransacao) === mesAtual) {
        if (t.type === 'INCOME') incomeTotal += t.amount
        else if (t.type === 'EXPENSE') expenseTotal += t.amount
      }
    })

    monthlyIncome.value = incomeTotal
    monthlyExpense.value = expenseTotal

  } catch (error) {
    console.error("Erro ao carregar dashboard:", error)
  }
}

  // onMounted é acionado automaticamente pelo Vue assim que a tela é desenhada
  onMounted(() => {
    loadDashboardData()
  })

</script>

<template>
  <div class="dashboard-container">
    <header class="header">
      <div>
        <h1>Olá, {{ userName }}! 👋</h1>
        <br>
        <p>Aqui está o resumo das suas finanças.</p>
      </div>
      <button class="btn-logout" @click="handleLogout">Sair</button>
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
        <button class="btn-action btn-income" @click="isIncomeModalOpen = true">+ Nova Receita</button>
        <button class="btn-action btn-expense" @click="isExpenseModalOpen = true">- Nova Despesa</button>
        
        <button class="btn-action btn-manage" @click="router.push('/accounts')">⚙️ Gerir Contas</button>

        <button class="btn-action btn-manage-cat" @click="router.push('/categories')">🏷️ Categorias</button>
      </div>
    </section>

  <section class="transactions-section">
      <div class="section-header">
        <h2>Transações</h2>
      </div>

      <div class="tabs-container">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'REALIZADAS' }" 
          @click="activeTab = 'REALIZADAS'"
        >
          Realizadas
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'PENDENTES' }" 
          @click="activeTab = 'PENDENTES'"
        >
          Pendentes
        </button>
      </div>
      
      <div v-if="filteredTransactions.length === 0" class="empty-state">
        Nenhuma transação {{ activeTab === 'REALIZADAS' ? 'realizada' : 'pendente' }} encontrada.
      </div>
      
      <div class="transaction-list" v-else>
        <div v-for="t in filteredTransactions" :key="t.id" class="transaction-item">
          <div class="t-info">
            <strong>{{ t.description }}</strong>
            <span>{{ formatDate(t.transactionDate) }}</span>
            <span v-if="t.status === 'PENDING'" class="badge-pending">Pendente</span>
          </div>
          
          <div class="t-amount" :class="t.type.toLowerCase()">
            {{ t.type === 'INCOME' ? '+' : '-' }} {{ formatCurrency(t.amount) }}
          </div>
        </div>
      </div>
    </section>

    <ExpenseModal 
      :isOpen="isExpenseModalOpen" 
      :accounts="accountsList"
      :categories="categoriesList.filter(c => c.type === 'EXPENSE')"
      @close="isExpenseModalOpen = false"
      @save="handleSaveExpense"
    />

    <IncomeModal 
      :isOpen="isIncomeModalOpen" 
      :accounts="accountsList"
      :categories="categoriesList.filter(c => c.type === 'INCOME')"
      @close="isIncomeModalOpen = false"
      @save="handleSaveIncome"
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
/* Adicione junto ao .btn-expense que já criamos */
.btn-income { background-color: #2ed573; box-shadow: 0 4px 15px rgba(46, 213, 115, 0.4); }
/* Adicione esta cor para o novo botão */
.btn-manage { background-color: #3742fa; box-shadow: 0 4px 15px rgba(55, 66, 250, 0.4); }
.btn-manage-cat { background-color: #ffa502; box-shadow: 0 4px 15px rgba(255, 165, 2, 0.4); }
/* Estilos da Lista de Transações */
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
  /* Força o alinhamento do texto para a esquerda, matando a herança do Vite */
  text-align: left; 
  /* Força os blocos a grudarem na esquerda do eixo secundário (horizontal) */
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
/* Estilos das Abas (Tabs) */
.tabs-container {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f1f2f6; /* Linha cinza clarinha dividindo */
  padding-bottom: 0.5rem;
}

.tab-button {
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 600;
  color: #a4b0be; /* Cinza claro para abas inativas */
  cursor: pointer;
  padding: 0.5rem 0.5rem;
  position: relative;
  transition: color 0.2s;
}

.tab-button:hover {
  color: #2f3542;
}

/* O segredo da aba ativa: cor escura e linha azul/destaque embaixo */
.tab-button.active {
  color: #2f3542;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -0.65rem; /* Alinha com a borda do container */
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #3742fa; /* Azul (ou escolha a cor que preferir) */
  border-radius: 3px 3px 0 0;
}
</style>