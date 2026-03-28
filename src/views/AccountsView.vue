<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../services/api'
import { useRouter } from 'vue-router'

const router = useRouter()

// 🚨 ATENÇÃO: Cole aqui o mesmo UUID do seu utilizador!
const USER_ID = 'f273b341-bd6b-4306-a004-155d2f2e6716'

// Estado da lista de contas
const accounts = ref<any[]>([])

// NOVA VARIÁVEL: Controla se estamos a criar ou a editar
const editingId = ref<string | null>(null)

// Estado do formulário da nova conta
const newAccount = ref({
  name: '',
  type: 'CHECKING', // CHECKING (Corrente), SAVINGS (Poupança), INVESTMENT (Investimento)
  balance: 0
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// 1. Vai ao Java buscar todas as contas
const loadAccounts = async () => {
  try {
    const response = await api.get(`/accounts/user/${USER_ID}`)
    accounts.value = response.data
  } catch (error) {
    console.error("Erro ao carregar as contas:", error)
  }
}

// FUNÇÃO ATUALIZADA: Serve para Criar e Editar
const saveAccount = async () => {
  try {
    const payload = {
      userId: USER_ID,
      name: newAccount.value.name,
      type: newAccount.value.type,
      balance: newAccount.value.balance
    }

    if (editingId.value) {
      await api.put(`/accounts/${editingId.value}`, payload)
    } else {
      await api.post('/accounts', payload)
    }
    
    cancelEdit()
    await loadAccounts()
  } catch (error) {
    console.error("Erro ao guardar conta:", error)
    alert("Erro ao processar a conta.")
  }
}

// NOVA FUNÇÃO: Prepara a edição
const startEdit = (account: any) => {
  editingId.value = account.id
  newAccount.value = {
    name: account.name,
    type: account.type,
    balance: account.balance
  }
  window.scrollTo(0, 0)
}

// NOVA FUNÇÃO: Cancela a edição
const cancelEdit = () => {
  editingId.value = null
  newAccount.value = { name: '', type: 'CHECKING', balance: 0 }
}


// NOVA FUNÇÃO: Inativar a conta (Soft Delete)
const inactivateAccount = async (id: string) => {
  const confirmed = window.confirm("Deseja realmente inativar esta conta? Ela deixará de estar disponível para novas transações, mas o histórico será mantido.");
  
  if (!confirmed) return;

  try {
    // Fazemos um PATCH. O corpo (body) vai vazio ({}), conforme a sua API exige.
    await api.patch(`/accounts/${id}/inactivate`, {});
    
    // Atualiza a lista para refletir o novo estado
    await loadAccounts();
  } catch (error: any) {
    console.error("Erro ao inativar conta:", error);
    alert("Não foi possível inativar a conta.");
  }
}

// Ciclo de vida: carrega os dados mal o ecrã seja aberto
onMounted(() => {
  loadAccounts()
})
</script>

<template>
  <div class="accounts-container">
    <header class="header">
      <div>
        <h1>Gestão de Contas 🏦</h1>
        <p>Adicione ou visualize as suas contas bancárias.</p>
      </div>
      <button class="btn-back" @click="router.push('/')">Voltar ao Dashboard</button>
    </header>

    <div class="main-content">
      <section class="create-section">
        <h2>{{ editingId ? '✏️ Editar Conta' : 'Nova Conta' }}</h2>
        <form @submit.prevent="saveAccount" class="account-form">
          <div class="form-group">
            <label>Nome da Instituição (ex: Nubank, Banco CTT)</label>
            <input type="text" v-model="newAccount.name" required />
          </div>
          
          <div class="form-group">
            <label>Tipo de Conta</label>
            <select v-model="newAccount.type" required>
              <option value="CHECKING">Conta Corrente</option>
              <option value="SAVINGS">Conta Poupança</option>
              <option value="INVESTMENT">Investimento</option>
            </select>
          </div>

          <div class="form-group">
            <label>Saldo Atual (R$)</label>
            <input type="number" step="0.01" v-model="newAccount.balance" required />
            <small v-if="editingId" style="color: #e67e22;">⚠️ Dica: Prefira ajustar o saldo via transações.</small>
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button type="button" v-if="editingId" class="btn-cancel" @click="cancelEdit" style="flex: 1; background: #f1f2f6; border: none; border-radius: 6px; cursor: pointer;">Cancelar</button>
            <button type="submit" class="btn-save" style="flex: 2;">{{ editingId ? 'Atualizar Conta' : 'Criar Conta' }}</button>
          </div>
        </form>
      </section>

      <section class="list-section">
        <h2>As Minhas Contas</h2>
        <div v-if="accounts.length === 0" class="empty-state">
          Não tem contas registadas.
        </div>
        <div class="accounts-grid" v-else>
          <div v-for="account in accounts" :key="account.id" class="account-card">
            <div class="account-info">
              <h3>{{ account.name }}</h3>
              <span class="badge">{{ account.type }}</span>
            </div>
            <div class="account-balance">
              {{ formatCurrency(account.balance) }}
            </div>
            <div class="card-actions" style="display: flex; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid #eee; padding-top: 0.5rem;">
              <button @click="startEdit(account)" style="flex: 1; background: none; border: 1px solid #ddd; padding: 0.4rem; border-radius: 4px; cursor: pointer; color: #555;">✏️ Editar</button>
              <button @click="inactivateAccount(account.id)" style="flex: 1; background: none; border: 1px solid #f1c40f; padding: 0.4rem; border-radius: 4px; cursor: pointer; color: #f39c12;">⏸️ Inativar</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.accounts-container { max-width: 1000px; margin: 0 auto; padding: 2rem; font-family: sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 2rem; }
.btn-back { background: #f1f2f6; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: bold; }
.btn-back:hover { background: #dfe4ea; }

.main-content { display: grid; grid-template-columns: 1fr 2fr; gap: 2rem; }
@media (max-width: 768px) { .main-content { grid-template-columns: 1fr; } }

.create-section { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #eaeaea; box-shadow: 0 4px 6px rgba(0,0,0,0.02); height: fit-content; }
.account-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
input, select { padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; }
.btn-save { background: #3742fa; color: white; border: none; padding: 0.75rem; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 1rem; }
.btn-save:hover { background: #2f3542; }

.accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
.account-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #eaeaea; display: flex; flex-direction: column; gap: 1rem; }
.account-info h3 { margin: 0; font-size: 1.1rem; }
.badge { display: inline-block; background: #eccc68; color: #2f3542; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: bold; width: fit-content; margin-top: 0.5rem; }
.account-balance { font-size: 1.5rem; font-weight: bold; color: #2ed573; }
.empty-state { color: #747d8c; font-style: italic; }
</style>