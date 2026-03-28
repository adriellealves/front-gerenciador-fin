<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { api } from '../services/api' // Importamos o nosso "telefone" para o Java
  import ExpenseModal from '../components/ExpenseModal.vue'
  import IncomeModal from '../components/IncomeModal.vue'
  import { useRouter } from 'vue-router'
  const router = useRouter()
  
  // Estado inicial zerado (ou carregando)
  const userName = ref('Usuário') // Em breve buscaremos o nome também
  const currentBalance = ref(0)
  const monthlyIncome = ref(0)
  const monthlyExpense = ref(0)

  const isExpenseModalOpen = ref(false)
  const isIncomeModalOpen = ref(false)

  // 🚨 ATENÇÃO: Cole aqui o UUID real do seu usuário do banco de dados!
  const USER_ID = 'f273b341-bd6b-4306-a004-155d2f2e6716' 

  // Função que formata o dinheiro
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  // A MÁGICA DA INTEGRAÇÃO COMEÇA AQUI
  const loadDashboardData = async () => {
    try {
      // 1. Vai no Java e busca TODAS as contas do utilizador
      const accountsResponse = await api.get(`/accounts/user/${USER_ID}`)
      const accounts = accountsResponse.data
      
      // Usa o reduce para iterar por todas as contas e somar os saldos
      // O '0' no final é o valor inicial da soma
      const totalBalance = accounts.reduce((acumulador: number, account: any) => {
        return acumulador + account.balance
      }, 0)

      currentBalance.value = totalBalance

      // 2. Vai no Java e busca TODAS as transações do utilizador
      const transactionsResponse = await api.get(`/transactions/user/${USER_ID}`)
      const transactions = transactionsResponse.data

      // 3. O Frontend faz a matemática para separar o que é Receita e o que é Despesa
      let incomeTotal = 0
      let expenseTotal = 0

      transactions.forEach((t: any) => {
        // Como tipamos no Java, a API devolve exatamente as strings do Enum!
        if (t.type === 'INCOME') {
          incomeTotal += t.amount
        } else if (t.type === 'EXPENSE') {
          expenseTotal += t.amount
        }
      })

      // Atualiza a tela com os valores reais calculados
      monthlyIncome.value = incomeTotal
      monthlyExpense.value = expenseTotal

    } catch (error) {
      console.error("Erro ao buscar dados da API:", error)
      alert("Não foi possível conectar ao servidor Java. Ele está ligado?")
    }
  }

  // onMounted é acionado automaticamente pelo Vue assim que a tela é desenhada
  onMounted(() => {
    loadDashboardData()
  })

  // 🚨 ATENÇÃO: Pegue os UUIDs reais no seu DBeaver para o teste funcionar!
const ACCOUNT_ID = 'f70ef4b3-58da-498a-9e9f-8ea06b3519af'
const CATEGORY_EXPENSE_ID = '47464c4d-f214-4984-89cb-c17d4e0a6951'
const CATEGORY_INCOME_ID = 'd752d35f-631d-4147-879b-a0938ef94ac4'

const handleSaveExpense = async (expenseData: any) => {
  try {
    // Monta o pacote de dados exatamente como o Java espera (o seu DTO)
    const payload = {
      userId: USER_ID,
      accountId: ACCOUNT_ID,
      categoryId: CATEGORY_EXPENSE_ID,
      type: 'EXPENSE',
      amount: expenseData.amount,
      description: expenseData.description,
      transactionDate: expenseData.date,
      status: 'PAID'
    }

    // Dispara o POST para o Spring Boot!
    await api.post('/transactions', payload)

    isExpenseModalOpen.value = false
    
    // A MÁGICA: Recarrega o dashboard inteiro para buscar os novos saldos atualizados pelo Java
    await loadDashboardData() 
  } catch (error) {
    console.error("Erro ao salvar despesa:", error)
    alert("Erro ao salvar. Verifique se o backend está rodando e os UUIDs estão corretos.")
  }
}

const handleSaveIncome = async (incomeData: any) => {
  try {
    const payload = {
      userId: USER_ID,
      accountId: ACCOUNT_ID,
      categoryId: CATEGORY_INCOME_ID,
      type: 'INCOME',
      amount: incomeData.amount,
      description: incomeData.description,
      transactionDate: incomeData.date,
      status: 'PAID'
    }

    await api.post('/transactions', payload)

    isIncomeModalOpen.value = false
    await loadDashboardData() // Recarrega os dados fresquinhos do banco
  } catch (error) {
    console.error("Erro ao salvar receita:", error)
  }
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
        <button class="btn-action btn-income" @click="isIncomeModalOpen = true">+ Nova Receita</button>
        <button class="btn-action btn-expense" @click="isExpenseModalOpen = true">- Nova Despesa</button>
        
        <button class="btn-action btn-manage" @click="router.push('/accounts')">⚙️ Gerir Contas</button>

        <button class="btn-action btn-manage-cat" @click="router.push('/categories')">🏷️ Categorias</button>
      </div>
    </section>

    <ExpenseModal 
      :isOpen="isExpenseModalOpen" 
      @close="isExpenseModalOpen = false"
      @save="handleSaveExpense"
    />

    <IncomeModal 
      :isOpen="isIncomeModalOpen" 
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
</style>